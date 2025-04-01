import pika
import json
import time
import os
import sys
import logging
from datetime import datetime
from typing import Dict, Any
import signal
import threading

# Configure logging first so we see everything
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("judge-worker")

# Add path to backend to be able to import modules
logger.info("Adding backend path to sys.path")
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
sys.path.append(backend_path)
logger.info(f"Added backend path: {backend_path}")

# Log the environment variables for debugging
logger.info(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'Not set')}")
logger.info(f"RABBITMQ_HOST: {os.getenv('RABBITMQ_HOST', 'Not set')}")
logger.info(f"PYTHONPATH: {os.getenv('PYTHONPATH', 'Not set')}")

try:
    logger.info("Importing submission_crud")
    from app.crud import submission as submission_crud
    logger.info("Importing problem_crud")
    from app.crud import problem as problem_crud
    logger.info("Importing SessionLocal")
    from app.db.session import SessionLocal
    logger.info("Importing default_router")
    from app.evaluation import default_router
    logger.info("Importing SubmissionStatus")
    from app.db.models.submission import SubmissionStatus
    logger.info("All imports successful")
except Exception as e:
    logger.error(f"Failed to import modules: {e}", exc_info=True)
    sys.exit(1)

# Global health status
health_status = {
    "connected": False,
    "last_message_processed": None,
    "messages_processed": 0,
    "errors_encountered": 0,
    "started_at": datetime.now().isoformat()
}

# Set to True to initiate a graceful shutdown
shutdown_flag = False

def signal_handler(sig, frame):
    """Handle termination signals for graceful shutdown"""
    global shutdown_flag
    logger.info(f"Received signal {sig}, initiating graceful shutdown")
    shutdown_flag = True

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def process_submission(submission_id: int):
    """
    Process a submission: set status to processing, find errors,
    and update status to appealing or completed based on errors.
    Sets status to evaluation_error on failure.
    """
    db = SessionLocal()
    try:
        # 1. Update submission status to processing
        logger.info(f"Processing submission {submission_id}")
        updated_submission = submission_crud.update_submission_status(db, submission_id, SubmissionStatus.processing)
        if not updated_submission:
            logger.error(f"Submission {submission_id} not found for processing.")
            return

        # 2. Get submission and associated problem details
        submission = updated_submission
        problem = problem_crud.get_problem(db, submission.problem_id)
        if not problem:
            logger.error(f"Problem {submission.problem_id} associated with submission {submission_id} not found.")
            # Mark submission as error since we can't proceed without problem context
            submission_crud.update_submission_status(db, submission_id, SubmissionStatus.evaluation_error)
            health_status["errors_encountered"] += 1
            return

        # 3. Use evaluator to find errors
        logger.info(f"Finding errors for submission {submission_id} using default evaluator.")
        try:
            # Call updated find_errors with full context
            errors = default_router.find_errors(submission=submission, problem=problem)
            logger.info(f"Found {len(errors)} errors for submission {submission_id}")

            # 4. Update submission status based on errors found
            # Score/Feedback are not determined at this stage
            logger.info(f"Updating submission {submission_id} after initial error finding.")
            submission_crud.update_submission_after_initial_evaluation(
                db=db,
                submission_id=submission_id,
                errors=errors
            )
            logger.info(f"Initial processing complete for submission {submission_id}.")

        except Exception as e:
            # Error during find_errors or the subsequent DB update
            logger.error(f"Error during evaluation phase for submission {submission_id}: {type(e).__name__}: {str(e)}", exc_info=True)
            submission_crud.update_submission_status(db, submission_id, SubmissionStatus.evaluation_error)
            health_status["errors_encountered"] += 1

    except Exception as e:
        # Catch-all for errors like DB connection issues before evaluation starts
        logger.error(f"General error processing submission {submission_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        try:
            # Try to mark as evaluation_error if possible
            submission_crud.update_submission_status(db, submission_id, SubmissionStatus.evaluation_error)
        except Exception as inner_e:
            logger.error(f"Failed to update submission status to evaluation_error for {submission_id}: {str(inner_e)}")
        health_status["errors_encountered"] += 1
    finally:
        if db:
            db.close()

    health_status["messages_processed"] += 1
    health_status["last_message_processed"] = datetime.now().isoformat()

def callback(ch, method, properties, body):
    """
    Process messages from RabbitMQ
    """
    try:
        message = json.loads(body)
        logger.info(f"Received message: {message}")
        
        submission_id = message.get('submission_id')
        if not submission_id:
            logger.error("Message doesn't contain submission_id")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
            
        # Process the submission in a separate thread
        process_thread = threading.Thread(target=process_submission, args=(submission_id,))
        process_thread.start()
        process_thread.join(timeout=300)  # 5 minute timeout for processing
        
        if process_thread.is_alive():
            logger.error(f"Processing of submission {submission_id} timed out after 5 minutes")
            health_status["errors_encountered"] += 1
            # Let the thread continue in the background
        
        # Acknowledge the message - we've tried our best to process it
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse message: {body}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"Error in callback: {type(e).__name__}: {str(e)}", exc_info=True)
        # Requeue the message if it wasn't a parsing error
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        health_status["errors_encountered"] += 1

def main():
    """
    Main function to start the worker
    """
    global health_status
    max_retries = 10
    retry_delay = 5
    connection = None
    channel = None
    
    logger.info("Starting judge worker...")
    
    # Start health check server in a separate thread
    def start_health_check():
        from http.server import HTTPServer, BaseHTTPRequestHandler
        
        class HealthCheckHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == '/health':
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(health_status).encode())
                else:
                    self.send_response(404)
                    self.end_headers()
        
        server = HTTPServer(('0.0.0.0', 8080), HealthCheckHandler)
        logger.info("Health check server started on port 8080")
        server.serve_forever()
    
    health_thread = threading.Thread(target=start_health_check, daemon=True)
    health_thread.start()
    
    while not shutdown_flag:
        for attempt in range(max_retries):
            if shutdown_flag:
                break
                
            try:
                logger.info(f"Connecting to RabbitMQ (attempt {attempt+1}/{max_retries})...")
                
                # Configure connection parameters with retry settings
                connection_params = pika.ConnectionParameters(
                    host=os.getenv('RABBITMQ_HOST', 'rabbitmq'),
                    port=int(os.getenv('RABBITMQ_PORT', 5672)),
                    virtual_host=os.getenv('RABBITMQ_VHOST', '/'),
                    credentials=pika.PlainCredentials(
                        os.getenv('RABBITMQ_USER', 'guest'),
                        os.getenv('RABBITMQ_PASSWORD', 'guest')
                    ),
                    connection_attempts=3,
                    retry_delay=2,
                    socket_timeout=5
                )
                
                connection = pika.BlockingConnection(connection_params)
                channel = connection.channel()
                
                # Declare queue
                queue_name = 'evaluation_queue'
                channel.queue_declare(queue=queue_name, durable=True)
                
                # Only consume one message at a time
                channel.basic_qos(prefetch_count=1)
                
                # Set up consumer
                channel.basic_consume(queue=queue_name, on_message_callback=callback)
                
                logger.info("Connected to RabbitMQ, waiting for messages...")
                health_status["connected"] = True
                
                # Start consuming messages
                try:
                    channel.start_consuming()
                except KeyboardInterrupt:
                    channel.stop_consuming()
                    break
                
                # If we reach here, we need to reconnect
                break
                
            except pika.exceptions.AMQPConnectionError as e:
                health_status["connected"] = False
                logger.warning(f"Failed to connect to RabbitMQ (attempt {attempt+1}): {str(e)}")
                if attempt < max_retries - 1 and not shutdown_flag:
                    logger.info(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    logger.error(f"Failed to connect to RabbitMQ after {max_retries} attempts")
                    time.sleep(10)  # Longer wait before starting over
            except Exception as e:
                health_status["connected"] = False
                logger.error(f"Unexpected error: {type(e).__name__}: {str(e)}", exc_info=True)
                time.sleep(retry_delay)
            finally:
                # Close connection if it exists and is open
                if connection and not connection.is_closed:
                    try:
                        connection.close()
                    except Exception:
                        pass
    
    # Graceful shutdown
    logger.info("Shutting down judge worker...")
    if channel and channel.is_open:
        try:
            channel.stop_consuming()
        except Exception:
            pass
    
    if connection and not connection.is_closed:
        try:
            connection.close()
        except Exception:
            pass
    
    logger.info("Judge worker stopped")

if __name__ == "__main__":
    main()

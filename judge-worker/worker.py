import pika
import json
import time
import os
import sys

# Add the backend app path to the Python path to import db modules
# This relies on the PYTHONPATH set in the Dockerfile
# Use absolute imports relative to PYTHONPATH
from app.db.session import SessionLocal # Assuming SessionLocal is the factory
from app.db import models # Import your SQLAlchemy models

# --- Placeholder Evaluation Logic (Moved from backend) ---
def perform_evaluation(submission_id: int, db_session):
    """Placeholder evaluation logic."""
    print(f" [x] Received submission {submission_id}. Simulating evaluation...")
    time.sleep(5) # Simulate 5 second evaluation
    
    submission = db_session.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if submission:
        try:
            submission.status = models.submission.SubmissionStatus.completed
            submission.score = 85 # Mock score
            submission.feedback = "# Mock Feedback\n\nLooks mostly correct, but check step 3."
            
            # Create errors as a fresh list of new dictionaries
            submission.errors = [
                {
                    "id": "mock-err-1",
                    "type": "logical",
                    "location": "Step 3",
                    "description": "Minor logical gap found.",
                    "severity": "low",
                    "status": "active" # Make sure it starts as active
                }
            ]
            
            # Explicitly add the submission to ensure SQLAlchemy detects all changes
            db_session.add(submission)
            db_session.commit()
            print(f" [x] Completed evaluation for submission {submission_id}")
            return True
        except Exception as e:
            print(f"Error updating submission {submission_id} in DB: {e}")
            db_session.rollback() # Rollback on error
            return False
        finally:
            # Ensure session is closed, though SessionLocal might handle this
            # db_session.close()
            pass 
    else:
        print(f" [!] Error: Submission {submission_id} not found in DB.")
        return False

# --- RabbitMQ Consumer Logic ---
def main():
    # TODO: Get connection params from env vars
    rabbitmq_host = os.environ.get('RABBITMQ_HOST', 'rabbitmq')
    queue_name = 'evaluation_queue'

    connection = None
    while connection is None:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
            print(" [*] Connected to RabbitMQ")
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Waiting for RabbitMQ connection... ({e})")
            time.sleep(5)

    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    print(f' [*] Waiting for messages in {queue_name}. To exit press CTRL+C')

    def callback(ch, method, properties, body):
        print(f" [x] Received {body}")
        try:
            message = json.loads(body)
            submission_id = message.get('submission_id')

            if submission_id is not None:
                # Get a new database session for each task
                db = SessionLocal()
                try:
                    success = perform_evaluation(submission_id, db)
                    if success:
                        # Acknowledge message only if evaluation and DB update were successful
                        ch.basic_ack(delivery_tag=method.delivery_tag)
                        print(f" [x] Task for submission {submission_id} acknowledged.")
                    else:
                        # Negative acknowledgement or requeue? Depends on error type.
                        # For now, let's NACK without requeue if evaluation fails definitively.
                        print(f" [!] Task for submission {submission_id} failed, NACKing without requeue.")
                        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                finally:
                    db.close()
            else:
                print(" [!] Invalid message format received.")
                # Acknowledge invalid messages so they don't block the queue
                ch.basic_ack(delivery_tag=method.delivery_tag)

        except json.JSONDecodeError:
            print(" [!] Failed to decode JSON message.")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f" [!] An unexpected error occurred: {e}")
            # Decide on ack/nack based on the error - potentially requeue? 
            # For safety, let's NACK without requeue for unexpected errors.
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            
    # Ensure fair dispatching if multiple workers are run
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue_name, on_message_callback=callback) # Auto-ack is False by default

    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)

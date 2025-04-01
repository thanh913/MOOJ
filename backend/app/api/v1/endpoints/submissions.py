import pika
import json
import logging
import time
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, TYPE_CHECKING
import copy

from app import crud, schemas
from app.db import models
from app.db.session import get_db, SessionLocal
from app.db.models.submission import SubmissionStatus
from app.crud import submission as submission_crud
from app.evaluation.image_to_latex import convert_image_to_latex
from app.evaluation import default_router

if TYPE_CHECKING:
    from app.db.models.problem import Problem # Import for type hint

router = APIRouter()
logger = logging.getLogger(__name__)

# Maximum allowed appeal attempts per submission
MAX_APPEAL_ATTEMPTS = 5

def submission_to_dict(submission: models.Submission) -> Dict[str, Any]:
    """Convert a Submission model to a dictionary for API response"""
    # Ensure status is converted to string if it's an Enum
    status_str = submission.status.value if isinstance(submission.status, SubmissionStatus) else submission.status
    return {
        "id": submission.id,
        "problem_id": submission.problem_id,
        "solution_text": submission.solution_text,
        "submitted_at": submission.submitted_at,
        "status": status_str, # Return string representation
        "score": submission.score,
        "errors": submission.errors or [],
        "appeal_attempts": submission.appeal_attempts # Include appeal attempts
    }

# Function to publish task to RabbitMQ that can be mocked in tests
def publish_to_rabbitmq(message: Dict[str, Any], host: str = 'rabbitmq', retries: int = 3) -> bool:
    """
    Publish a message to RabbitMQ for async processing
    
    Args:
        message: Message to publish
        host: RabbitMQ hostname
        retries: Number of connection retries before giving up
        
    Returns:
        True if message was successfully published, False otherwise
    """
    # Track connection state for global health check
    for attempt in range(retries):
        try:
            logger.info(f"Attempting to publish message for submission {message.get('submission_id')} to RabbitMQ (attempt {attempt+1}/{retries})")
            connection_params = pika.ConnectionParameters(
                host=host, 
                port=5672,
                connection_attempts=2,
                retry_delay=1,
                socket_timeout=5
            )
            
            connection = pika.BlockingConnection(connection_params)
            channel = connection.channel()

            queue_name = 'evaluation_queue'
            channel.queue_declare(queue=queue_name, durable=True)  # Durable queue

            channel.basic_publish(
                exchange='',
                routing_key=queue_name,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=pika.DeliveryMode.Persistent  # Make message persistent
                )
            )
            logger.info(f"Successfully published submission {message.get('submission_id')} to {queue_name}")
            connection.close()
            return True
        except pika.exceptions.AMQPConnectionError as e:
            logger.warning(f"RabbitMQ connection error on attempt {attempt+1}: {str(e)}")
            # Only sleep if we're going to retry
            if attempt < retries - 1:
                time.sleep(1)  # Brief delay before retrying
        except Exception as e:
            logger.error(f"Error publishing to RabbitMQ: {type(e).__name__}: {str(e)}", exc_info=True)
            # For non-connection errors, don't retry
            break
    
    logger.error(f"Failed to publish submission {message.get('submission_id')} to RabbitMQ after {retries} attempts")
    return False

@router.get("/", response_model=List[schemas.Submission])
def get_submissions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    problem_id: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Get all submissions with pagination, optionally filtered by problem_id
    """
    try:
        if problem_id:
            submissions = crud.submission.get_submissions_for_problem(db, problem_id, skip, limit)
            logger.info(f"Retrieved {len(submissions)} submissions for problem {problem_id}")
        else:
            submissions = crud.submission.get_submissions(db, skip, limit)
            logger.info(f"Retrieved {len(submissions)} submissions")
        
        return [submission_to_dict(s) for s in submissions]
    except Exception as e:
        logger.error(f"Error retrieving submissions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve submissions: {str(e)}"
        )

@router.get("/health", response_model=Dict[str, Any])
def check_evaluator_health():
    """
    Check the health of the evaluator system.
    Returns information about the configured evaluator and its status.
    """
    try:
        logger.info("Checking evaluator health")
        # Get the default evaluator info
        evaluator_info = default_router.get_evaluator_info()
        
        # Try to establish a connection to RabbitMQ
        rabbitmq_status = "healthy"
        rabbitmq_details = {}
        
        try:
            # Use a shorter timeout for health check
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host='rabbitmq',
                    blocked_connection_timeout=5
                )
            )
            
            # Declare the queue
            channel = connection.channel()
            queue_name = 'evaluation_queue'
            queue_info = channel.queue_declare(queue=queue_name, durable=True)
            
            # Get queue length
            queue_length = queue_info.method.message_count
            
            rabbitmq_details = {
                "queue_name": queue_name,
                "queue_length": queue_length
            }
            
            connection.close()
        except Exception as e:
            rabbitmq_status = "unhealthy"
            rabbitmq_details = {"error": str(e)}
            logger.warning(f"RabbitMQ health check failed: {e}")
        
        # Return the combined health information
        health_info = {
            "status": "healthy" if rabbitmq_status == "healthy" else "degraded",
            "evaluator": evaluator_info,
            "rabbitmq": {
                "status": rabbitmq_status,
                "details": rabbitmq_details
            }
        }
        
        logger.info(f"Evaluator health check completed: {health_info['status']}")
        return health_info
    except Exception as e:
        logger.error(f"Evaluator health check failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )

@router.post("/", response_model=schemas.Submission, status_code=202)
async def create_submission_endpoint(
    problem_id: int = Form(...),
    solution_text: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a new submission for a problem.
    
    Args:
        problem_id: ID of the problem being solved
        solution_text: LaTeX solution text (optional)
        image_file: Image file to be processed with OCR (optional)
        db: Database session
        
    Returns:
        Newly created submission object
    
    One of solution_text or image_file must be provided.
    """
    logger.info(f"Processing submission for problem {problem_id}")
    
    if not solution_text and not image_file:
        logger.error("Neither solution_text nor image_file provided")
        raise HTTPException(
            status_code=400,
            detail="Either solution_text or image_file must be provided",
        )
    
    # Handle image file upload and OCR processing
    if image_file and not solution_text:
        try:
            logger.info(f"Processing image file: {image_file.filename}")
            
            # Read the file
            contents = await image_file.read()
            
            # Convert image to LaTeX using OCR
            solution_text = convert_image_to_latex(contents)
            
            if not solution_text:
                logger.error("OCR processing failed to extract LaTeX")
                raise HTTPException(
                    status_code=400,
                    detail="Failed to extract LaTeX from the provided image. Please check image quality or submit LaTeX directly.",
                )
            
            logger.info("Successfully converted image to LaTeX")
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error processing image: {str(e)}",
            )
    
    # Create submission in the database
    try:
        submission_in = schemas.SubmissionCreate(
            problem_id=problem_id,
            solution_text=solution_text,
        )
        
        # Create the submission record
        db_submission = crud.submission.create_submission(db=db, submission_in=submission_in)
        logger.info(f"Created submission with ID {db_submission.id}")
        
        # Prepare submission for async processing
        submission_dict = {
            "submission_id": db_submission.id,
            "problem_id": problem_id,
            "solution_text": solution_text,
        }
        
        # Try to publish to RabbitMQ but don't fail if it's not available
        rabbitmq_success = publish_to_rabbitmq(submission_dict)
        
        if not rabbitmq_success:
            logger.warning(f"Failed to publish submission {db_submission.id} to RabbitMQ. Will process synchronously.")
            
            try:
                # Process synchronously as a fallback
                # Get a new session to avoid conflicts with the main request session
                fallback_db = SessionLocal()
                
                try:
                    # Use the evaluator directly
                    errors = default_router.find_errors(problem_id, solution_text)
                    success = default_router.evaluate(problem_id, solution_text, errors)
                    score = 100 if success else max(0, 100 - (len(errors) * 10))
                    
                    # Update the submission
                    updated_submission = crud.submission.update_submission_evaluation(
                        fallback_db,
                        submission_id=db_submission.id,
                        status=SubmissionStatus.COMPLETED,
                        score=score,
                        errors=errors
                    )
                    logger.info(f"Processed submission {db_submission.id} synchronously with score {score}")
                except Exception as eval_error:
                    logger.error(f"Error in fallback evaluation for submission {db_submission.id}: {str(eval_error)}", exc_info=True)
                    updated_submission = crud.submission.update_submission_status(fallback_db, db_submission.id, SubmissionStatus.FAILED)
            except Exception as fallback_error:
                logger.error(f"Failed even in fallback processing: {str(fallback_error)}", exc_info=True)
            finally:
                fallback_db.close()
        else:
            logger.info(f"Successfully published submission {db_submission.id} to RabbitMQ")
        
        return submission_to_dict(db_submission)
    except Exception as e:
        logger.error(f"Error creating submission: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error creating submission: {str(e)}",
        )

@router.get("/{submission_id}/", response_model=schemas.Submission)
def read_submission(
    submission_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve a specific submission by ID, including its status and results if completed."""
    logger.info(f"Fetching submission with ID {submission_id}")
    db_submission = crud.submission.get_submission(db, submission_id=submission_id)
    if db_submission is None:
        logger.warning(f"Submission with ID {submission_id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    logger.info(f"Successfully retrieved submission {submission_id} with status {db_submission.status}")
    return db_submission

@router.post("/{submission_id}/appeals", response_model=schemas.Submission)
def appeal_submission_batch(
    submission_id: int,
    appeal_batch: schemas.MultiAppealCreate,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Submit a batch of appeals for errors in a submission."""
    logger.info(f"Processing appeal batch for submission {submission_id} with {len(appeal_batch.appeals)} items.")
    
    # 1. Get submission and problem context
    submission = crud.submission.get_submission(db, submission_id=submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    
    problem = db.query(models.Problem).filter(models.Problem.id == submission.problem_id).first()
    if not problem:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Associated problem not found")

    # 2. Check Status and Appeal Limits
    if submission.status != SubmissionStatus.appealing:
        logger.warning(f"Appeal rejected: Submission {submission_id} is not in 'appealing' state (current: {submission.status})")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Submission is not in an appealable state.")

    if submission.appeal_attempts >= MAX_APPEAL_ATTEMPTS:
        logger.warning(f"Appeal rejected: Submission {submission_id} has reached the maximum appeal limit ({MAX_APPEAL_ATTEMPTS}).")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Maximum appeal attempts reached.")

    # 3. Prepare for Appeal Processing
    try:
        # Increment attempt count
        submission = crud.submission.increment_appeal_attempts(db, submission_id)
        if not submission: # Check if increment failed
            raise Exception(f"Failed to increment appeal attempts for submission {submission_id}")
        
        # Create list of error IDs with 'appealing' status for batch update
        appealed_error_ids = [a.error_id for a in appeal_batch.appeals]
        # Need ErrorDetail structure for update_errors_batch
        errors_to_mark_appealing: List[Dict] = []
        valid_appeal_requests: List[schemas.ErrorAppeal] = []
        submission_errors_map = {e.get('id'): e for e in (submission.errors or []) if isinstance(e, dict)}

        for appeal_req in appeal_batch.appeals:
            # Check for required justification (text or image)
            if not appeal_req.justification and not appeal_req.image_justification:
                logger.warning(f"Skipping appeal for error {appeal_req.error_id}: no justification provided")
                continue
                
            # Check if error exists and is appealable (active or rejected)
            if appeal_req.error_id in submission_errors_map and submission_errors_map[appeal_req.error_id].get('status') in ['active', 'rejected']:
                errors_to_mark_appealing.append({'id': appeal_req.error_id, 'status': 'appealing'})
                valid_appeal_requests.append(appeal_req) # Only process valid ones
            else:
                logger.warning(f"Skipping appeal for error {appeal_req.error_id}: not found or not active/rejected in submission {submission_id}")
        
        if not valid_appeal_requests:
            raise HTTPException(status_code=400, detail="No valid active errors selected for appeal.")

        # Update error statuses to 'appealing'
        submission = crud.submission.update_errors_batch(db, submission_id, errors_to_mark_appealing)
        if not submission: # Should exist, but check
            raise Exception("Failed to mark errors as appealing after retrieving submission.")
        
        logger.info(f"Marked {len(valid_appeal_requests)} errors as 'appealing' for submission {submission_id}")

        # 4. Process Valid Appeals Batch via Evaluator
        logger.info(f"Routing appeal batch for submission {submission_id} to evaluator.")
        default_router.process_appeal(
            appeals=valid_appeal_requests, # Use the filtered list 
            submission=submission, 
            problem=problem
        )
        
        # 6. Re-evaluate Submission (using the in-memory modified submission object)
        logger.info(f"Re-evaluating submission {submission_id} after appeals.")
        evaluation_result = default_router.evaluate(submission=submission, problem=problem)

        # 7. Update Submission state (score, feedback, errors)
        submission = crud.submission.update_submission_after_appeal(
            db=db,
            submission_id=submission_id,
            evaluation_result=evaluation_result,
            updated_errors=submission.errors # Pass the modified errors list
        )
        if not submission:
            raise Exception("Failed to update submission score/feedback/errors after re-evaluation.")

        # 8. Determine FINAL status based on attempts and remaining potentially appealable errors
        # An error is still potentially subject to appeal if it's 'active' or 'rejected'
        # (assuming rejected errors can be re-appealed if attempts remain)
        has_remaining_appealable_errors = any(
            e.get('status') in ['active', 'rejected']
            for e in (submission.errors or []) if isinstance(e, dict)
        )
        
        final_status = SubmissionStatus.appealing # Default to stay appealing

        # Transition to 'completed' only if attempts are used up OR if there are absolutely no more errors that could be appealed
        if submission.appeal_attempts >= MAX_APPEAL_ATTEMPTS or not has_remaining_appealable_errors:
            final_status = SubmissionStatus.completed
            logger.info(f"Setting final status to 'completed' for submission {submission_id}. Attempts: {submission.appeal_attempts}, Has appealable errors: {has_remaining_appealable_errors}")
        else:
             logger.info(f"Submission {submission_id} remains 'appealing'. Attempts: {submission.appeal_attempts}, Has appealable errors: {has_remaining_appealable_errors}")

        # 9. Update the final status separately
        final_submission = crud.submission.update_submission_status(db, submission_id, final_status)
        if not final_submission:
             raise Exception(f"Failed to set final status {final_status} for submission {submission_id}")

        logger.info(f"Appeal batch processing complete for submission {submission_id}. Final status: {final_submission.status}")
        return submission_to_dict(final_submission)

    except HTTPException as http_exc: # Re-raise HTTP exceptions directly
        raise http_exc
    except Exception as e:
        db.rollback() # Ensure rollback on any exception during the process
        logger.error(f"Appeal batch processing failed for submission {submission_id}: {str(e)}", exc_info=True)
        # Optionally try to revert status if appropriate, complex error handling needed.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Appeal processing failed: {str(e)}"
        )

@router.post("/{submission_id}/accept", response_model=schemas.Submission)
def accept_score(
    submission_id: int,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Accept the current score and finalize the submission."""
    logger.info(f"Processing accept score request for submission {submission_id}.")
    
    # Get submission 
    submission = crud.submission.get_submission(db, submission_id=submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    
    # Check if submission is in appealing state
    if submission.status != SubmissionStatus.appealing:
        logger.warning(f"Accept score rejected: Submission {submission_id} is not in 'appealing' state (current: {submission.status})")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Submission is not in an appealable state.")
    
    try:
        # Update submission status to completed
        updated_submission = crud.submission.update_submission_status(
            db=db,
            submission_id=submission_id,
            status=SubmissionStatus.completed
        )
        
        if not updated_submission:
            raise Exception(f"Failed to update status for submission {submission_id}")
        
        logger.info(f"Successfully accepted score for submission {submission_id}")
        return submission_to_dict(updated_submission)
        
    except Exception as e:
        logger.error(f"Failed to accept score for submission {submission_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept score: {str(e)}"
        ) 
import pika
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any # Using List for potential future GET /submissions

from app import crud, schemas
from app.db import models
from app.db.session import get_db
from app.evaluation import convert_image_to_latex
# No longer need to import run_evaluation

router = APIRouter()

# Function to publish task to RabbitMQ that can be mocked in tests
def publish_to_rabbitmq(message: Dict[str, Any], host: str = 'rabbitmq') -> bool:
    """Publish a message to RabbitMQ for async processing"""
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=host))
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
        print(f" [x] Sent submission {message.get('submission_id')} to {queue_name}")
        connection.close()
        return True
    except Exception as e:
        print(f"Error publishing to RabbitMQ: {e}")
        return False

@router.post("/", response_model=schemas.Submission, status_code=status.HTTP_202_ACCEPTED)
async def create_submission_endpoint(
    problem_id: int = Form(...),
    solution_text: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Receive a new submission, create it, and publish evaluation task to queue.
    Accepts either a solution_text or an image_file.
    """
    # Validate input - we need either solution_text or image_file but not both
    if solution_text is None and image_file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either solution_text or image_file must be provided"
        )
    
    final_solution_text = solution_text
    
    # If an image was uploaded, process it with OCR
    if image_file is not None:
        try:
            # Read the image file
            image_bytes = await image_file.read()
            
            # Convert image to LaTeX using OCR
            final_solution_text = convert_image_to_latex(image_bytes)
            
            if not final_solution_text or final_solution_text.strip() == "":
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Could not extract LaTeX from the uploaded image"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Image processing failed: {str(e)}"
            )
    
    # Create submission object for database
    submission_in = schemas.SubmissionCreate(
        problem_id=problem_id,
        solution_text=final_solution_text
    )

    # Create the initial submission record
    db_submission = crud.submission.create_submission(db=db, submission_in=submission_in)
    
    # Publish task to RabbitMQ
    message = {
        'submission_id': db_submission.id,
        # Add other relevant info if needed, e.g., problem_id, maybe solution_text itself
    }
    
    if not publish_to_rabbitmq(message):
        # For now, let's raise an internal server error if queuing fails.
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to queue submission for evaluation")
    
    # Return the created submission record (status will be pending initially)
    # Use HTTP 202 Accepted to indicate processing has started
    return db_submission

@router.get("/{submission_id}", response_model=schemas.Submission)
def read_submission(
    submission_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve a specific submission by ID, including its status and results if completed."""
    db_submission = crud.submission.get_submission(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return db_submission

# TODO later: Add endpoint for appeals POST /submissions/{id}/appeals
@router.post("/{submission_id}/appeals", response_model=schemas.Submission)
def appeal_submission_error(
    submission_id: int,
    appeal_in: schemas.AppealCreate,
    db: Session = Depends(get_db),
):
    """Submit an appeal for a specific error in a submission."""
    updated_submission = crud.submission.process_appeal(
        db=db, submission_id=submission_id, appeal_in=appeal_in
    )
    if not updated_submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission or specific active error not found for appeal",
        )
    # Return the submission with the updated error status
    return updated_submission 
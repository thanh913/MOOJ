from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.api.schemas.submission import (
    SubmissionCreate, SubmissionResponse, SubmissionUpdate
)
from app.api.repositories import SubmissionRepository, ProblemRepository
from app.db.session import get_db
from app.core.auth import get_current_user, get_current_active_user
from app.db.models import User
from app.evaluation import convert_image_to_latex, evaluate_submission

router = APIRouter()

async def process_submission_background(
    submission_id: int, 
    problem_statement: str,
    db: Session
):
    """
    Background task to process a submission:
    1. If image type, convert to LaTeX
    2. Evaluate the LaTeX
    3. Update the submission with results
    """
    # Get the submission
    submission = SubmissionRepository.get_submission(db, submission_id)
    if not submission:
        return
        
    try:
        # Update status to processing
        SubmissionRepository.update_submission(
            db, 
            submission_id, 
            SubmissionUpdate(status="processing")
        )
        
        latex_content = submission.content
        
        # If submission is an image, convert to LaTeX
        if submission.content_type == "image":
            converted_latex = convert_image_to_latex(submission.content)
            if not converted_latex:
                raise Exception("Failed to convert image to LaTeX")
                
            latex_content = converted_latex
            
            # Update with LaTeX content
            SubmissionRepository.update_submission(
                db, 
                submission_id, 
                SubmissionUpdate(latex_content=latex_content)
            )
        
        # Evaluate the submission
        score, feedback = evaluate_submission(problem_statement, latex_content)
        
        # Update the submission with results
        SubmissionRepository.update_submission(
            db, 
            submission_id, 
            SubmissionUpdate(
                score=score,
                feedback=feedback,
                status="completed"
            )
        )
    except Exception as e:
        # Update status to error
        SubmissionRepository.update_submission(
            db, 
            submission_id, 
            SubmissionUpdate(
                status="error",
                feedback=f"Error processing submission: {str(e)}"
            )
        )

@router.post("", response_model=SubmissionResponse)
async def create_submission(
    submission: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new submission and enqueue processing."""
    # Verify the problem exists and is published (or user is moderator/admin)
    problem = ProblemRepository.get_problem(db, submission.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
        
    if not problem.is_published and current_user.role == "user":
        raise HTTPException(status_code=403, detail="Problem is not published")
        
    # Validate submission type
    if submission.content_type not in ["direct_input", "image"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid content type. Must be 'direct_input' or 'image'"
        )
    
    # Create the submission
    db_submission = SubmissionRepository.create_submission(
        db, submission, current_user.id
    )
    
    # Process the submission in the background
    background_tasks.add_task(
        process_submission_background,
        db_submission.id,
        problem.statement,
        db
    )
    
    return db_submission

@router.get("", response_model=List[SubmissionResponse])
async def get_submissions(
    problem_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get submissions for the current user, optionally filtered by problem_id."""
    # Regular users can only see their own submissions
    user_id = None
    if current_user.role == "user":
        user_id = current_user.id
        
    return SubmissionRepository.get_submissions(
        db, 
        user_id=user_id, 
        problem_id=problem_id,
        skip=skip, 
        limit=limit
    )

@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific submission."""
    # Regular users can only see their own submissions
    user_id = None
    if current_user.role == "user":
        user_id = current_user.id
        
    submission = SubmissionRepository.get_submission(db, submission_id, user_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    return submission 
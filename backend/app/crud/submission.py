from sqlalchemy.orm import Session
from typing import Optional, List # Added List

from app.db.models.submission import Submission, SubmissionStatus
from app.schemas.submission import SubmissionCreate, AppealCreate
# Add SubmissionUpdate later when needed
# from app.schemas.submission import SubmissionUpdate 


def create_submission(db: Session, *, submission_in: SubmissionCreate) -> Submission:
    """Create a new submission record."""
    # Note: We are not associating with a user_id in this simplified version
    db_submission = Submission(
        problem_id=submission_in.problem_id,
        solution_text=submission_in.solution_text,
        status=SubmissionStatus.pending # Start as pending
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    # TODO: Trigger placeholder evaluation asynchronously here later
    return db_submission

def get_submission(db: Session, submission_id: int) -> Optional[Submission]:
    """Get a single submission by ID."""
    return db.query(Submission).filter(Submission.id == submission_id).first()

def get_submissions_for_problem(db: Session, problem_id: int, skip: int = 0, limit: int = 100) -> List[Submission]:
    """Get submissions for a specific problem (useful later)."""
    return db.query(Submission).filter(Submission.problem_id == problem_id).offset(skip).limit(limit).all()

def process_appeal(db: Session, submission_id: int, appeal_in: AppealCreate) -> Optional[Submission]:
    """Process an appeal for a specific error in a submission."""
    submission = get_submission(db, submission_id)
    
    if not submission or not submission.errors:
        return None

    # Make a deep copy of the errors to ensure SQLAlchemy detects the change
    current_errors = submission.errors.copy() if submission.errors else []
    new_errors = []
    
    for error in current_errors:
        # Create a new dictionary for each error to ensure changes are properly tracked
        error_copy = error.copy()
        
        if error_copy.get("id") == appeal_in.error_id and error_copy.get("status") == "active":
            # Update the copy with the new status
            error_copy["status"] = "appealed"
            
        new_errors.append(error_copy)
    
    # Always assign the new errors list to ensure SQLAlchemy detects it as a change
    submission.errors = new_errors
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission

# --- Functions to be added later --- 

# def update_submission_status(db: Session, submission_id: int, status: SubmissionStatus) -> Optional[Submission]:
#     ...

# def update_submission_evaluation(db: Session, submission_id: int, evaluation_data: schemas.SomeEvaluationSchema) -> Optional[Submission]:
#     ... 
from sqlalchemy.orm import Session
import logging
from typing import Optional, List, Dict, Any
import copy
from sqlalchemy.orm.attributes import flag_modified

from app.db.models.submission import Submission, SubmissionStatus
from app.schemas.submission import SubmissionCreate, ErrorAppeal, ErrorDetail
from app.evaluation.interfaces import EvaluationResult # Use TypedDict for result structure

logger = logging.getLogger(__name__)

def create_submission(db: Session, *, submission_in: SubmissionCreate) -> Submission:
    """Create a new submission record."""
    try:
        db_submission = Submission(
            problem_id=submission_in.problem_id,
            solution_text=submission_in.solution_text,
            status=SubmissionStatus.pending # Always start as pending
        )
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        logger.info(f"Created submission ID: {db_submission.id} for problem: {submission_in.problem_id}")
        return db_submission
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create submission for problem {submission_in.problem_id}: {str(e)}", exc_info=True)
        raise

def get_submission(db: Session, submission_id: int) -> Optional[Submission]:
    """Get a single submission by ID."""
    try:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            logger.debug(f"Found submission ID: {submission_id}, status: {submission.status}")
        else:
            logger.debug(f"Submission ID: {submission_id} not found")
        return submission
    except Exception as e:
        logger.error(f"Error retrieving submission {submission_id}: {str(e)}", exc_info=True)
        raise

def get_submissions(db: Session, skip: int = 0, limit: int = 20) -> List[Submission]:
    """Get all submissions with pagination."""
    try:
        submissions = db.query(Submission).order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()
        logger.debug(f"Retrieved {len(submissions)} submissions (skip={skip}, limit={limit})")
        return submissions
    except Exception as e:
        logger.error(f"Error retrieving submissions: {str(e)}", exc_info=True)
        raise

def get_submissions_for_problem(db: Session, problem_id: int, skip: int = 0, limit: int = 100) -> List[Submission]:
    """Get submissions for a specific problem."""
    try:
        submissions = db.query(Submission).filter(Submission.problem_id == problem_id).order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()
        logger.debug(f"Retrieved {len(submissions)} submissions for problem {problem_id}")
        return submissions
    except Exception as e:
        logger.error(f"Error retrieving submissions for problem {problem_id}: {str(e)}", exc_info=True)
        raise

def update_submission_status(db: Session, submission_id: int, status: SubmissionStatus) -> Optional[Submission]:
    """Update the status of a submission."""
    try:
        submission = get_submission(db, submission_id)
        if not submission:
            logger.warning(f"Cannot update status: Submission {submission_id} not found")
            return None
        
        previous_status = submission.status
        # Avoid accidentally changing away from a final state if logic elsewhere dictates it
        if submission.status != status:
            submission.status = status
            db.add(submission)
            db.commit()
            db.refresh(submission)
            logger.info(f"Updated submission {submission_id} status from {previous_status} to {status}")
        else:
            logger.debug(f"Submission {submission_id} status already {status}, no update performed.")
        return submission
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update status for submission {submission_id}: {str(e)}", exc_info=True)
        raise

def update_submission_after_initial_evaluation(db: Session, submission_id: int, errors: List[ErrorDetail], score: Optional[int] = None) -> Optional[Submission]:
    """Update submission after the initial find_errors call from the worker."""
    try:
        submission = get_submission(db, submission_id)
        if not submission:
            logger.warning(f"Cannot update initial evaluation: Submission {submission_id} not found")
            return None

        submission.errors = errors # Update errors list
        
        # Determine status based on errors
        # Logic might need refinement based on how 'severity' is defined/used
        has_significant_errors = any(e.get('severity', False) for e in errors) # Example check

        if has_significant_errors:
            submission.status = SubmissionStatus.appealing
            submission.score = score if score is not None else 0 # Default score for appealable state
        else:
            submission.status = SubmissionStatus.completed
            submission.score = score if score is not None else 100 # Default score for completed state

        db.add(submission)
        db.commit()
        db.refresh(submission)
        logger.info(f"Updated submission {submission_id} after initial eval: status={submission.status}, score={submission.score}, errors={len(errors)}")
        return submission
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update initial evaluation for submission {submission_id}: {str(e)}", exc_info=True)
        # Attempt to set status to evaluation_error if initial update fails
        try:
            update_submission_status(db, submission_id, SubmissionStatus.evaluation_error)
        except Exception as inner_e:
            logger.error(f"Failed even to set evaluation_error status for {submission_id}: {inner_e}")
        raise e # Re-raise original exception

def update_submission_after_appeal(db: Session, submission_id: int, evaluation_result: EvaluationResult, updated_errors: List[ErrorDetail]) -> Optional[Submission]:
    """Update a submission after appeal processing and re-evaluation. Does NOT set final status."""
    try:
        submission = get_submission(db, submission_id)
        if not submission:
            logger.warning(f"Cannot update after appeal: Submission {submission_id} not found")
            return None
        
        # Update fields from the final evaluation result
        submission.score = evaluation_result.get("score")
        submission.feedback = evaluation_result.get("feedback")
        submission.errors = updated_errors # Store the list with updated statuses
        # submission.status = SubmissionStatus.completed # DO NOT set status here, endpoint logic will decide
        
        # Explicitly mark the 'errors' field as modified for SQLAlchemy
        flag_modified(submission, "errors")
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        logger.info(f"Updated submission {submission_id} after appeal/re-eval: score={submission.score}")
        return submission
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update submission {submission_id} after appeal: {str(e)}", exc_info=True)
        raise

def increment_appeal_attempts(db: Session, submission_id: int) -> Optional[Submission]:
    """Increment the appeal attempt counter for a submission."""
    try:
        submission = get_submission(db, submission_id)
        if not submission:
            logger.warning(f"Cannot increment appeal attempts: Submission {submission_id} not found")
            return None
            
        submission.appeal_attempts += 1
        db.add(submission)
        db.commit()
        db.refresh(submission)
        logger.info(f"Incremented appeal attempts for submission {submission_id} to {submission.appeal_attempts}")
        return submission
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to increment appeal attempts for {submission_id}: {str(e)}", exc_info=True)
        raise

def update_errors_batch(db: Session, submission_id: int, errors_with_new_status: List[ErrorDetail]) -> Optional[Submission]:
    """ Efficiently update the status of multiple errors within a submission's error list."""
    try:
        submission = get_submission(db, submission_id)
        if not submission or not submission.errors:
            logger.warning(f"Cannot update errors batch: Submission {submission_id} not found or has no errors")
            return None
            
        # Create a map for quick lookup
        errors_to_update = {e['id']: e for e in errors_with_new_status}
        
        # Make a deep copy to ensure SQLAlchemy detects the change
        current_errors = copy.deepcopy(submission.errors)
        updated_list = []
        updated_count = 0
        
        for error in current_errors:
            error_id = error.get('id')
            if error_id in errors_to_update:
                # Only update the status field from the input
                new_status = errors_to_update[error_id].get('status')
                if new_status:
                    error['status'] = new_status
                    updated_count += 1
            updated_list.append(error)
            
        if updated_count > 0:
            submission.errors = updated_list
            db.add(submission)
            db.commit()
            db.refresh(submission)
            logger.info(f"Batch updated {updated_count} error statuses for submission {submission_id}")
        else:
            logger.info(f"No matching errors found for batch update in submission {submission_id}")
            
        return submission
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to batch update errors for {submission_id}: {str(e)}", exc_info=True)
        raise

# Note: The old `update_error` and `process_appeal` might be deprecated or removed
# as the new flow handles updates differently (via evaluator modifying list
# or using `update_errors_batch`). Leaving them for now. 

# Placeholder for legacy update_error (may become redundant)
# def update_error(...) 

# Placeholder for legacy process_appeal (likely redundant)
# def process_appeal(...) 
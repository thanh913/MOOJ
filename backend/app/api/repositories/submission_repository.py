from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime

from ...db.models import Submission, Problem, User
from ..schemas.submission import SubmissionCreate, SubmissionUpdate


class SubmissionRepository:
    @staticmethod
    def create_submission(db: Session, submission: SubmissionCreate, user_id: int) -> Submission:
        """Create a new submission."""
        db_submission = Submission(
            problem_id=submission.problem_id,
            user_id=user_id,
            content_type=submission.content_type,
            content=submission.content
        )
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)
        return db_submission

    @staticmethod
    def get_submission(db: Session, submission_id: int, user_id: Optional[int] = None) -> Optional[Submission]:
        """Get a specific submission, optionally filtered by user_id."""
        query = db.query(Submission).filter(Submission.id == submission_id)
        
        if user_id is not None:
            query = query.filter(Submission.user_id == user_id)
            
        return query.first()

    @staticmethod
    def get_submissions(
        db: Session, 
        user_id: Optional[int] = None, 
        problem_id: Optional[int] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Submission]:
        """Get submissions, optionally filtered by user_id and/or problem_id."""
        query = db.query(Submission)
        
        if user_id is not None:
            query = query.filter(Submission.user_id == user_id)
            
        if problem_id is not None:
            query = query.filter(Submission.problem_id == problem_id)
            
        return query.order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def update_submission(
        db: Session, 
        submission_id: int, 
        submission_update: SubmissionUpdate
    ) -> Optional[Submission]:
        """Update a submission."""
        db_submission = db.query(Submission).filter(Submission.id == submission_id).first()
        
        if db_submission is None:
            return None
            
        update_data = submission_update.dict(exclude_unset=True)
        
        if "status" in update_data and update_data["status"] == "completed":
            update_data["processed_at"] = datetime.now()
            
        for key, value in update_data.items():
            setattr(db_submission, key, value)
            
        db.commit()
        db.refresh(db_submission)
        return db_submission

    @staticmethod
    def delete_submission(db: Session, submission_id: int) -> bool:
        """Delete a submission."""
        db_submission = db.query(Submission).filter(Submission.id == submission_id).first()
        
        if db_submission is None:
            return False
            
        db.delete(db_submission)
        db.commit()
        return True 
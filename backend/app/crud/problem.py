from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.models.problem import Problem
from app.schemas.problem import ProblemCreate

def get_problem(db: Session, problem_id: int) -> Optional[Problem]:
    """Get a single problem by ID."""
    return db.query(Problem).filter(Problem.id == problem_id).first()

def get_problems(db: Session, skip: int = 0, limit: int = 100) -> List[Problem]:
    """Get a list of problems."""
    return db.query(Problem).offset(skip).limit(limit).all()

def create_problem(db: Session, *, problem_in: ProblemCreate) -> Problem:
    """Create a new problem."""
    db_problem = Problem(**problem_in.model_dump())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

# Add update_problem and delete_problem later if needed 
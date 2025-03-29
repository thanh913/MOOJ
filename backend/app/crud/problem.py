from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.models.problem import Problem
from app.schemas.problem import ProblemCreate, ProblemUpdate

def get_problem(db: Session, problem_id: int) -> Optional[Problem]:
    """Get a single problem by ID."""
    return db.query(Problem).filter(Problem.id == problem_id).first()

def get_problems(db: Session, skip: int = 0, limit: int = 100) -> List[Problem]:
    """Get a list of problems."""
    return db.query(Problem).offset(skip).limit(limit).all()

def create_problem(db: Session, problem: ProblemCreate, creator_id: int) -> Problem:
    """Create a new problem."""
    db_problem = Problem(**problem.dict(), created_by_id=creator_id)
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

def update_problem(db: Session, db_problem: Problem, problem_in: ProblemUpdate) -> Problem:
    """Update an existing problem."""
    update_data = problem_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(db_problem, field, update_data[field])
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

def delete_problem(db: Session, problem_id: int) -> Optional[Problem]:
    """Delete a problem."""
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if db_problem:
        db.delete(db_problem)
        db.commit()
    return db_problem 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.db import models
from app.db.session import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Problem])
def read_problems(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve a list of problems.
    - Anyone can view published problems.
    - Moderators/Admins can view all problems (including unpublished drafts).
    """
    # TODO: Implement filtering based on published status and user role
    # For now, return all problems
    problems = crud.problem.get_problems(db, skip=skip, limit=limit)
    return problems

@router.get("/{problem_id}", response_model=schemas.Problem)
def read_problem(
    problem_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve a specific problem by ID.
    - Anyone can view published problems.
    - Moderators/Admins can view unpublished drafts.
    """
    db_problem = crud.problem.get_problem(db, problem_id=problem_id)
    if db_problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    return db_problem 
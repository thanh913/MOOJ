from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, schemas
from app.db import models
from app.db.session import get_db
from app.core.auth import get_current_user, get_current_moderator_or_admin

router = APIRouter()

@router.get("/", response_model=List[schemas.Problem])
def read_problems(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Optional[models.User] = Depends(get_current_user) # Optional auth
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

@router.post("/", response_model=schemas.Problem, status_code=status.HTTP_201_CREATED)
def create_problem(
    problem_in: schemas.ProblemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_moderator_or_admin)
):
    """
    Create a new problem. (Moderator/Admin only)
    """
    problem = crud.problem.create_problem(db=db, problem=problem_in, creator_id=current_user.id)
    return problem

@router.get("/{problem_id}", response_model=schemas.Problem)
def read_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user) # Optional auth
):
    """
    Retrieve a specific problem by ID.
    - Anyone can view published problems.
    - Moderators/Admins can view unpublished drafts.
    """
    db_problem = crud.problem.get_problem(db, problem_id=problem_id)
    if db_problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # TODO: Add logic to check if user can view (published or moderator/admin)
    # if not db_problem.is_published and (not current_user or not (current_user.role in [UserRole.moderator, UserRole.admin])):
    #     raise HTTPException(status_code=403, detail="Not authorized to view this problem")

    return db_problem

@router.put("/{problem_id}", response_model=schemas.Problem)
def update_problem(
    problem_id: int,
    problem_in: schemas.ProblemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_moderator_or_admin)
):
    """
    Update a problem. (Moderator/Admin only)
    """
    db_problem = crud.problem.get_problem(db, problem_id=problem_id)
    if db_problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Optional: Add check if the current user is the creator or an admin?
    # For now, any moderator/admin can update any problem.
    
    updated_problem = crud.problem.update_problem(db=db, db_problem=db_problem, problem_in=problem_in)
    return updated_problem

@router.delete("/{problem_id}", response_model=schemas.Problem)
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_moderator_or_admin)
):
    """
    Delete a problem. (Moderator/Admin only)
    """
    deleted_problem = crud.problem.delete_problem(db=db, problem_id=problem_id)
    if deleted_problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    return deleted_problem 
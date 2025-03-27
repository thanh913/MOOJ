from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core.auth import get_current_user, get_current_active_user
from ..schemas import ProblemResponse, ProblemCreate, ProblemUpdate, UserResponse
from ..repositories import ProblemRepository
from ...db.session import get_db

router = APIRouter()

@router.post("/", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED)
def create_problem(
    problem: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_active_user)
):
    # Only moderators and admins can create problems
    if current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return ProblemRepository.create_problem(db, problem, current_user.id)

@router.get("/", response_model=List[ProblemResponse])
def read_problems(
    skip: int = 0,
    limit: int = 100,
    difficulty: Optional[int] = None,
    topics: Optional[List[str]] = Query(None),
    is_published: bool = True,
    db: Session = Depends(get_db),
    current_user: Optional[UserResponse] = Depends(get_current_user)
):
    # If not logged in or not a moderator/admin, only show published problems
    # Otherwise, filter based on parameters
    if not current_user or current_user.role not in ["moderator", "admin"]:
        is_published = True
    
    return ProblemRepository.get_problems(
        db, 
        skip=skip, 
        limit=limit,
        difficulty=difficulty,
        topics=topics,
        is_published=is_published
    )

@router.get("/{problem_id}", response_model=ProblemResponse)
def read_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[UserResponse] = Depends(get_current_user)
):
    db_problem = ProblemRepository.get_problem(db, problem_id)
    if db_problem is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    # Check if problem is published or user is moderator/admin
    if not db_problem.is_published and (not current_user or current_user.role not in ["moderator", "admin"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    return db_problem

@router.put("/{problem_id}", response_model=ProblemResponse)
def update_problem(
    problem_id: int,
    problem_update: ProblemUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_active_user)
):
    # Check permissions
    if current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if problem exists
    existing_problem = ProblemRepository.get_problem(db, problem_id)
    if existing_problem is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    updated_problem = ProblemRepository.update_problem(db, problem_id, problem_update)
    return updated_problem

@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_active_user)
):
    # Check permissions
    if current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if problem exists and delete
    success = ProblemRepository.delete_problem(db, problem_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found"
        )
    
    return None 
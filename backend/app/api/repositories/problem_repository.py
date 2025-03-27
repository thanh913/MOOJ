from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ...db.models import Problem
from ..schemas.problem import ProblemCreate, ProblemUpdate

class ProblemRepository:
    @staticmethod
    def create_problem(db: Session, problem: ProblemCreate, created_by: int) -> Problem:
        db_problem = Problem(
            title=problem.title,
            statement=problem.statement,
            difficulty=problem.difficulty,
            topics=problem.topics,
            is_published=problem.is_published,
            created_by=created_by
        )
        db.add(db_problem)
        db.commit()
        db.refresh(db_problem)
        return db_problem
    
    @staticmethod
    def get_problems(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        difficulty: Optional[int] = None,
        topics: Optional[List[str]] = None,
        created_by: Optional[int] = None,
        is_published: Optional[bool] = None
    ) -> List[Problem]:
        query = db.query(Problem)
        
        if difficulty is not None:
            query = query.filter(Problem.difficulty == difficulty)
        
        if created_by is not None:
            query = query.filter(Problem.created_by == created_by)
            
        if is_published is not None:
            query = query.filter(Problem.is_published == is_published)
            
        # For topics, we need a more complex filter if provided
        if topics and len(topics) > 0:
            for topic in topics:
                query = query.filter(Problem.topics.contains([topic]))
        
        return query.order_by(desc(Problem.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_problem(db: Session, problem_id: int) -> Optional[Problem]:
        return db.query(Problem).filter(Problem.id == problem_id).first()
    
    @staticmethod
    def update_problem(db: Session, problem_id: int, problem_update: ProblemUpdate) -> Optional[Problem]:
        db_problem = ProblemRepository.get_problem(db, problem_id)
        if not db_problem:
            return None
        
        update_data = problem_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_problem, key, value)
            
        db.commit()
        db.refresh(db_problem)
        return db_problem
    
    @staticmethod
    def delete_problem(db: Session, problem_id: int) -> bool:
        db_problem = ProblemRepository.get_problem(db, problem_id)
        if not db_problem:
            return False
        
        db.delete(db_problem)
        db.commit()
        return True 
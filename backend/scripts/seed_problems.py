#!/usr/bin/env python3
"""
Seed script for adding the initial set of math problems to the MOOJ database.
This script updates existing problems or adds new ones if needed.

Usage:
    python -m scripts.seed_problems
"""
import os
import sys

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import inspect
from app.db.session import SessionLocal, engine
from app.db.base_class import Base
from app.db.models.problem import Problem
from app.schemas.problem import ProblemCreate, ProblemBase
from app.crud.problem import create_problem

# Define the set of problems to seed
PROBLEMS = [
    {
        "id": 1,
        "title": "Minimizing a Sum",
        "statement": "Find the minimum value of the function \\( f(x) = x^2 + \\frac{16}{x} \\) for \\( x > 0 \\). Justify your answer using calculus, explaining how you confirmed it's a minimum.",
        "difficulty": 25,  # Using 10x scale for more granularity (2.5)
        "topics": ["calculus", "optimization", "derivatives"],
        "is_published": True
    },
    {
        "id": 2,
        "title": "Gradient Descent Step",
        "statement": "Consider the simple quadratic loss function \\( L(w) = (w - 5)^2 \\). If you are currently at the point \\( w = 1 \\) and perform one step of gradient descent using a learning rate \\( \\alpha = 0.1 \\), what will the new value of \\( w \\) be? Explain the role of the derivative \\( \\frac{dL}{dw} \\) in determining the direction and magnitude of this step.",
        "difficulty": 20,  # 2.0
        "topics": ["calculus", "machine learning", "optimization", "gradient descent", "derivatives"],
        "is_published": True
    },
    {
        "id": 3,
        "title": "Probability Density Normalization",
        "statement": "A certain random variable \\( X \\) representing model error has a probability density function (PDF) defined as \\( f(x) = k(1 - x^2) \\) for \\( -1 \\le x \\le 1 \\), and \\( f(x) = 0 \\) otherwise. Find the value of the constant \\( k \\) that makes \\( f(x) \\) a valid PDF. Briefly explain the property of PDFs that requires this calculation.",
        "difficulty": 25,  # 2.5
        "topics": ["calculus", "probability", "integrals", "pdf", "machine learning"],
        "is_published": True
    },
    {
        "id": 4,
        "title": "Divisibility by Three",
        "statement": "Prove that for any integer \\( n \\), the number \\( n^3 - n \\) is always divisible by 3. Explain your reasoning using properties of integers or modular arithmetic.",
        "difficulty": 20,  # 2.0
        "topics": ["number theory", "divisibility", "proof", "modular arithmetic"],
        "is_published": True
    },
    {
        "id": 5,
        "title": "Pigeonhole Principle Basics",
        "statement": "In a group of 13 people, must there be at least two people whose birthday falls in the same month? Explain your answer using the Pigeonhole Principle.",
        "difficulty": 20,  # 2.0
        "topics": ["combinatorics", "pigeonhole principle", "logic"],
        "is_published": True
    },
    {
        "id": 6,
        "title": "Rectangle to Triangle",
        "statement": "A rectangle has perimeter 24 cm. What is the maximum possible area of a triangle that can be formed using three of the four vertices of this rectangle? Prove your answer is indeed the maximum possible.",
        "difficulty": 25,  # 2.5
        "topics": ["geometry", "triangle inequality", "optimization"],
        "is_published": True
    }
]


def create_tables():
    """Create database tables if they don't exist."""
    try:
        inspector = inspect(engine)
        if not inspector.has_table("problems"):
            print("Creating database tables...")
            # Import all models that inherit from Base
            from app.db import models  # This imports all models
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully.")
        else:
            print("Database tables already exist.")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise


def update_or_create_problems(db: Session) -> None:
    """Update existing problems or create new ones."""
    updated_count = 0
    created_count = 0
    problems_list = []
    
    try:
        # Get existing problem IDs
        existing_problem_ids = {p.id for p in db.query(Problem.id).all()}
        
        for problem_data in PROBLEMS:
            problem_id = problem_data.get("id")
            
            # Check if problem exists
            if problem_id in existing_problem_ids:
                # Update existing problem
                problem = db.query(Problem).filter(Problem.id == problem_id).first()
                for key, value in problem_data.items():
                    if key != "id":  # Don't update ID
                        setattr(problem, key, value)
                updated_count += 1
            else:
                # Create new problem
                problem_in = ProblemCreate(**{k: v for k, v in problem_data.items() if k != "id"})
                problem = Problem(**problem_in.model_dump())
                if problem_id:
                    problem.id = problem_id
                db.add(problem)
                created_count += 1
            
            problems_list.append(problem)
        
        db.commit()
        print(f"Successfully updated {updated_count} and created {created_count} problems:")
        for problem in problems_list:
            db.refresh(problem)
            status = "Updated" if problem.id in existing_problem_ids else "Created"
            print(f"  - {status} ID {problem.id}: {problem.title} (Difficulty: {problem.difficulty/10:.1f})")
    except Exception as e:
        db.rollback()
        print(f"Error while updating/creating problems: {e}")
        raise


if __name__ == "__main__":
    try:
        # Ensure tables exist
        create_tables()
        
        # Connect to the database
        db = SessionLocal()
        
        # Update or create problems
        print("\nUpdating problems database...")
        update_or_create_problems(db)
        print("\nProblem seeding completed successfully.")
    except Exception as e:
        print(f"\nError during problem seeding: {e}")
        sys.exit(1)
    finally:
        if 'db' in locals():
            db.close() 
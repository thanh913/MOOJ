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
from app.db.models.submission import Submission # Import Submission model
from app.schemas.problem import ProblemCreate, ProblemBase
from app.crud.problem import create_problem

# Define the set of problems to seed
PROBLEMS = [
    {
        "id": 1,
        "title": "Euler Polynomial Composite",
        "statement": "Find the smallest positive integer \\( n \\) such that the value \\( P(n) = n^2 + n + 41 \\) is a composite number.",
        "difficulty": 1.5,
        "topics": ["number theory", "primes"],
        "is_published": True
    },
    {
        "id": 2,
        "title": "Min Value with Constraint",
        "statement": "Let \\( a \\) and \\( b \\) be positive real numbers such that \\( a+b=1 \\). Find the minimum value of the expression \\( \\left(1 + \\frac{1}{a}\\right)\\left(1 + \\frac{1}{b}\\right) \\).",
        "difficulty": 2.0,
        "topics": ["algebra", "inequalities", "AM-GM"],
        "is_published": True
    },
    {
        "id": 3,
        "title": "Integer Solutions (Bounded)",
        "statement": "Find the number of non-negative integer solutions to the equation \\( x_1 + x_2 + x_3 = 15 \\) subject to the constraints \\( x_1 \\le 5 \\), \\( x_2 \\le 7 \\), and \\( x_3 \\le 8 \\).",
        "difficulty": 4.0,
        "topics": ["combinatorics", "counting", "inclusion-exclusion"],
        "is_published": True
    },
    {
        "id": 4,
        "title": "Linear Regression Loss Gradient",
        "statement": "Consider the squared error loss function \\( L(w_0, w_1) = \\frac{1}{2m} \\sum_{i=1}^{m} (y^{(i)} - (w_0 + w_1 x^{(i)}))^2 \\) for a simple linear regression model \\( \\hat{y} = w_0 + w_1 x \\) and a dataset \\( \\{(x^{(i)}, y^{(i)})\\}_{i=1}^m \\). Calculate the partial derivative of \\( L \\) with respect to the weight \\( w_1 \\), i.e., \\( \\frac{\\partial L}{\\partial w_1} \\).",
        "difficulty": 3.0,
        "topics": ["machine learning", "calculus", "linear regression"],
        "is_published": True
    },
    {
        "id": 5,
        "title": "Expected Value (Biased Coin)",
        "statement": "A random variable \\( X \\) represents the number of heads obtained in \\( 3 \\) independent flips of a biased coin, where the probability of heads on a single flip is \\( p = 0.6 \\). Calculate the expected value \\( E[X] \\).",
        "difficulty": 1.5,
        "topics": ["machine learning", "probability", "expected value"],
        "is_published": True
    },
    {
        "id": 6,
        "title": "Bayes' Theorem Classification",
        "statement": "A diagnostic test for a rare disease has \\( 99 \\)% sensitivity (true positive rate, \\( P(\\text{Test Positive} | \\text{Disease}) = 0.99 \\)) and \\( 95 \\)% specificity (true negative rate, \\( P(\\text{Test Negative} | \\text{No Disease}) = 0.95 \\)). The disease affects \\( 0.1 \\)% of the population (\\( P(\\text{Disease}) = 0.001 \\)). If a randomly selected person tests positive, what is the probability they actually have the disease, \\( P(\\text{Disease} | \\text{Test Positive}) \\)? Use Bayes' Theorem: \\( P(A|B) = \\frac{P(B|A)P(A)}{P(B)} \\).",
        "difficulty": 2.0,
        "topics": ["machine learning", "probability", "Bayes' theorem"],
        "is_published": True
    }
]

def drop_tables():
    """Drop database tables if they exist."""
    try:
        print("Dropping existing tables (if any)...")
        # Import all models that inherit from Base to ensure all tables are considered
        from app.db import models # Ensure models are loaded
        # Drop tables in reverse dependency order if needed, or drop all
        # For simplicity, dropping all. Ensure Base knows about all tables.
        Base.metadata.drop_all(bind=engine)
        print("Tables dropped successfully.")
    except Exception as e:
        print(f"Error dropping tables: {e}")
        # Don't raise here, allow create_tables to attempt creation

def create_tables():
    """Create database tables if they don't exist."""
    try:
        inspector = inspect(engine)
        # Check for a specific table, e.g., problems, as an indicator
        if not inspector.has_table("problems"):
            print("Creating database tables...")
            # Ensure all models are loaded before creating tables
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
        # --- Start: Delete existing problems ---
        deleted_count = db.query(Problem).delete()
        db.commit()
        print(f"Successfully deleted {deleted_count} existing problems.")
        # --- End: Delete existing problems ---

        # Get existing problem IDs (should be empty now, but kept for consistency)
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
        # Adjust log message slightly as all problems are 'created' after deletion
        print(f"Successfully created {created_count} problems:")
        for problem in problems_list:
            db.refresh(problem)
            # Status will always be 'Created' now after the initial deletion
            status = "Created"
            print(f"  - {status} ID {problem.id}: {problem.title} (Difficulty: {problem.difficulty:.1f})")
    except Exception as e:
        db.rollback()
        print(f"Error while updating/creating problems: {e}")
        raise


if __name__ == "__main__":
    try:
        # Drop tables first
        drop_tables()
        
        # Ensure tables exist (will create them after dropping)
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
"""Seed database with initial sample data for testing."""
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models.problem import Problem

def create_sample_problem(db: Session):
    """Create a sample problem for testing."""
    # Check if problem already exists
    existing = db.query(Problem).filter(Problem.id == 1).first()
    if existing:
        print(f"Sample problem already exists with ID: {existing.id}")
        return existing.id
    
    # Create a new sample problem with correct field names
    problem = Problem(
        title="Sample Problem",
        statement="Prove that x + 1 = 2 when x = 1.",
        difficulty=3.0,
        topics=["algebra", "proof"],
        is_published=True
    )
    
    db.add(problem)
    db.commit()
    db.refresh(problem)
    print(f"Created sample problem with ID: {problem.id}")
    return problem.id

def seed_data():
    """Add sample data to the database."""
    db = SessionLocal()
    try:
        problem_id = create_sample_problem(db)
        print(f"Seeded database with sample problem (ID: {problem_id})")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data() 
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.base_class import Base

# Define Enum for submission status
# Inherit from str to ensure compatibility with Pydantic/FastAPI serialization
class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False, index=True)
    # Add user_id later if needed when re-introducing auth
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    solution_text = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.pending, nullable=False, index=True)
    
    # Fields to store evaluation results (nullable initially)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True) # Can store markdown
    # Store errors as JSON array of objects (matching Error Object schema)
    errors = Column(JSON, nullable=True)
    
    # Relationship back to the problem
    problem = relationship("Problem", back_populates="submissions")

    # Relationship back to the user (add later)
    # user = relationship("User", back_populates="submissions")
    
    # Relationship to appeals (if needed later)
    # appeals = relationship("Appeal", back_populates="submission")

    def __repr__(self):
        return f"<Submission(id={self.id}, problem_id={self.problem_id}, status={self.status})>" 
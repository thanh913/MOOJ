from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.db.base_class import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    statement = Column(Text, nullable=False)
    difficulty = Column(Integer, nullable=False)
    topics = Column(JSON)  # Use JSON for list data
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Remove creator relationship and foreign key
    # created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # creator = relationship("User", back_populates="problems")

    # Keep submission relationship if it exists
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan") 
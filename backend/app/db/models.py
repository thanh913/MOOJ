from sqlalchemy import Boolean, Column, String, Integer, DateTime, Enum, Text, ForeignKey, ARRAY, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)  # Can be null for OAuth users
    google_id = Column(String, unique=True, nullable=True, index=True)
    role = Column(String, default="user")  # user, moderator, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    statement = Column(Text)
    difficulty = Column(Float)  # 1-9 difficulty level (float values)
    topics = Column(JSON)  # Array of mathematical topics stored as JSON
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_published = Column(Boolean, default=False) 

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    content_type = Column(String)  # "direct_input" or "image"
    content = Column(Text)  # Direct input or image file path
    latex_content = Column(Text, nullable=True)  # LaTeX representation for images
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, processing, completed, error
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True) 
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.db import User
from app.core import get_password_hash, verify_password
from app.api.schemas import UserCreate

class UserRepository:
    def create_user(self, db: Session, user_data: UserCreate) -> User:
        """Create a new user."""
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            password_hash=hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get a user by email."""
        return db.query(User).filter(User.email == email).first()
    
    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """Get a user by username."""
        return db.query(User).filter(User.username == username).first()
    
    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        user = self.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
    
    def update_last_login(self, db: Session, user: User) -> User:
        """Update the user's last login time."""
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
        
    def update_user_role(self, db: Session, user_id: int, role: str) -> Optional[User]:
        """Update a user's role."""
        user = self.get_user_by_id(db, user_id)
        if not user:
            return None
        
        if role not in ["user", "moderator", "admin"]:
            raise ValueError(f"Invalid role: {role}")
            
        user.role = role
        db.commit()
        db.refresh(user)
        return user 
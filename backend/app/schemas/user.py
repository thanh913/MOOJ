from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.db.models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.user

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    last_login: Optional[datetime] = None

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        orm_mode = True

# Properties to return to client (excluding password)
class User(UserInDBBase):
    pass

# Properties stored in DB (including password hash)
class UserInDB(UserInDBBase):
    password_hash: str 
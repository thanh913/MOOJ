from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from .user import User  # Import User schema to represent the creator

# Shared properties
class ProblemBase(BaseModel):
    title: str
    statement: str
    difficulty: int
    topics: Optional[List[str]] = None
    is_published: bool = False

# Properties to receive via API on creation
class ProblemCreate(ProblemBase):
    pass

# Properties to receive via API on update
class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    statement: Optional[str] = None
    difficulty: Optional[int] = None
    topics: Optional[List[str]] = None
    is_published: Optional[bool] = None

# Properties shared by models stored in DB
class ProblemInDBBase(ProblemBase):
    id: int
    created_by_id: int
    created_at: datetime
    creator: User  # Include creator details

    class Config:
        orm_mode = True

# Properties to return to client
class Problem(ProblemInDBBase):
    pass

# Properties stored in DB
class ProblemInDB(ProblemInDBBase):
    pass 
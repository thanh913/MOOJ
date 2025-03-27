from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# Base Problem Schema
class ProblemBase(BaseModel):
    title: str
    statement: str
    difficulty: int  # 1-9
    topics: List[str]
    is_published: bool = False

# Schema for creating a problem
class ProblemCreate(ProblemBase):
    pass

# Schema for updating a problem
class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    statement: Optional[str] = None
    difficulty: Optional[int] = None
    topics: Optional[List[str]] = None
    is_published: Optional[bool] = None

# Schema for problem response
class ProblemResponse(ProblemBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        orm_mode = True 
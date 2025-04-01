from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Shared properties
class ProblemBase(BaseModel):
    title: str
    statement: str
    difficulty: float
    topics: Optional[List[str]] = None
    is_published: bool = False

# Properties to receive on item creation
class ProblemCreate(ProblemBase):
    pass # For now, identical to ProblemBase, but can add specific create fields later

# Properties shared by models stored in DB
class ProblemInDBBase(ProblemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Problem(ProblemInDBBase):
    pass 
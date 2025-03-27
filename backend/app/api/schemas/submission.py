from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class SubmissionBase(BaseModel):
    problem_id: int
    content_type: str = Field(..., description="Type of submission: 'direct_input' or 'image'")
    content: str = Field(..., description="Direct input text or base64 encoded image")

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(BaseModel):
    latex_content: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    status: Optional[str] = None

class SubmissionResponse(SubmissionBase):
    id: int
    user_id: int
    latex_content: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    status: str
    submitted_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        orm_mode = True 
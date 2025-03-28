from typing import Optional, List, Dict, Any
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
    errors: Optional[List[Dict[str, Any]]] = Field(
        None, 
        description="Errors identified in the submission"
    )

class ErrorDetails(BaseModel):
    id: str
    type: str = Field(..., description="Type of error: 'logical', 'mathematical', 'syntactical'")
    location: str = Field(..., description="Description of where the error occurs")
    description: str = Field(..., description="Detailed explanation of the error")
    severity: str = Field(..., description="Severity level: 'high', 'medium', 'low'")
    appealed: Optional[bool] = False
    appeal_accepted: Optional[bool] = None

class SubmissionResponse(SubmissionBase):
    id: int
    user_id: int
    latex_content: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    status: str
    errors: Optional[List[ErrorDetails]] = None
    appealable_errors: Optional[List[str]] = Field(
        None, 
        description="List of error IDs that can be appealed"
    )
    appeals_remaining: Optional[int] = Field(
        None, 
        description="Number of appeals the user can still make for this submission"
    )
    submitted_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        orm_mode = True 
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Any
import enum

# Replicate Enum from models for schema validation
class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    appealing = "appealing"
    completed = "completed"
    evaluation_error = "evaluation_error"

# Schema for the Error object within Submission response
class ErrorDetail(BaseModel):
    id: str
    type: Optional[str] = None
    location: Optional[str] = None
    description: str
    severity: Optional[bool] = None
    status: Optional[str] = 'active'

# Base properties shared by submission schemas
class SubmissionBase(BaseModel):
    problem_id: int
    solution_text: str

# Properties to receive via API on creation
class SubmissionCreate(SubmissionBase):
    pass # No extra fields needed for creation beyond base

# Properties shared by models stored in DB - Internal representation
# This includes the Enum status
class SubmissionInDBBase(SubmissionBase):
    id: int
    submitted_at: datetime
    status: SubmissionStatus # Keep as Enum here for internal use
    score: Optional[int] = None
    feedback: Optional[str] = None
    errors: Optional[List[ErrorDetail]] = None
    appeal_attempts: int = 0

    model_config = ConfigDict(
        from_attributes=True,
        # No use_enum_values here
    )

# Properties to return to client (API Response)
# Inherit directly, rely on default FastAPI/Pydantic serialization for str Enum
class Submission(SubmissionInDBBase):
    pass

# Optional: Properties stored directly in DB (if different from response)
# class SubmissionInDB(SubmissionInDBBase):
#     pass

class AppealCreate(BaseModel):
    error_id: str
    justification: str

# Schema for submitting a single error appeal within a batch
class ErrorAppeal(BaseModel):
    error_id: str
    justification: str
    image_justification: Optional[str] = None  # Optional field for base64-encoded image data

# Schema for the batch appeal request body
class MultiAppealCreate(BaseModel):
    appeals: List[ErrorAppeal] = Field(..., min_length=1) 
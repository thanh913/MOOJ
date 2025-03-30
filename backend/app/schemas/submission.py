from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Any
import enum

# Replicate Enum from models for schema validation
class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

# Schema for the Error object within Submission response
class ErrorDetail(BaseModel):
    id: str
    type: str
    location: Optional[str] = None
    description: str
    severity: Optional[str] = None
    status: Optional[str] = 'active' # Default status

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
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ErrorJustification(BaseModel):
    """Justification for appealing a specific error"""
    error_id: str = Field(..., description="ID of the error being appealed")
    justification: str = Field(
        ..., 
        description="User's explanation of why they believe the error assessment is incorrect"
    )


class AppealCreate(BaseModel):
    """Schema for creating an appeal"""
    submission_id: int = Field(..., description="ID of the submission being appealed")
    justifications: List[ErrorJustification] = Field(
        ..., 
        description="List of error justifications"
    )


class AppealResponse(BaseModel):
    """Schema for appeal response"""
    id: int
    submission_id: int
    appealed_errors: List[str] = Field(
        ..., 
        description="List of error IDs that were appealed"
    )
    justifications: List[Dict[str, str]] = Field(
        ..., 
        description="Mapping of error IDs to justifications"
    )
    status: str = Field(
        ..., 
        description="Status of the appeal: 'pending', 'processed', 'rejected'"
    )
    processed_results: Optional[Dict[str, Any]] = Field(
        None, 
        description="Results of the appeal processing"
    )
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class AppealUpdate(BaseModel):
    """Schema for updating an appeal"""
    status: Optional[str] = Field(
        None, 
        description="Status of the appeal: 'pending', 'processed', 'rejected'"
    )
    processed_results: Optional[Dict[str, Any]] = Field(
        None, 
        description="Results of the appeal processing"
    )
    resolved_at: Optional[datetime] = None 
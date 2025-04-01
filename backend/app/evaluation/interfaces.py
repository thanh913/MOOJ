"""
Type definitions and interfaces for the evaluation system.

Note: These are TypedDicts for structural typing, complementing Pydantic schemas.
"""
from typing import Dict, List, Any, TypedDict, Optional

# Note: These definitions should mirror the Pydantic schemas 
# in app/schemas/submission.py where applicable.

class ErrorDetail(TypedDict):
    """
    Standardized error structure (matches schemas.ErrorDetail).
    
    Fields:
        id: Unique identifier for the error.
        type: Category of error (e.g., logical, calculation).
        location: Optional string indicating where the error occurred.
        description: Detailed explanation of the error.
        severity: Optional indication of severity (e.g., low, medium, high).
        status: Lifecycle status ("active", "appealing", "resolved", "rejected", "overturned").
    """
    id: str
    type: str
    location: Optional[str]
    description: str
    severity: Optional[str]
    status: str # "active", "appealing", "resolved", "rejected", "overturned"

class EvaluationResult(TypedDict):
    """
    Standardized result format returned by the evaluate method.
    
    Fields:
        score: Final calculated score for the submission based on current errors.
        feedback: Optional textual feedback (potentially markdown).
        # errors list is often managed directly on the Submission object now.
    """
    score: int 
    feedback: Optional[str]

# AppealResult is no longer needed as process_appeal modifies the 
# submission object directly and returns None.
# class AppealResult(TypedDict):
#     ...

class ErrorAppeal(TypedDict):
    """
    Structure for a single appeal within a batch (matches schemas.ErrorAppeal).
    """
    error_id: str
    justification: str
    image_justification: Optional[str]  # Optional base64-encoded image data

class EvaluatorInfo(TypedDict):
    """
    Metadata about an evaluator implementation.
    """
    name: str
    version: str
    description: str
    capabilities: List[str] 
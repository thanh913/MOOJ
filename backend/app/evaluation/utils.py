"""
Utility functions for the evaluation system.
"""
import logging
from typing import Dict, Any, Optional
import uuid

logger = logging.getLogger(__name__)


def generate_error_id() -> str:
    """
    Generate a unique error ID.
    
    Returns:
        A unique string ID for an error
    """
    return f"err-{uuid.uuid4()}"


def is_valid_justification(justification: str) -> bool:
    """
    Check if a justification is valid for an appeal.
    
    Args:
        justification: The justification text
        
    Returns:
        True if the justification is valid, False otherwise
    """
    if not justification:
        return False
    
    # Minimum length requirement
    if len(justification.strip()) < 5:
        return False
    
    return True


def get_problem_statement(problem_id: int) -> str:
    """
    Get the problem statement for a given problem ID.
    
    In a real implementation, this would retrieve the problem from the database.
    For now, it returns a placeholder.
    
    Args:
        problem_id: ID of the problem
        
    Returns:
        Problem statement text
    """
    # In a real implementation, this would look up the problem in the database
    return f"This is a placeholder problem statement for problem ID {problem_id}" 
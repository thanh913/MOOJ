"""
Error detection implementation for the placeholder evaluator.

Generates deterministic errors based on input for demonstration purposes.
"""
import random
import re  # Import regex
from typing import List, Dict, Any, TYPE_CHECKING

from app.evaluation.interfaces import ErrorDetail
from app.evaluation.utils import generate_error_id

if TYPE_CHECKING:
    from app.db.models.submission import Submission
    from app.db.models.problem import Problem

# List of sample error descriptions
PREDEFINED_ERRORS = [
    {
        "description": "Logical flaw detected in step 3.",
        "severity": True, # Non-trivial
        "type": "logic",
        "location": "Step 3"
    },
    {
        "description": "Incorrect formula used for integration.",
        "severity": True, # Non-trivial
        "type": "calculation", 
        "location": "Line 5"
    },
    {
        "description": "Minor notation inconsistency.",
        "severity": False, # Trivial
        "type": "notation",
        "location": "Throughout"
    }
]

# Add a big error for submissions containing the word "error"
BIG_ERROR = {
    "description": "Critical error found in submission. The solution contains explicit errors.",
    "severity": True, # Non-trivial
    "type": "critical",
    "location": "Entire submission"
}


def find_errors(submission: 'Submission', problem: 'Problem', config: Dict[str, Any]) -> List[ErrorDetail]:
    """
    Generate deterministic errors for the given submission based on content.
    
    Args:
        submission: The Submission object containing the solution_text.
        problem: The associated Problem object.
        config: Evaluator configuration (not used in this deterministic version).
        
    Returns:
        List of errors including a major error if solution_text contains "error".
    """
    solution_text = submission.solution_text
    errors: List[ErrorDetail] = []

    # Check if "error" is in the text (case-insensitive)
    if re.search(r'error', solution_text, re.IGNORECASE):
        # Always add the big error first when "error" is found
        errors.append({
            "id": generate_error_id(),
            "description": BIG_ERROR["description"],
            "severity": BIG_ERROR["severity"],
            "type": BIG_ERROR.get("type", "critical"),
            "location": BIG_ERROR.get("location"),
            "status": "active" 
        })
        
        # Also add all predefined errors to make it clear there are multiple issues
        for error_template in PREDEFINED_ERRORS:
            errors.append({
                "id": generate_error_id(),
                "description": error_template["description"],
                "severity": error_template["severity"],
                "type": error_template.get("type", "general"),
                "location": error_template.get("location"),
                "status": "active" 
            })
            
    return errors 
"""
Appeal processing implementation for the placeholder evaluator.

Processes appeals deterministically based on justification content.
"""
import random
import logging
from typing import List, Dict, Any, TYPE_CHECKING
import re # Import regex

from app.evaluation.interfaces import ErrorAppeal, ErrorDetail

if TYPE_CHECKING:
    from app.db.models.submission import Submission
    from app.db.models.problem import Problem

logger = logging.getLogger(__name__)

def process_appeal(appeals: List['ErrorAppeal'], submission: 'Submission', 
                   problem: 'Problem', config: Dict[str, Any]) -> None:
    """
    Process a batch of appeals deterministically.

    Modifies the submission.errors list directly.
    Appeal succeeds if justification contains "correct", fails otherwise.

    Args:
        appeals: List of appeal objects with error_id and justification.
        submission: The Submission object (errors list will be modified).
        problem: The associated Problem object (unused).
        config: Evaluator configuration (unused).
    """
    if not submission.errors:
        logger.warning(f"Attempted to process appeals for submission {submission.id} with no errors.")
        return

    # Create a map for quick error lookup
    error_map = {str(error.get('id')): error for error in submission.errors if isinstance(error, dict)}

    logger.info(f"Processing {len(appeals)} appeal(s) for submission {submission.id}")

    for appeal in appeals:
        error_id_str = str(appeal.error_id) # Ensure string comparison
        if error_id_str in error_map:
            error_to_update = error_map[error_id_str]
            
            # Only process if it was marked as 'appealing'
            if error_to_update.get('status') == 'appealing':
                justification = appeal.justification
                
                # Deterministic rule: check for "correct" in justification
                if justification and re.search(r'correct', justification, re.IGNORECASE):
                    # Appeal successful
                    error_to_update['status'] = 'resolved'
                    # Optionally downgrade severity if needed by logic
                    # error_to_update['severity'] = False 
                    logger.info(f"Appeal for error {error_id_str} in submission {submission.id} resolved.")
                else:
                    # Appeal failed
                    error_to_update['status'] = 'rejected'
                    logger.info(f"Appeal for error {error_id_str} in submission {submission.id} rejected.")
            else:
                 logger.warning(f"Skipping appeal for error {error_id_str} in submission {submission.id}: status is not 'appealing' (current: {error_to_update.get('status')})")
        else:
            logger.warning(f"Error ID {error_id_str} from appeal not found in submission {submission.id}")

    # No return value, modifications are made directly to submission.errors
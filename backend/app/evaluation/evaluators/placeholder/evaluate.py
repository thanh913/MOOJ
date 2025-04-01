"""
Evaluation implementation for the placeholder evaluator.

Generates deterministic evaluation results based on errors.
"""
from typing import List, Dict, Any, TYPE_CHECKING
import logging

from app.evaluation.interfaces import EvaluationResult, ErrorDetail # ErrorDetail for type hint clarity

if TYPE_CHECKING:
    from app.db.models.submission import Submission
    from app.db.models.problem import Problem

logger = logging.getLogger(__name__)

def evaluate(submission: 'Submission', problem: 'Problem', config: Dict[str, Any]) -> EvaluationResult:
    """
    Generate a deterministic evaluation result based on current errors.

    Score is 100 if no active/rejected errors exist, 0 otherwise.
    Feedback is a simple message based on error presence.

    Args:
        submission: The Submission object (contains current errors).
        problem: The associated Problem object.
        config: Evaluator configuration (not used).

    Returns:
        Evaluation result (score, feedback).
    """
    errors = submission.errors or []
    logger.info(f"Evaluating submission {submission.id} with {len(errors)} errors.")

    # Determine if there are any active or rejected errors
    has_active_or_rejected_errors = any(
        error.get('status') in ['active', 'rejected']
        for error in errors if isinstance(error, dict)
    )

    score = 0 if has_active_or_rejected_errors else 100
    feedback = "No active or rejected errors found." if score == 100 else "Active or rejected errors identified. Please review the feedback below."
    
    logger.info(f"Evaluation complete for submission {submission.id}. Score: {score}")

    # Return the result structure - Note: errors are part of the submission object,
    # the evaluator usually just returns score/status/feedback.
    # The worker then updates the submission with these.
    return {
        "score": score,
        "feedback": feedback
        # Status (like completed/appealing) is determined by the worker based on score/errors
    } 
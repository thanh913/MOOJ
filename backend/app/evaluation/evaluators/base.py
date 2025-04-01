"""
Abstract base class that all evaluator implementations must inherit from.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, TYPE_CHECKING

# Use TYPE_CHECKING to avoid circular imports at runtime
if TYPE_CHECKING:
    from app.db.models.submission import Submission
    from app.db.models.problem import Problem
    from app.schemas.submission import ErrorAppeal, ErrorDetail, EvaluationResult

class BaseEvaluator(ABC):
    """
    Base evaluator class that defines the interface all evaluators must implement.
    
    All evaluator implementations should inherit from this class and implement
    all abstract methods.
    """
    
    @abstractmethod
    def find_errors(self, submission: 'Submission', problem: 'Problem') -> List['ErrorDetail']:
        """
        Analyze a submission's solution and identify errors.
        
        Args:
            submission: The full Submission database model object.
            problem: The associated Problem database model object.
            
        Returns:
            List of errors found in the solution.
        """
        pass
    
    @abstractmethod
    def evaluate(self, submission: 'Submission', problem: 'Problem') -> 'EvaluationResult':
        """
        Generate an evaluation result based on the current state of errors 
        within the submission object.
        
        Considers active and rejected errors when calculating the final score.
        
        Args:
            submission: The Submission model object (containing current errors).
            problem: The associated Problem model object.
            
        Returns:
            Evaluation result containing the final score and potentially updated errors/feedback.
        """
        pass
    
    @abstractmethod
    def process_appeal(self, appeals: List['ErrorAppeal'], submission: 'Submission', 
                       problem: 'Problem') -> None: # Returns None, modifies submission.errors directly
        """
        Process a batch of appeals for a given submission.
        
        This method should iterate through the `appeals` list.
        For each appeal, it determines if it's successful (`resolved`) or not (`rejected`).
        It directly updates the status of the corresponding errors within the 
        `submission.errors` list (which is expected to be a mutable list of dicts).
        
        Args:
            appeals: List of appeal objects, each with error_id and justification.
            submission: The Submission model object (whose errors list will be modified).
            problem: The associated Problem model object (for context).
        """
        pass
    
    @classmethod
    @abstractmethod
    def get_evaluator_info(cls) -> Dict[str, Any]:
        """
        Return metadata about this evaluator.
        
        Returns:
            Dictionary containing evaluator metadata.
        """
        pass 
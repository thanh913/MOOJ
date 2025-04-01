"""
Router for selecting and instantiating evaluators.
"""
import logging
from typing import Dict, Any, Optional, Type, List, TYPE_CHECKING

from app.evaluation.evaluators.base import BaseEvaluator
from app.evaluation.interfaces import EvaluationResult # AppealResult removed
# Use TYPE_CHECKING to avoid circular imports at runtime
if TYPE_CHECKING:
    from app.db.models.submission import Submission
    from app.db.models.problem import Problem
    from app.schemas.submission import ErrorAppeal, ErrorDetail

logger = logging.getLogger(__name__)

class EvaluatorRouter:
    """
    Routes evaluation requests to the appropriate evaluator implementation.
    
    The router is responsible for:
    1. Selecting the appropriate evaluator based on configuration
    2. Instantiating evaluator instances
    3. Providing a unified API for all evaluator operations
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the router with optional configuration.
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.default_evaluator = self.config.get("default_evaluator", "placeholder")
        self._evaluator_cache = {}
    
    def get_evaluator(self, name: Optional[str] = None) -> BaseEvaluator:
        """
        Get an evaluator instance by name.
        
        Args:
            name: Name of the evaluator to instantiate (defaults to config or "placeholder")
            
        Returns:
            An instance of a BaseEvaluator implementation
            
        Raises:
            ValueError: If the specified evaluator cannot be found
        """
        evaluator_name = name or self.default_evaluator
        
        if evaluator_name in self._evaluator_cache:
            return self._evaluator_cache[evaluator_name]
        
        try:
            evaluator_cls = self._get_evaluator_class(evaluator_name)
            # Pass config specific to this evaluator if available
            evaluator_config = self.config.get(evaluator_name, {})
            evaluator = evaluator_cls(config=evaluator_config)
            
            self._evaluator_cache[evaluator_name] = evaluator
            return evaluator
        except (ImportError, AttributeError) as e:
            logger.error(f"Failed to load evaluator '{evaluator_name}': {str(e)}")
            raise ValueError(f"Unknown evaluator: {evaluator_name}")
    
    def _get_evaluator_class(self, name: str) -> Type[BaseEvaluator]:
        """
        Dynamically import and return the evaluator class.
        """
        # Simplified dynamic import - enhance with better error handling/structure if needed
        try:
            module_path = f"app.evaluation.evaluators.{name}.evaluator"
            module = __import__(module_path, fromlist=['evaluator'])
            # Assumes class name follows convention: {Name}Evaluator
            class_name = f"{name.capitalize()}Evaluator"
            evaluator_cls = getattr(module, class_name)
            if not issubclass(evaluator_cls, BaseEvaluator):
                raise TypeError(f"{class_name} does not inherit from BaseEvaluator")
            return evaluator_cls
        except (ImportError, AttributeError, TypeError) as e:
             logger.error(f"Failed to import or find evaluator class for '{name}': {e}")
             # Fallback or specific error handling
             if name == "placeholder": # Ensure placeholder still works
                 from app.evaluation.evaluators.placeholder.evaluator import PlaceholderEvaluator
                 return PlaceholderEvaluator
             raise ImportError(f"No evaluator module or class found for '{name}'")
    
    # Updated find_errors signature
    def find_errors(self, submission: 'Submission', problem: 'Problem', 
                    evaluator_name: Optional[str] = None) -> List['ErrorDetail']:
        """
        Find errors in a submission using the specified evaluator.
        
        Args:
            submission: The Submission object.
            problem: The associated Problem object.
            evaluator_name: Optional name of the evaluator to use.
            
        Returns:
            List of errors found.
        """
        evaluator = self.get_evaluator(evaluator_name)
        return evaluator.find_errors(submission=submission, problem=problem)
    
    # Updated evaluate signature
    def evaluate(self, submission: 'Submission', problem: 'Problem',
                 evaluator_name: Optional[str] = None) -> 'EvaluationResult':
        """
        Evaluate a submission using the specified evaluator.
        
        Args:
            submission: The Submission object (contains current errors).
            problem: The associated Problem object.
            evaluator_name: Optional name of the evaluator to use.
            
        Returns:
            Evaluation result (score, feedback).
        """
        evaluator = self.get_evaluator(evaluator_name)
        return evaluator.evaluate(submission=submission, problem=problem)
    
    # Updated process_appeal signature
    def process_appeal(self, appeals: List['ErrorAppeal'], submission: 'Submission', 
                       problem: 'Problem', evaluator_name: Optional[str] = None) -> None:
        """
        Process a batch of appeals using the specified evaluator.
        
        Args:
            appeals: List of appeal objects.
            submission: The Submission object (errors will be modified).
            problem: The associated Problem object.
            evaluator_name: Optional name of the evaluator to use.
        """
        evaluator = self.get_evaluator(evaluator_name)
        # process_appeal now returns None and modifies submission.errors directly
        evaluator.process_appeal(appeals=appeals, submission=submission, problem=problem)
    
    def get_evaluator_info(self, evaluator_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get metadata about the specified evaluator.
        """
        try:
            evaluator_cls = self._get_evaluator_class(evaluator_name or self.default_evaluator)
            return evaluator_cls.get_evaluator_info()
        except Exception as e:
             logger.error(f"Could not get info for evaluator '{evaluator_name or self.default_evaluator}': {e}")
             # Provide default/fallback info
             return {
                "name": "unknown",
                "version": "-",
                "description": "Failed to load evaluator info.",
                "capabilities": []
             } 
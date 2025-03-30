"""
Evaluation pipeline that orchestrates various components of the evaluation.
"""
from typing import Dict, Any, Optional

from app.evaluation.image_to_latex import convert_image_to_latex
from app.evaluation.evaluator import evaluate_submission as evaluate_solution

def evaluate_submission(image_data: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None, 
                        latex_text: Optional[str] = None) -> Dict[str, Any]:
    """
    Main evaluation pipeline that processes submissions and returns evaluation results.
    
    Args:
        image_data: Base64 encoded image data (optional if latex_text is provided)
        metadata: Submission metadata (problem_id, user_id, etc.)
        latex_text: LaTeX text (optional if image_data is provided)
        
    Returns:
        Dict containing evaluation results:
        - status: success, partial, or failure
        - score: numeric score (0-100)
        - feedback: detailed feedback in markdown format
        - errors: list of error objects
    """
    try:
        # Extract LaTeX from image if provided
        if latex_text is None and image_data:
            latex_text = convert_image_to_latex(image_data)
        
        if not latex_text:
            return {
                "status": "failure",
                "score": 0,
                "feedback": "No solution provided or could not extract solution from image.",
                "errors": [{"type": "input_error", "location": "submission", "message": "No valid input provided"}]
            }
        
        # Get problem statement (in a real implementation, this would come from a database)
        problem_statement = "Solve the equation x + 1 = 2."
        if metadata and metadata.get("problem_id"):
            # In a real implementation, we would look up the problem by ID
            problem_statement = f"Problem {metadata['problem_id']}: Solve the equation x + 1 = 2."
        
        # Evaluate the solution
        score, feedback = evaluate_solution(problem_statement, latex_text)
        
        # Generate error list (in a real implementation, this would be more sophisticated)
        errors = []
        if score < 100:
            errors = [
                {"id": "mock-err-1", "type": "logical", "location": "Step 3", "description": "Minor logical gap found.", "severity": "low", "status": "active"}
            ]
        
        # Determine status based on score
        if score >= 90:
            status = "success"
        elif score >= 60:
            status = "partial"
        else:
            status = "failure"
        
        return {
            "status": status,
            "score": score,
            "feedback": feedback,
            "errors": errors
        }
        
    except Exception as e:
        # Log the error
        print(f"Error in evaluation pipeline: {str(e)}")
        return {
            "status": "error",
            "score": 0,
            "feedback": f"Evaluation failed: {str(e)}",
            "errors": [{"type": "system_error", "location": "evaluation", "message": str(e)}]
        } 
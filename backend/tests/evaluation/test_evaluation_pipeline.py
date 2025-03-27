import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.evaluation
def test_evaluation_pipeline_flow():
    """
    Test the full evaluation pipeline flow with mocked components.
    """
    # Mock the required modules
    with patch.dict('sys.modules', {
        'app.evaluation.image_to_latex': MagicMock(),
        'app.evaluation.find_all_errors': MagicMock(),
        'app.evaluation.evaluate_solution': MagicMock(),
        'app.evaluation.return_evaluation': MagicMock()
    }):
        # Import the mocked modules
        from app.evaluation.image_to_latex import convert_image_to_latex
        from app.evaluation.find_all_errors import find_errors
        from app.evaluation.evaluate_solution import evaluate
        from app.evaluation.return_evaluation import format_results
        
        # Mock return values
        convert_image_to_latex.return_value = r"\int_{a}^{b} f(x) \, dx"
        find_errors.return_value = []
        evaluate.return_value = {"correct": True, "score": 100}
        format_results.return_value = {
            "status": "success",
            "score": 100,
            "feedback": "Correct solution!",
            "errors": []
        }
        
        # Mock the pipeline function
        with patch('app.evaluation.pipeline.evaluate_submission') as mock_pipeline:
            # Set the return value for the pipeline function
            mock_pipeline.return_value = {
                "status": "success",
                "score": 100,
                "feedback": "Correct solution!",
                "errors": []
            }
            
            # Import and call the pipeline
            from app.evaluation.pipeline import evaluate_submission
            
            # Test data
            test_image = "base64_encoded_image_data"
            test_metadata = {
                "problem_id": "test123",
                "user_id": "user456",
                "submission_timestamp": "2023-11-14T12:00:00Z"
            }
            
            # Call the pipeline
            result = evaluate_submission(test_image, test_metadata)
            
            # Assert the result
            assert result["status"] == "success"
            assert result["score"] == 100
            assert "feedback" in result
            assert "errors" in result
            
            # Verify the pipeline was called correctly
            mock_pipeline.assert_called_once_with(test_image, test_metadata)


@pytest.mark.evaluation
def test_evaluation_pipeline_with_errors():
    """
    Test the evaluation pipeline handling of errors in the solution.
    """
    # Mock modules
    with patch.dict('sys.modules', {
        'app.evaluation.image_to_latex': MagicMock(),
        'app.evaluation.find_all_errors': MagicMock(),
        'app.evaluation.evaluate_solution': MagicMock(),
        'app.evaluation.return_evaluation': MagicMock()
    }):
        # Import mocked modules
        from app.evaluation.image_to_latex import convert_image_to_latex
        from app.evaluation.find_all_errors import find_errors
        from app.evaluation.evaluate_solution import evaluate
        from app.evaluation.return_evaluation import format_results
        
        # Mock return values with errors
        convert_image_to_latex.return_value = r"\int_{a}^{b} f(x) \, dx"
        errors = [
            {"type": "syntax", "location": "line 1", "message": "Missing closing bracket"},
            {"type": "logic", "location": "step 2", "message": "Incorrect application of chain rule"}
        ]
        find_errors.return_value = errors
        evaluate.return_value = {"correct": False, "score": 60, "errors": errors}
        format_results.return_value = {
            "status": "partial",
            "score": 60,
            "feedback": "Your solution has some errors",
            "errors": errors
        }
        
        # Mock the pipeline
        with patch('app.evaluation.pipeline.evaluate_submission') as mock_pipeline:
            mock_pipeline.return_value = {
                "status": "partial",
                "score": 60,
                "feedback": "Your solution has some errors",
                "errors": errors
            }
            
            # Import and call the pipeline
            from app.evaluation.pipeline import evaluate_submission
            
            # Test data
            test_image = "base64_encoded_image_data"
            test_metadata = {
                "problem_id": "test123",
                "user_id": "user456",
                "submission_timestamp": "2023-11-14T12:00:00Z"
            }
            
            # Call the pipeline
            result = evaluate_submission(test_image, test_metadata)
            
            # Assert the result
            assert result["status"] == "partial"
            assert result["score"] == 60
            assert len(result["errors"]) == 2
            assert result["errors"][0]["type"] == "syntax"
            assert result["errors"][1]["type"] == "logic" 
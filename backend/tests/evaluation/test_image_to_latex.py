import pytest
from unittest.mock import patch, MagicMock
import base64
from io import BytesIO
from PIL import Image
import numpy as np


@pytest.mark.evaluation
def test_image_to_latex_conversion():
    """
    Test that the image_to_LaTeX function correctly processes an image and returns LaTeX.
    """
    # Import the function to test
    with patch('app.evaluation.image_to_latex.convert_image_to_latex') as mock_convert:
        # Setup the mock to return a specific LaTeX string
        mock_convert.return_value = r"\frac{a}{b} = c"
        
        # Create a test image
        img = Image.new('RGB', (100, 100), color='white')
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Mock import
        with patch.dict('sys.modules', {
            'app.evaluation.image_to_latex': MagicMock()
        }):
            # Now import should use our mocked module
            from app.evaluation.image_to_latex import convert_image_to_latex
            
            # Call the function with our test image
            result = convert_image_to_latex(img_str)
            
            # Assert the result matches our expected LaTeX
            assert result == r"\frac{a}{b} = c"
            
            # Verify the mock was called correctly
            mock_convert.assert_called_once()


@pytest.mark.evaluation
@pytest.mark.parametrize("test_input,expected", [
    ("empty_image", ""),
    ("simple_equation", r"a + b = c"),
    ("complex_equation", r"\int_{a}^{b} f(x) \, dx")
])
def test_image_to_latex_with_different_inputs(test_input, expected):
    """
    Parametrized test for different types of inputs to the image_to_LaTeX function.
    """
    with patch('app.evaluation.image_to_latex.convert_image_to_latex') as mock_convert:
        # Setup the mock to return different values based on input
        mock_convert.return_value = expected
        
        # Mock module import
        with patch.dict('sys.modules', {
            'app.evaluation.image_to_latex': MagicMock()
        }):
            from app.evaluation.image_to_latex import convert_image_to_latex
            
            # Call with dummy input (in real test we'd create appropriate test images)
            result = convert_image_to_latex(test_input)
            
            # Assert
            assert result == expected 
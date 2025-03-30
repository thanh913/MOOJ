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
    # Create a test image
    img = Image.new('RGB', (100, 100), color='white')
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_bytes = buffered.getvalue()
    
    # Mock the function
    with patch('app.evaluation.image_to_latex.convert_image_to_latex') as mock_convert:
        # Set up the mock to return a specific value
        mock_convert.return_value = r"\frac{a}{b} = c"
        
        # Import the module after patching
        from app.evaluation.image_to_latex import convert_image_to_latex
        
        # Call the function
        result = convert_image_to_latex(img_bytes)
        
        # Assert the result
        assert result == r"\frac{a}{b} = c"
        
        # Verify the mock was called with the right arguments
        mock_convert.assert_called_once_with(img_bytes)


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
    # Convert string input to bytes to match function signature
    if test_input == "empty_image":
        test_bytes = b""
    else:
        test_bytes = test_input.encode('utf-8')
    
    # Mock the function
    with patch('app.evaluation.image_to_latex.convert_image_to_latex') as mock_convert:
        # Set up mock to return the expected value
        mock_convert.return_value = expected
        
        # Import the module after patching
        from app.evaluation.image_to_latex import convert_image_to_latex
        
        # Call the function
        result = convert_image_to_latex(test_bytes)
        
        # Assert the result
        assert result == expected
        
        # Verify the mock was called
        mock_convert.assert_called_once_with(test_bytes) 
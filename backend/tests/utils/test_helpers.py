import base64
from io import BytesIO
from typing import Dict, Any, Optional, List
from PIL import Image, ImageDraw, ImageFont
import random
import string
import json


def generate_test_image(
    width: int = 800, 
    height: int = 400, 
    text: str = None, 
    bg_color: str = "white",
    text_color: str = "black"
) -> Image.Image:
    """
    Generate a test image with optional text.
    
    Args:
        width: Image width in pixels
        height: Image height in pixels
        text: Optional text to draw on the image
        bg_color: Background color
        text_color: Text color
        
    Returns:
        PIL Image object
    """
    # Create a blank image
    img = Image.new('RGB', (width, height), color=bg_color)
    
    # If text is provided, add it to the image
    if text:
        draw = ImageDraw.Draw(img)
        # Try to use a default font, fall back to default if not available
        try:
            font = ImageFont.truetype("arial.ttf", 36)
        except IOError:
            font = ImageFont.load_default()
            
        # Calculate text position to center it
        text_width, text_height = draw.textsize(text, font=font)
        position = ((width - text_width) // 2, (height - text_height) // 2)
        
        # Draw the text
        draw.text(position, text, fill=text_color, font=font)
    
    return img


def image_to_base64(img: Image.Image, format: str = "PNG") -> str:
    """
    Convert a PIL Image to base64 encoded string.
    
    Args:
        img: PIL Image object
        format: Image format (PNG, JPEG, etc.)
        
    Returns:
        Base64 encoded string
    """
    buffered = BytesIO()
    img.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str


def create_test_problem(
    problem_id: Optional[str] = None,
    difficulty: str = "medium",
    tags: Optional[List[str]] = None,
    latex_content: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a test problem data structure.
    
    Args:
        problem_id: Optional problem ID, randomly generated if not provided
        difficulty: Problem difficulty level
        tags: Problem tags
        latex_content: LaTeX content for the problem
        
    Returns:
        Dictionary with problem data
    """
    if problem_id is None:
        problem_id = f"prob-{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"
        
    if tags is None:
        tags = ["calculus", "integration", "test"]
        
    if latex_content is None:
        latex_content = r"Evaluate the integral $\int_{0}^{1} x^2 dx$."
        
    return {
        "problem_id": problem_id,
        "title": f"Test Problem {problem_id}",
        "description": "This is a test problem",
        "difficulty": difficulty,
        "tags": tags,
        "latex_content": latex_content,
        "created_at": "2023-11-14T12:00:00Z",
        "updated_at": "2023-11-14T12:00:00Z"
    }


def create_test_user(
    user_id: Optional[str] = None,
    role: str = "student"
) -> Dict[str, Any]:
    """
    Create a test user data structure.
    
    Args:
        user_id: Optional user ID, randomly generated if not provided
        role: User role
        
    Returns:
        Dictionary with user data
    """
    if user_id is None:
        user_id = f"user-{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"
        
    return {
        "user_id": user_id,
        "username": f"testuser_{user_id}",
        "email": f"{user_id}@example.com",
        "role": role,
        "created_at": "2023-11-14T12:00:00Z"
    }


def create_test_submission(
    submission_id: Optional[str] = None,
    user_id: Optional[str] = None,
    problem_id: Optional[str] = None,
    latex_content: Optional[str] = None,
    score: Optional[int] = None,
    status: str = "submitted"
) -> Dict[str, Any]:
    """
    Create a test submission data structure.
    
    Args:
        submission_id: Optional submission ID, randomly generated if not provided
        user_id: Optional user ID, randomly generated if not provided
        problem_id: Optional problem ID, randomly generated if not provided
        latex_content: LaTeX content for the submission
        score: Submission score
        status: Submission status
        
    Returns:
        Dictionary with submission data
    """
    if submission_id is None:
        submission_id = f"sub-{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"
        
    if user_id is None:
        user_id = f"user-{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"
        
    if problem_id is None:
        problem_id = f"prob-{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"
        
    if latex_content is None:
        latex_content = r"\int_{0}^{1} x^2 dx = \left[ \frac{x^3}{3} \right]_{0}^{1} = \frac{1}{3} - 0 = \frac{1}{3}"
        
    if score is None:
        score = random.randint(0, 100)
        
    return {
        "submission_id": submission_id,
        "user_id": user_id,
        "problem_id": problem_id,
        "latex_content": latex_content,
        "score": score,
        "status": status,
        "feedback": "This is test feedback",
        "errors": [],
        "submitted_at": "2023-11-14T12:00:00Z"
    } 
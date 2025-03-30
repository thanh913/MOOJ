"""
Module for converting handwritten math images to LaTeX using OCR.
"""
import io
import logging
from typing import Optional

import pytesseract
from PIL import Image

# Set up logging
logger = logging.getLogger(__name__)

def convert_image_to_latex(image_bytes: bytes) -> str:
    """
    Convert an image containing math notation to LaTeX string using OCR.
    
    Args:
        image_bytes: Raw bytes of the image file
        
    Returns:
        str: Extracted LaTeX string from the image
        
    Raises:
        ValueError: If image processing fails
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Pre-process the image for better OCR results (optional enhancement)
        # image = preprocess_image(image)
        
        # Configure tesseract options for math recognition
        custom_config = r'--psm 6'  # Assume single uniform block of text
        
        # Perform OCR
        extracted_text = pytesseract.image_to_string(image, config=custom_config)
        
        # Clean up the extracted text 
        latex_text = clean_and_format_latex(extracted_text)
        
        logger.info(f"Successfully converted image to LaTeX: {latex_text[:30]}...")
        return latex_text
        
    except Exception as e:
        logger.error(f"Error during OCR conversion: {str(e)}")
        raise ValueError(f"Failed to process image: {str(e)}") from e


def clean_and_format_latex(text: str) -> str:
    """
    Clean and format the OCR-extracted text to proper LaTeX.
    
    Args:
        text: Raw text from OCR
        
    Returns:
        str: Cleaned and formatted LaTeX
    """
    if not text:
        return ""
    
    # Remove extra whitespace and newlines
    cleaned_text = text.strip()
    
    # Replace common OCR errors in math notation
    replacements = {
        # Common replacements for math symbols
        '\\{': '{',
        '\\}': '}',
        '---': '—',
        '..': '\\ldots',
        '->': '\\rightarrow',
        '=>': '\\Rightarrow',
        '>=': '\\geq',
        '<=': '\\leq',
        '!=': '\\neq',
    }
    
    for old, new in replacements.items():
        cleaned_text = cleaned_text.replace(old, new)
    
    return cleaned_text


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image to improve OCR accuracy (optional enhancement).
    
    Args:
        image: PIL Image object
        
    Returns:
        Image: Preprocessed image
    """
    # Convert to grayscale
    if image.mode != 'L':
        image = image.convert('L')
    
    # Increase contrast (optional)
    # from PIL import ImageEnhance
    # enhancer = ImageEnhance.Contrast(image)
    # image = enhancer.enhance(2.0)
    
    # Resize if needed (optional)
    # image = image.resize((image.width * 2, image.height * 2), Image.LANCZOS)
    
    return image 
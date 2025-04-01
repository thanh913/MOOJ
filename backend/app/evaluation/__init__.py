"""
Evaluation module for MOOJ
"""
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

# Import directly from image_to_latex module for backward compatibility
from app.evaluation.image_to_latex import convert_image_to_latex

# Import the evaluator router
from app.evaluation.router import EvaluatorRouter
from app.evaluation.config import get_evaluator_config, DEFAULT_EVALUATOR_CONFIG

# Setup module logger
logger = logging.getLogger(__name__)

# Default config path (not in config.py)
DEFAULT_CONFIG_PATH = "/app/config/evaluator.json"

# Placeholder config for fallback
PLACEHOLDER_CONFIG = {
    "default_evaluator": "placeholder",
    "placeholder": {
        "error_probability": 0.7,
        "max_errors": 4,
        "appeal_success_rate": 0.5
    }
}

def load_evaluator_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Load the evaluator configuration from a file
    
    Args:
        config_path: Path to the configuration file, or None to use default
        
    Returns:
        The loaded configuration or a default fallback config if loading fails
    """
    try:
        if config_path is None:
            # Use environment variable or fall back to default path
            config_path = os.environ.get('EVALUATOR_CONFIG_PATH')
        
        # If we have a specific path, try to load it
        if config_path:
            logger.info(f"Loading evaluator configuration from {config_path}")
            config_file = Path(config_path)
            
            if not config_file.exists():
                logger.warning(f"Configuration file {config_path} not found, falling back to get_evaluator_config()")
                return get_evaluator_config()
                
            with open(config_file, 'r') as f:
                config = json.load(f)
                
            logger.info(f"Successfully loaded evaluator configuration from file")
            return config
        else:
            # Use the existing configuration function
            return get_evaluator_config()
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing evaluator configuration file {config_path}: {str(e)}")
        return get_evaluator_config()
    except Exception as e:
        logger.error(f"Error loading evaluator configuration from {config_path}: {type(e).__name__}: {str(e)}")
        return get_evaluator_config()

# Create a default router instance with proper config for convenience
try:
    logger.info("Initializing default evaluation router")
    config = load_evaluator_config()
    default_router = EvaluatorRouter(config)
    logger.info(f"Default evaluation router initialized with config: {config.get('default_evaluator', 'placeholder')}")
except Exception as e:
    logger.error(f"Failed to initialize default evaluator router: {type(e).__name__}: {str(e)}", exc_info=True)
    logger.warning("Falling back to default configuration")
    # Create a fallback router with minimal configuration
    default_router = EvaluatorRouter(PLACEHOLDER_CONFIG)

# Convenience functions that use the default router
find_errors = default_router.find_errors
evaluate = default_router.evaluate
appeal = default_router.process_appeal 
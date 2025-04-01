"""
Configuration for the evaluation system.
"""
import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Default configuration for the evaluation system
DEFAULT_EVALUATOR_CONFIG: Dict[str, Any] = {
    # Default evaluator to use
    "default_evaluator": "placeholder",
    
    # Placeholder evaluator configuration
    "placeholder": {
        # Probability of generating errors (0-1)
        "error_probability": 0.7,
        
        # Maximum number of errors to generate
        "max_errors": 4,
        
        # Probability of appeal success (0-1)
        "appeal_success_rate": 0.5
    }
    
    # Add configuration for other evaluators as they are implemented
    # "llm": {
    #    "model_name": "gpt-3.5-turbo",
    #    "temperature": 0.7
    # }
}

def load_config_from_env() -> Optional[Dict[str, Any]]:
    """
    Load configuration from environment variables.
    
    Looks for EVALUATOR_CONFIG environment variable which should contain a JSON string.
    
    Returns:
        Configuration dictionary or None if not found or invalid
    """
    env_config = os.environ.get("EVALUATOR_CONFIG")
    if not env_config:
        logger.debug("No EVALUATOR_CONFIG environment variable found")
        return None
    
    try:
        config = json.loads(env_config)
        logger.info(f"Loaded evaluator configuration from environment: {list(config.keys())}")
        return config
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse EVALUATOR_CONFIG: {e}")
        return None

def get_evaluator_config() -> Dict[str, Any]:
    """
    Get the evaluator configuration.
    
    Loads configuration from environment variables if available,
    otherwise uses default configuration.
    
    Returns:
        The evaluator configuration
    """
    # Try to load from environment
    env_config = load_config_from_env()
    
    if env_config:
        # Merge with defaults for any missing values
        config = DEFAULT_EVALUATOR_CONFIG.copy()
        
        # Override top-level keys
        for key, value in env_config.items():
            if isinstance(value, dict) and key in config and isinstance(config[key], dict):
                # Merge nested dictionaries
                config[key].update(value)
            else:
                # Replace value
                config[key] = value
                
        logger.info(f"Using merged configuration with environment overrides")
        return config
    
    # Use defaults
    logger.info("Using default evaluator configuration")
    return DEFAULT_EVALUATOR_CONFIG.copy() 
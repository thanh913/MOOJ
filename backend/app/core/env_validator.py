import os
import sys
from typing import List

def validate_env_variables(required_vars: List[str]) -> bool:
    """
    Validate that all required environment variables are set.
    Returns True if all required variables are set, False otherwise.
    """
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"ERROR: Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    return True

def validate_env():
    """
    Validate required environment variables.
    Exit with non-zero status if validation fails.
    """
    required_vars = [
        "DATABASE_URL",
        "SECRET_KEY",
        "ALGORITHM",
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "APP_NAME",
        "BACKEND_CORS_ORIGINS"
    ]
    
    if not validate_env_variables(required_vars):
        print("Environment validation failed. Please check your .env file.")
        sys.exit(1)
    
    print("Environment validation successful.")
    return True 
#!/usr/bin/env python3
"""
Health check script for Docker container.
Exits with 0 if the application is healthy, non-zero otherwise.
"""
import sys
import requests
import time

MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds

def check_health():
    """Check if the API is healthy by making a request to the health endpoint."""
    url = "http://localhost:8000/health"
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200 and response.json().get("status") == "healthy":
                return True
            print(f"Health check attempt {attempt + 1} failed: {response.status_code}")
        except requests.RequestException as e:
            print(f"Health check attempt {attempt + 1} failed: {str(e)}")
        
        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_DELAY)
    
    return False

if __name__ == "__main__":
    if check_health():
        sys.exit(0)  # Healthy
    else:
        sys.exit(1)  # Unhealthy 
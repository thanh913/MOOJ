#!/bin/bash
# Run backend tests for MOOJ
# This script runs pytest tests for the backend application

# Exit on error
set -e

# Move to the backend directory
cd "$(dirname "$0")/../backend"

# Set up virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo -e "\033[33mSetting up virtual environment...\033[0m"
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies if needed
if [ ! -d ".venv/lib/python*/site-packages/pytest" ]; then
    echo -e "\033[33mInstalling dependencies...\033[0m"
    pip install -r requirements.txt
fi

# Run the tests
echo -e "\033[32mRunning tests...\033[0m"

# Parse command-line arguments and pass them to pytest
if [ $# -eq 0 ]; then
    # Default test command with coverage report
    pytest --cov=app tests/ --cov-report=term-missing
else
    # Run with user-specified arguments
    pytest "$@"
fi

# Check if tests passed
if [ $? -eq 0 ]; then
    echo -e "\033[32mAll tests passed!\033[0m"
else
    echo -e "\033[31mTests failed with exit code $?\033[0m"
    exit 1
fi 
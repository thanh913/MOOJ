#!/usr/bin/env bash
# MOOJ Backend Local Development Script

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN} MOOJ Backend Development Server${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed or not in PATH${NC}"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

# Navigate to the backend directory
cd "$(dirname "$0")/../backend" || { echo -e "${RED}Could not navigate to backend directory${NC}"; exit 1; }

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create virtual environment${NC}"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
echo "Checking dependencies..."
if ! pip freeze | grep -q "fastapi"; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}.env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please check the configuration.${NC}"
fi

# Run the application
echo -e "${GREEN}Starting FastAPI server...${NC}"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Deactivate the virtual environment on exit
deactivate 
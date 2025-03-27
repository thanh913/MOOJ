#!/usr/bin/env bash
# MOOJ Frontend Local Development Script

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN} MOOJ Frontend Development Server${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed or not in PATH${NC}"
    echo "Please install Node.js 16+ and try again"
    exit 1
fi

# Navigate to the frontend directory
cd "$(dirname "$0")/../frontend" || { echo -e "${RED}Could not navigate to frontend directory${NC}"; exit 1; }

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Node modules not found. Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}.env file not found. Creating...${NC}"
    cat > .env << EOL
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
EOL
    echo -e "${GREEN}Created .env file with default settings.${NC}"
fi

# Start the development server
echo -e "${GREEN}Starting React development server...${NC}"
npm start 
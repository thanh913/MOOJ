#!/usr/bin/env bash
# MOOJ Local Deployment Script with Docker

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN} MOOJ Local Deployment with Docker${NC}"
echo -e "${CYAN}=========================================${NC}"

# Navigate to the project root directory
cd "$(dirname "$0")/.." || { echo -e "${RED}Could not navigate to project root directory${NC}"; exit 1; }

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in PATH${NC}"
    echo "Please install Docker and Docker Compose then try again"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

# Check if docker-compose command exists
if ! command -v docker-compose &> /dev/null && ! docker compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed or not in PATH${NC}"
    echo "Please install Docker Compose and try again"
    exit 1
fi

# Create environment files if they don't exist
echo -e "${GREEN}Setting up environment files...${NC}"

# Backend environment file
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend environment file from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}Created backend/.env${NC}"
fi

# Frontend environment file
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating frontend environment file...${NC}"
    cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
EOL
    echo -e "${GREEN}Created frontend/.env${NC}"
fi

# Build and start the containers
echo -e "${GREEN}Building and starting Docker containers...${NC}"

# Use appropriate docker compose command based on what's available
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to start Docker containers${NC}"
    exit 1
fi

echo -e "${GREEN}Containers started successfully!${NC}"
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN} MOOJ is now running:${NC}"
echo -e "${CYAN}   Frontend: http://localhost:3000${NC}"
echo -e "${CYAN}   Backend API: http://localhost:8000${NC}"
echo -e "${CYAN}   Health check: http://localhost:8000/health${NC}"
echo -e "${CYAN}=========================================${NC}"
echo -e "${YELLOW}To stop the application: docker compose down${NC}" 
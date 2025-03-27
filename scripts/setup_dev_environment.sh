#!/usr/bin/env bash
# MOOJ Development Environment Setup Script

# Terminal colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
WHITE='\033[1;37m'

function print_header {
    echo ""
    echo -e "${CYAN}===============================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}===============================================${NC}"
}

function check_command {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

function install_python_dependencies {
    print_header "Setting up Python environment"
    
    # Check if Python is installed
    if ! check_command python3; then
        echo -e "${RED}Python not found. Please install Python 3.9+ and try again.${NC}"
        return 1
    fi
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "backend/venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv backend/venv
    fi
    
    # Activate virtual environment
    echo "Activating virtual environment..."
    source backend/venv/bin/activate
    
    # Install dependencies
    echo "Installing Python dependencies..."
    pip install -r backend/requirements.txt
    
    echo -e "${GREEN}Python environment setup complete!${NC}"
    return 0
}

function install_node_dependencies {
    print_header "Setting up Node.js environment"
    
    # Check if Node.js is installed
    if ! check_command node; then
        echo -e "${RED}Node.js not found. Please install Node.js 16+ and try again.${NC}"
        return 1
    fi
    
    # Navigate to frontend directory and install dependencies
    echo "Installing Node.js dependencies..."
    (cd frontend && npm install)
    
    echo -e "${GREEN}Node.js environment setup complete!${NC}"
    return 0
}

function check_docker {
    print_header "Checking Docker"
    
    if ! check_command docker; then
        echo -e "${YELLOW}Docker not found. Some features may not work without Docker.${NC}"
        return 1
    fi
    
    if docker info &> /dev/null; then
        echo -e "${GREEN}Docker is running and operational.${NC}"
        return 0
    else
        echo -e "${YELLOW}Docker is installed but not running. Please start Docker.${NC}"
        return 1
    fi
}

function setup_environment_files {
    print_header "Setting up environment files"
    
    # Set up backend .env file if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        echo "Creating backend environment file..."
        cp backend/.env.example backend/.env
    fi
    
    # Set up frontend .env file if it doesn't exist
    if [ ! -f "frontend/.env" ]; then
        echo "Creating frontend environment file..."
        cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
EOL
    fi
    
    echo -e "${GREEN}Environment files setup complete!${NC}"
}

function show_next_steps {
    print_header "MOOJ Development - Next Steps"
    
    # Read the current step from development guide
    CURRENT_PHASE="Phase 2 - Enhanced Features"
    NEXT_STEP="Improved problem management"
    
    echo -e "${YELLOW}Current Phase: $CURRENT_PHASE${NC}"
    echo -e "${YELLOW}Next Implementation Step: $NEXT_STEP${NC}"
    echo ""
    echo -e "${WHITE}To continue implementation:${NC}"
    echo -e "${WHITE}1. Start backend: ./scripts/run_backend_local.sh${NC}"
    echo -e "${WHITE}2. Start frontend: ./scripts/run_frontend_local.sh${NC}"
    echo -e "${WHITE}3. OR run both with Docker: ./scripts/deploy_local.sh${NC}"
    echo ""
    echo -e "${WHITE}Review documentation in docs/ directory:${NC}"
    echo -e "${WHITE}- Development Guide: docs/development/guide.md${NC}"
    echo -e "${WHITE}- Implementation Plan: docs/implementation-plan.md${NC}"
    echo -e "${WHITE}- Technical Specification: docs/technical-specification.md${NC}"
    echo ""
    echo -e "${WHITE}For development rules, see: docs/development/cursor_rules.md${NC}"
}

# Main execution
print_header "MOOJ Development Environment Setup"

echo "This script will set up your development environment for continuing MOOJ implementation."
echo "It will check dependencies, set up virtual environments, and guide you to the next steps."
echo ""

# Execute functions
install_python_dependencies
PYTHON_SETUP=$?

install_node_dependencies
NODE_SETUP=$?

check_docker
DOCKER_AVAILABLE=$?

setup_environment_files
show_next_steps

print_header "Setup Complete!"
if [ $PYTHON_SETUP -eq 0 ] && [ $NODE_SETUP -eq 0 ] && [ $DOCKER_AVAILABLE -eq 0 ]; then
    echo -e "${GREEN}Your development environment is fully set up and ready for development.${NC}"
elif [ $PYTHON_SETUP -eq 0 ] && [ $NODE_SETUP -eq 0 ]; then
    echo -e "${YELLOW}Your development environment is set up, but Docker is not available.${NC}"
    echo -e "${YELLOW}You can still develop using the non-Docker deployment methods.${NC}"
else
    echo -e "${YELLOW}Your development environment is partially set up. Please address the issues above.${NC}"
fi

# Make script executable when executed
chmod +x scripts/setup_dev_environment.sh 2>/dev/null 
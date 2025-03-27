#!/usr/bin/env pwsh
# MOOJ Development Environment Setup Script

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$Host.UI.RawUI.WindowTitle = "MOOJ Development Setup"

function Write-Header {
    param (
        [string]$Message
    )
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}

function Check-CommandExists {
    param (
        [string]$Command
    )
    
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        return $true
    }
    return $false
}

function Install-PythonDependencies {
    Write-Header "Setting up Python environment"
    
    # Check if Python is installed
    if (-not (Check-CommandExists "python")) {
        Write-Host "Python not found. Please install Python 3.9+ and try again." -ForegroundColor Red
        return $false
    }
    
    # Create virtual environment if it doesn't exist
    if (-not (Test-Path "backend\venv")) {
        Write-Host "Creating virtual environment..."
        python -m venv backend\venv
    }
    
    # Activate virtual environment
    Write-Host "Activating virtual environment..."
    . backend\venv\Scripts\Activate.ps1
    
    # Install dependencies
    Write-Host "Installing Python dependencies..."
    pip install -r backend\requirements.txt
    
    Write-Host "Python environment setup complete!" -ForegroundColor Green
    return $true
}

function Install-NodeDependencies {
    Write-Header "Setting up Node.js environment"
    
    # Check if Node.js is installed
    if (-not (Check-CommandExists "node")) {
        Write-Host "Node.js not found. Please install Node.js 16+ and try again." -ForegroundColor Red
        return $false
    }
    
    # Navigate to frontend directory and install dependencies
    Push-Location frontend
    Write-Host "Installing Node.js dependencies..."
    npm install
    Pop-Location
    
    Write-Host "Node.js environment setup complete!" -ForegroundColor Green
    return $true
}

function Check-Docker {
    Write-Header "Checking Docker"
    
    if (-not (Check-CommandExists "docker")) {
        Write-Host "Docker not found. Some features may not work without Docker." -ForegroundColor Yellow
        return $false
    }
    
    try {
        docker info > $null 2>&1
        Write-Host "Docker is running and operational." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Docker is installed but not running. Please start Docker Desktop." -ForegroundColor Yellow
        return $false
    }
}

function Setup-EnvironmentFiles {
    Write-Header "Setting up environment files"
    
    # Set up backend .env file if it doesn't exist
    if (-not (Test-Path "backend\.env")) {
        Write-Host "Creating backend environment file..."
        Copy-Item "backend\.env.example" "backend\.env"
    }
    
    # Set up frontend .env file if it doesn't exist
    if (-not (Test-Path "frontend\.env")) {
        Write-Host "Creating frontend environment file..."
        @"
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
    }
    
    Write-Host "Environment files setup complete!" -ForegroundColor Green
}

function Show-NextSteps {
    Write-Header "MOOJ Development - Next Steps"
    
    # Read the current step from development guide
    $currentPhase = "Phase 2 - Enhanced Features"
    $nextStep = "Improved problem management"
    
    Write-Host "Current Phase: $currentPhase" -ForegroundColor Yellow
    Write-Host "Next Implementation Step: $nextStep" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To continue implementation:" -ForegroundColor White
    Write-Host "1. Start backend: .\scripts\run_backend_local.ps1" -ForegroundColor White
    Write-Host "2. Start frontend: .\scripts\run_frontend_local.ps1" -ForegroundColor White
    Write-Host "3. OR run both with Docker: .\scripts\deploy_local.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Review documentation in docs/ directory:" -ForegroundColor White
    Write-Host "- Development Guide: docs/development/guide.md" -ForegroundColor White
    Write-Host "- Implementation Plan: docs/implementation-plan.md" -ForegroundColor White
    Write-Host "- Technical Specification: docs/technical-specification.md" -ForegroundColor White
    Write-Host ""
    Write-Host "For development rules, see: docs/development/cursor_rules.md" -ForegroundColor White
}

# Main execution
Write-Header "MOOJ Development Environment Setup"

Write-Host "This script will set up your development environment for continuing MOOJ implementation."
Write-Host "It will check dependencies, set up virtual environments, and guide you to the next steps."
Write-Host ""

$setupPython = Install-PythonDependencies
$setupNode = Install-NodeDependencies
$dockerAvailable = Check-Docker
Setup-EnvironmentFiles
Show-NextSteps

Write-Header "Setup Complete!"
if ($setupPython -and $setupNode -and $dockerAvailable) {
    Write-Host "Your development environment is fully set up and ready for development." -ForegroundColor Green
} 
elseif ($setupPython -and $setupNode) {
    Write-Host "Your development environment is set up, but Docker is not available." -ForegroundColor Yellow
    Write-Host "You can still develop using the non-Docker deployment methods." -ForegroundColor Yellow
}
else {
    Write-Host "Your development environment is partially set up. Please address the issues above." -ForegroundColor Yellow
} 
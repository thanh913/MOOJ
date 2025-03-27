# Run backend tests for MOOJ
# This script runs pytest tests for the backend application

# Move to the backend directory
Push-Location -Path (Join-Path -Path $PSScriptRoot -ChildPath "../backend")

try {
    # Set up virtual environment if it doesn't exist
    if (-not (Test-Path -Path ".venv")) {
        Write-Host "Setting up virtual environment..." -ForegroundColor Yellow
        python -m venv .venv
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create virtual environment"
        }
    }

    # Activate virtual environment
    if ($PSVersionTable.PSEdition -eq "Core") {
        # PowerShell Core
        .\.venv\Scripts\Activate.ps1
    } else {
        # Windows PowerShell
        .\.venv\Scripts\Activate.ps1
    }

    # Install dependencies if needed
    if (-not (Test-Path -Path ".venv\Lib\site-packages\pytest")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install dependencies"
        }
    }

    # Run the tests
    Write-Host "Running tests..." -ForegroundColor Green
    
    # Parse command-line arguments and pass them to pytest
    $pytestArgs = $args
    if ($pytestArgs.Count -eq 0) {
        # Default test command with coverage report
        pytest --cov=app tests/ --cov-report=term-missing
    } else {
        # Run with user-specified arguments
        pytest $pytestArgs
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tests failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    } else {
        Write-Host "All tests passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Return to the original directory
    Pop-Location
} 
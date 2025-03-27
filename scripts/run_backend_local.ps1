# MOOJ Backend Local Run Script (No Docker)

Write-Host "Starting MOOJ Backend locally (without Docker)..." -ForegroundColor Green

# Step 1: Create and activate virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "backend/venv")) {
    Push-Location backend
    python -m venv venv
    Pop-Location
}

# Activate virtual environment
$activateScript = "backend\venv\Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
} else {
    Write-Host "Error: Could not find virtual environment activation script." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Push-Location backend
pip install -r requirements.txt
Pop-Location

# Step 3: Configure environment
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path "backend/.env")) {
    Copy-Item -Path "backend/.env.example" -Destination "backend/.env"
    
    # Update for SQLite (easier local dev without PostgreSQL)
    (Get-Content "backend/.env") -replace "postgresql://postgres:password@localhost:5432/mooj", "sqlite:///./mooj.db" | Set-Content "backend/.env"
    
    # Set a development secret key
    (Get-Content "backend/.env") -replace "your_secret_key_here", "mooj_development_secret_key" | Set-Content "backend/.env"
}

# Step 4: Run the backend
Write-Host "Starting Backend API server..." -ForegroundColor Green
Push-Location backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
Pop-Location 
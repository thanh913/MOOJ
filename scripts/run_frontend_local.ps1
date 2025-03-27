# MOOJ Frontend Local Run Script (No Docker)

Write-Host "Starting MOOJ Frontend locally (without Docker)..." -ForegroundColor Green

# Step 1: Install dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
Push-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
}

# Step 2: Start the development server
Write-Host "Starting Frontend development server..." -ForegroundColor Green
npm start

Pop-Location 
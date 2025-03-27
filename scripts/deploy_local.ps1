# MOOJ Local Deployment Script

Write-Host "Starting MOOJ Local Deployment..." -ForegroundColor Green

# Step 1: Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerStatus = Get-Service -Name *docker* | Where-Object { $_.Name -eq "Docker Desktop Service" }
if (-not $dockerStatus -or $dockerStatus.Status -ne 'Running') {
    Write-Host "Docker is not running! Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running!" -ForegroundColor Green

# Step 2: Ensure .env file exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backend/.env")) {
    Write-Host "Creating .env file from example..." -ForegroundColor Yellow
    Copy-Item -Path "backend/.env.example" -Destination "backend/.env"
    
    # Update database URL to use 'db' as host
    (Get-Content "backend/.env") -replace "postgresql://postgres:password@localhost:5432/mooj", "postgresql://postgres:password@db:5432/mooj" | Set-Content "backend/.env"
    
    # Set a development secret key
    (Get-Content "backend/.env") -replace "your_secret_key_here", "mooj_development_secret_key" | Set-Content "backend/.env"
}
Write-Host "Environment configured!" -ForegroundColor Green

# Step 3: Build and start containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Yellow
docker compose up -d

# Step 4: Check container status
Write-Host "Waiting for containers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
docker compose ps

# Step 5: Display access information
Write-Host "`nMOOJ has been deployed locally!" -ForegroundColor Green
Write-Host "Access the frontend at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Access the backend API at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Health check endpoint: http://localhost:8000/health" -ForegroundColor Cyan

# Step 6: Instructions for logs and shutdown
Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "- To view logs: docker compose logs" -ForegroundColor Gray
Write-Host "- To stop the application: docker compose down" -ForegroundColor Gray 
# MOOJ Problems Seeding Script for PowerShell

Write-Host "Updating problems in the MOOJ database..." -ForegroundColor Green
Write-Host "This script will update existing problems and add new ones if needed." -ForegroundColor Green
Write-Host ""

# Run the seed script inside the backend container
docker compose exec backend python -m scripts.seed_problems

Write-Host ""
Write-Host "Process completed." -ForegroundColor Green 
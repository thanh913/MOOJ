# PowerShell script to install all required dependencies for the MOOJ frontend

Write-Host "Installing dependencies for MOOJ frontend..." -ForegroundColor Green

# Create node_modules directory if it doesn't exist
if (-not (Test-Path -Path "./node_modules")) {
    Write-Host "Creating node_modules directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "./node_modules" -Force | Out-Null
}

# Core dependencies
Write-Host "Installing React core dependencies..." -ForegroundColor Cyan
npm install react react-dom @types/react @types/react-dom

# Routing
Write-Host "Installing routing dependencies..." -ForegroundColor Cyan
npm install react-router-dom @types/react-router-dom

# UI framework
Write-Host "Installing Material-UI dependencies..." -ForegroundColor Cyan
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# State management
Write-Host "Installing state management dependencies..." -ForegroundColor Cyan
npm install @reduxjs/toolkit react-redux @types/react-redux

# Form handling
Write-Host "Installing form handling dependencies..." -ForegroundColor Cyan
npm install formik yup

# API client
Write-Host "Installing API client..." -ForegroundColor Cyan
npm install axios

# Math and LaTeX
Write-Host "Installing Math and LaTeX rendering dependencies..." -ForegroundColor Cyan
npm install react-markdown remark-math rehype-katex katex

# Development dependencies
Write-Host "Installing development dependencies..." -ForegroundColor Cyan
npm install --save-dev typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-react eslint-plugin-react-hooks

Write-Host "All dependencies installed successfully!" -ForegroundColor Green
Write-Host "You can now start the development server with: npm start" -ForegroundColor Green 
# PowerShell script to fix common dependency issues in the MOOJ frontend

Write-Host "Fixing dependencies for MOOJ frontend..." -ForegroundColor Green

# Remove node_modules and package-lock.json to ensure clean install
if (Test-Path -Path "./node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "./node_modules"
}

if (Test-Path -Path "./package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force "./package-lock.json"
}

# Install specific versions of problematic packages
Write-Host "Installing remark-math and rehype-katex packages..." -ForegroundColor Cyan
npm install remark-math@5.1.1 rehype-katex@6.0.3 katex@0.16.8

# Install other required dependencies
Write-Host "Installing React Markdown related packages..." -ForegroundColor Cyan
npm install react-markdown@8.0.7

# Install React and Material UI
Write-Host "Installing React and Material UI..." -ForegroundColor Cyan
npm install react@18.2.0 react-dom@18.2.0 @mui/material@5.14.3 @mui/icons-material@5.14.3 @emotion/react@11.11.1 @emotion/styled@11.11.0

# Install React Router
Write-Host "Installing React Router..." -ForegroundColor Cyan
npm install react-router-dom@6.14.2

# Install development dependencies
Write-Host "Installing TypeScript and ESLint..." -ForegroundColor Cyan
npm install --save-dev typescript@4.9.5 @types/react@18.2.15 @types/react-dom@18.2.7

# Run the clean installation
Write-Host "Running npm install to ensure all dependencies are correct..." -ForegroundColor Cyan
npm install

Write-Host "Dependencies fixed! You should now be able to run the application." -ForegroundColor Green
Write-Host "Run 'npm start' to start the development server." -ForegroundColor Green 
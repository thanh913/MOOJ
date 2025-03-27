# MOOJ Deployment Guide

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Deployment](#2-local-deployment)
   - [Option 1: Deploy with Docker](#21-option-1-deploy-with-docker-recommended)
   - [Option 2: Deploy Without Docker](#22-option-2-deploy-without-docker)
   - [macOS Setup Guide](#23-macos-setup-guide)
3. [Production Deployment](#3-production-deployment)
   - [Manual Production Deployment](#31-manual-production-deployment)
   - [Production Considerations](#32-production-considerations)
4. [Troubleshooting](#4-troubleshooting)
   - [Docker Issues](#41-docker-issues)
   - [Backend Issues](#42-backend-issues)
   - [Frontend Issues](#43-frontend-issues)

This document provides instructions for deploying MOOJ in different environments.

## 1. Prerequisites

- Git
- Docker Desktop (for Docker deployment)
- Python 3.9+ (for non-Docker backend deployment)
- Node.js 16+ (for non-Docker frontend deployment)

## 2. Local Deployment

### 2.1 Option 1: Deploy with Docker (Recommended)

#### Install Docker Desktop

1. Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop and wait for it to initialize

#### Deploy MOOJ

1. Run the deployment script:

```powershell
.\scripts\deploy_local.ps1
```

This script will:
- Check if Docker is running
- Create the necessary environment files
- Build and start the containers
- Display access information

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Health check: http://localhost:8000/health

3. To stop the application:

```powershell
docker compose down
```

### 2.2 Option 2: Deploy Without Docker

If you prefer not to use Docker, you can run the backend and frontend separately.

#### Run Backend

1. Run the backend script:

```powershell
.\scripts\run_backend_local.ps1
```

This script will:
- Set up a Python virtual environment
- Install dependencies
- Configure environment variables
- Start the backend server

2. The backend will be available at: http://localhost:8000

#### Run Frontend

1. In a separate terminal, run the frontend script:

```powershell
.\scripts\run_frontend_local.ps1
```

This script will:
- Install Node.js dependencies
- Start the frontend development server

2. The frontend will be available at: http://localhost:3000

### 2.3 macOS Setup Guide

For macOS users, the setup and deployment process is streamlined with provided shell scripts:

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd mooj
   ```

2. **Set Up Development Environment**
   
   Make the setup script executable and run it:
   ```bash
   chmod +x scripts/setup_dev_environment.sh
   ./scripts/setup_dev_environment.sh
   ```
   
   This script will:
   - Create necessary Python virtual environment for backend
   - Install all required Python dependencies
   - Set up Node.js environment for frontend
   - Install all frontend dependencies
   - Create and configure .env files
   - Verify Docker installation if available
   - Show the current implementation phase from the development guide

3. **Run the Backend**
   
   Make the backend script executable and run it:
   ```bash
   chmod +x scripts/run_backend_local.sh
   ./scripts/run_backend_local.sh
   ```
   
   The backend server will start at http://localhost:8000

4. **Run the Frontend**
   
   In a separate terminal, make the frontend script executable and run it:
   ```bash
   chmod +x scripts/run_frontend_local.sh
   ./scripts/run_frontend_local.sh
   ```
   
   The frontend development server will start at http://localhost:3000

5. **Run with Docker (Optional)**
   
   If you prefer to use Docker for both services:
   ```bash
   chmod +x scripts/deploy_local.sh
   ./scripts/deploy_local.sh
   ```

6. **Run Tests**
   
   To run backend tests:
   ```bash
   chmod +x scripts/run_backend_tests.sh
   ./scripts/run_backend_tests.sh
   ```
   
   This will run all tests in the backend/tests directory and show the results.

7. **Verify Installation**
   
   - Backend API: http://localhost:8000/docs
   - Frontend: http://localhost:3000
   - Health check: http://localhost:8000/health

All these scripts exist in the repository, so the setup process is consistent across different operating systems while accounting for platform-specific differences.

## 3. Production Deployment

### 3.1 Manual Production Deployment

1. Clone the Repository

```bash
git clone <repository-url>
cd mooj
```

2. Environment Setup

Create and configure backend environment file:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file to configure your environment:
- Set a secure `SECRET_KEY`
- Configure database credentials
- Set appropriate CORS origins

3. Deploy with Docker Compose

From the project root directory:

```bash
docker-compose up -d
```

This command will:
- Build the Docker images for frontend and backend
- Start the PostgreSQL database
- Start the backend FastAPI server
- Start the frontend React application

4. Verify Deployment

- Backend Health Check: Visit `http://localhost:8000/health`
- Frontend Access: Visit `http://localhost:3000`

5. Database Setup

Initial database migrations are applied automatically when the backend starts.

### 3.2 Production Considerations

For production deployment:

1. Use a proper reverse proxy (Nginx, Traefik)
2. Configure HTTPS with proper certificates
3. Set up database backups
4. Configure proper logging and monitoring
5. Set appropriate resource limits for containers
6. Use separate .env files for different environments

## 4. Troubleshooting

### 4.1 Docker Issues

- Make sure Docker Desktop is running
- Check container logs: `docker compose logs`
- Restart containers: `docker compose restart`
- Rebuild containers if necessary: `docker compose up -d --build`

### 4.2 Backend Issues

- Check if the virtual environment is activated
- Verify that all dependencies are installed
- Look for error messages in the terminal output

### 4.3 Frontend Issues

- Check if Node.js is installed correctly
- Verify that all dependencies are installed
- Look for error messages in the terminal output 
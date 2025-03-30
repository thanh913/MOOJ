# Setup & Installation

Guide for setting up and running MOOJ locally using Docker.

## Prerequisites

*   **Docker & Docker Compose**: Installed and running.
*   **Git**: To clone the repository.
*   **(Optional) Node.js (v16+), Python (3.9+)**: Only for development outside Docker.

## Quick Start with Docker

1.  **Clone**: `git clone <repo_url> && cd mooj`
2.  **Env Vars**: `cp .env.example .env` (Review defaults)
3.  **Build & Start**: `docker compose up --build` (Use `-d` for detached mode)
4.  **Access**: [http://localhost:3000](http://localhost:3000)

## Detailed Setup Steps

### 1. Clone Repository
```bash
git clone <repo_url>
cd mooj
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (default values work for local development)
```

### 3. Optional: Seed Database
```bash
# May need to make executable first
chmod +x seed_problems.sh
./seed_problems.sh
```

### 4. Build and Start Containers
```bash
# Build and start in foreground
docker compose up --build

# Or in detached mode
docker compose up --build -d
```

### 5. Verify Setup

After starting, check that:

1. Frontend is accessible at [http://localhost:3000](http://localhost:3000)
2. Backend API is accessible at [http://localhost:8000/api/v1/ping](http://localhost:8000/api/v1/ping)
3. Database container is healthy: `docker compose ps`

### 6. Stopping

*   Foreground: `Ctrl + C`
*   Detached: `docker compose down` (Use `-v` to remove volumes if needed)

## Backend Environment Variables

All backend configuration is managed through environment variables.
See `.env.example` for all required variables. Ensure these are properly set before running the application.

Key variables include:

```
# Database connection
DATABASE_URL=postgresql://postgres:postgres@db:5432/mooj

# API Configuration
API_PREFIX=/api/v1

# JWT Authentication (if used)
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Running Backend Tests

### Using Test Scripts

For Windows (PowerShell):
```powershell
.\scripts\run_backend_tests.ps1
```

For Unix (Bash):
```bash
./scripts/run_backend_tests.sh
```

## Troubleshooting

### Container Issues

*   **Container won't start**: Check logs: `docker compose logs <service_name>`
*   **Port conflicts**: Adjust host ports in `docker-compose.yml` if needed
*   **Database connection errors**: Ensure `db` container is healthy before other services
*   **Frontend can't reach backend**: Check CORS settings in backend and API URL in frontend
*   **Seeding fails**: Ensure `db` container is fully initialized before running seed script

### Common Docker Commands

```bash
# View running containers
docker compose ps

# View container logs
docker compose logs -f <service_name>

# Restart a service
docker compose restart <service_name>

# Force rebuild a service
docker compose up -d --build <service_name>
```

## Frequently Asked Questions

**Q: How do I update dependencies?**  
A: For backend, update `requirements.txt` and rebuild the container. For frontend, update `package.json` and rebuild.

**Q: How can I connect to the database directly?**  
A: Use `docker compose exec db psql -U postgres -d mooj` to access the PostgreSQL CLI.

**Q: How do I view backend logs?**  
A: Use `docker compose logs -f backend` to follow the logs in real-time.

**Q: Can I develop without Docker?**  
A: Yes, but it's more complex. You'd need to:
1. Install Python and Node.js
2. Set up a PostgreSQL database
3. Configure environment variables manually
4. Run the backend with `uvicorn` and frontend with `npm start`

**Q: What ports does MOOJ use by default?**  
A: Frontend: 3000, Backend API: 8000, PostgreSQL: 5432.

**See also:**
- [Development Guide](./development.md) for next steps after setup
- [Usage Guide](./usage.md) for using MOOJ features 
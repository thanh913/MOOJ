# Setup & Installation

Guide for setting up and running MOOJ locally using Docker.

## Prerequisites

*   **Docker & Docker Compose**: Installed and running.
*   **Git**: To clone the repository.
*   **(Optional) Node.js (v16+), Python (3.9+)**: Only for development outside Docker.

## Running with Docker (Recommended)

1.  **Clone**: `git clone <repo_url> && cd mooj`
2.  **Env Vars**: `cp .env.example .env` (Review defaults).
3.  **Seed DB (Optional)**: `./seed_problems.sh` (May need `chmod +x`).
4.  **Build & Start**: `docker compose up --build` (Use `-d` for detached mode).
5.  **Access**: [http://localhost:3000](http://localhost:3000)

## Stopping

*   Foreground: `Ctrl + C`
*   Detached: `docker compose down` (Use `-v` to remove volumes).

## Troubleshooting

*   **Port Conflicts**: Adjust host ports in `docker-compose.yml` if needed.
*   **Docker Errors**: Check logs: `docker compose logs <service_name>`.
*   **Seeding Fails**: Ensure `db` container is healthy first. 
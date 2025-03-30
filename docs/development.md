# Development Guide

Information for MOOJ contributors.

## Project Structure

See [Architecture](./architecture.md) for component details.

```
/mooj
├── backend/          # FastAPI API
├── frontend/         # React UI
├── judge-worker/     # Async Evaluation Service (Planned)
├── docs/             # Documentation
├── tests/            # Backend Integration Tests
├── docker-compose.yml
├── seed_problems.sh
└── ...               # Configs, requirements, etc.
```

## General Workflow

1.  **Branching**: Use feature branches (e.g., `feature/add-auth`, `fix/filter-bug`).
2.  **Dependencies**: Add to `requirements.txt` (Backend) or `package.json` (Frontend) and rebuild relevant Docker image.
3.  **Code Style**: Python (PEP 8), TypeScript (ESLint/Prettier). See `.cursorrules`.
4.  **Testing**: Add `pytest` tests for backend changes.
5.  **Docker**: Ensure `docker compose up --build` works.
6.  **Commits**: Atomic, descriptive messages (e.g., `feat(backend): ...`). See `.cursorrules`.
7.  **Documentation**: Update `/docs` as needed.

## Frontend Details (React)

*   **UI**: Material-UI.
*   **State**: RTK Query (`src/store/api.ts`) for server state; Redux slices (`src/store/slices/`) or `useState` for UI state.
*   **Types**: Use TypeScript effectively (`src/types/`).
*   **Testing**: React Testing Library.

## Backend Details (FastAPI)

*   **Structure**: `backend/app/` (api, crud, db, schemas, services).
*   **API**: Endpoints in `api/endpoints/`. Use Pydantic `schemas/` for validation. Dependency Injection (`Depends`).
*   **DB**: CRUD operations in `crud/`, models in `db/models/` (SQLAlchemy).
*   **Logic**: Business logic in `services/`.
*   **Auth**: JWT.
*   **Config**: Environment variables (`.env`).

## Testing (Backend - Pytest)

*   **Framework**: `pytest`.
*   **Location**: `backend/tests/`.
*   **Running**: Use scripts (`./scripts/run_backend_tests.sh`) or `pytest` directly (e.g., `pytest backend/tests/api/test_problems.py`).
*   **Fixtures**: `db`, `client` in `backend/tests/conftest.py`.
*   **Types**: Unit, Integration, API (`TestClient`), Database tests.
*   **Focus**: Test endpoints, CRUD operations, and business logic.

## Common Solutions

*   **Docker Build**: Check Dockerfile, network.
*   **Container Start**: `docker compose logs <service_name>`.
*   **API Connection**: Check URLs, CORS, network.
*   **DB**: Ensure `db` container is healthy, check credentials.
*   **Frontend Deps**: Try removing `node_modules`, `package-lock.json`, then `npm install` locally or rebuild container. 
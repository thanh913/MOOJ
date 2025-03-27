# Backend Documentation

This directory contains documentation specific to the MOOJ backend.

## Available Documentation

- [Development Guide](DEVELOPMENT.md) - Guidelines and best practices for backend development
- [Testing Guide](TESTING.md) - Testing approach and strategies for the backend

## Getting Started

For basic setup and running instructions, see the [main project README](../../README.md).

## Directory Structure

The backend follows a standard FastAPI application structure:

```
backend/
├── app/                      # Main application code
│   ├── api/                  # API router and endpoints
│   │   └── v1/               # API version 1
│   │       ├── endpoints/    # Resource-specific endpoints
│   │       └── api.py        # Main API router
│   ├── core/                 # Core functionality
│   │   └── config.py         # Application configuration
│   ├── crud/                 # CRUD database operations
│   ├── db/                   # Database setup and models
│   │   ├── models/           # SQLAlchemy models
│   │   ├── session.py        # Database session
│   │   └── base.py           # Base model class
│   ├── evaluation/           # Evaluation pipeline
│   ├── schemas/              # Pydantic schemas
│   └── main.py               # Entry point
├── docs/                     # Backend documentation
│   ├── DEVELOPMENT.md        # Development guide
│   └── TESTING.md            # Testing guide
├── tests/                    # Test suite
│   ├── api/                  # API tests
│   ├── core/                 # Core functionality tests
│   ├── crud/                 # CRUD operation tests
│   ├── db/                   # Database tests
│   ├── evaluation/           # Evaluation pipeline tests
│   ├── utils/                # Test utilities
│   └── conftest.py           # Test fixtures
├── .env                      # Environment variables
├── .env.example              # Example environment file
├── requirements.txt          # Python dependencies
├── pytest.ini                # Pytest configuration
├── Dockerfile                # Docker configuration
└── healthcheck.py            # Container health check
```

## Technology Stack

- FastAPI
- SQLAlchemy (ORM)
- Pydantic
- PostgreSQL
- JWT Authentication
- OpenCV and Tesseract for image processing
- Pytest for testing

## Testing

For information on how to run tests and write new tests, see the [Testing Guide](TESTING.md).

To run the tests:

```bash
# Windows
.\scripts\run_backend_tests.ps1

# Unix
./scripts/run_backend_tests.sh
``` 
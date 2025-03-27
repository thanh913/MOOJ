# Backend Development Guide

This document contains backend-specific information and guidelines for MOOJ developers.

## API Development Guidelines

- Use FastAPI dependency injection for common functionality
- Create API endpoints in appropriate modules under `api/v1/endpoints/`
- Use request and response Pydantic models from `schemas/`
- Handle validation in schema definitions, not in endpoint functions
- Follow RESTful practices for endpoint design
- Include proper error handling and status codes

## Database Access

- Use SQLAlchemy models in `db/models/`
- Create CRUD operations in `crud/` modules
- Access the database through dependency injection:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

@app.get("/items")
async def read_items(db: Session = Depends(get_db)):
    return db.query(Item).all()
```

## Authentication

- Use JWT tokens for auth
- Access current user through dependency injection:

```python
from app.core.auth import get_current_user
from app.db.models.user import User

@app.get("/profile")
async def read_profile(current_user: User = Depends(get_current_user)):
    return current_user
```

## Error Handling

Use FastAPI's HTTPException for error responses:

```python
from fastapi import HTTPException

if not item:
    raise HTTPException(status_code=404, detail="Item not found")
```

## Evaluation Pipeline

The evaluation pipeline is modular and consists of these components:

1. `image_to_LaTeX` - Converts image submissions to LaTeX
2. `find_all_errors` - Identifies errors in the proof
3. `evaluate_solution` - Provides score and feedback based on errors
4. `return_evaluation` - Orchestrates the entire evaluation process

When implementing these modules, follow these guidelines:

- Use async functions for I/O bound operations
- Implement proper error handling and logging
- Add appropriate retries for external service calls
- Include comprehensive unit tests

## Testing

- Write unit tests for all modules
- Use pytest fixtures for database testing
- Mock external dependencies

Example test:

```python
def test_read_item(client, test_db):
    # Setup
    item = ItemFactory()  # Create test item
    test_db.add(item)
    test_db.commit()
    
    # Execute
    response = client.get(f"/items/{item.id}")
    
    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == item.id
```

## Performance Considerations

- Use async where appropriate for I/O bound operations
- Add caching for expensive operations
- Use database indexes for frequent queries
- Implement pagination for list endpoints

## Environment Variables

All configuration should be managed through environment variables.
See `.env.example` for all required variables.

## File Organization

Follow these patterns for adding new files:

- API endpoints: `app/api/v1/endpoints/{resource}.py`
- Database models: `app/db/models/{model}.py`
- Schemas: `app/schemas/{schema}.py`
- CRUD operations: `app/crud/{resource}.py`
- Tests: `app/tests/{module}_{test_type}.py`

For project setup and general information, refer to the [main project README](../../README.md). 
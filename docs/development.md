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

## Table of Contents

- [General Workflow](#general-workflow)
- [Frontend Details](#frontend-details-react)
- [Backend Details](#backend-details-fastapi)
  - [API Development Guidelines](#api-development-guidelines)
  - [Database Access](#database-access)
  - [Authentication](#authentication)
  - [Error Handling](#error-handling)
  - [Evaluation Pipeline](#evaluation-pipeline)
  - [Performance Considerations](#performance-considerations)
  - [Backend File Organization](#backend-file-organization)
- [Testing](#testing-backend---pytest)
- [Common Solutions](#common-solutions)
- [FAQ](#frequently-asked-questions)

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

### API Development Guidelines

- Use FastAPI dependency injection for common functionality
- Create API endpoints in appropriate modules under `api/v1/endpoints/`
- Use request and response Pydantic models from `schemas/`
- Handle validation in schema definitions, not in endpoint functions
- Follow RESTful practices for endpoint design
- Include proper error handling and status codes

### Database Access

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

### Authentication

- Use JWT tokens for auth
- Access current user through dependency injection:

```python
from app.core.auth import get_current_user
from app.db.models.user import User

@app.get("/profile")
async def read_profile(current_user: User = Depends(get_current_user)):
    return current_user
```

### Error Handling

Use FastAPI's HTTPException for error responses:

```python
from fastapi import HTTPException

if not item:
    raise HTTPException(status_code=404, detail="Item not found")
```

### Evaluation Pipeline

The evaluation pipeline is the core of MOOJ's functionality, responsible for processing and evaluating mathematical proofs. This section provides implementation details for developers working on this component.

#### Pipeline Structure

The evaluation pipeline consists of four main components:

1. **`image_to_LaTeX`** - Converts image submissions to LaTeX text format
2. **`find_all_errors`** - Analyzes LaTeX proof for logical and mathematical errors
3. **`evaluate_solution`** - Generates score and feedback based on detected errors
4. **`return_evaluation`** - Orchestrates the entire evaluation process and formats results

#### Current Implementation

```python
# Simplified implementation (see actual code for details)
async def return_evaluation(submission_id: int, db: Session):
    submission = crud.submission.get(db, id=submission_id)
    
    if submission.input_type == InputType.IMAGE:
        latex_text = await image_to_LaTeX(submission.content)
    else:
        latex_text = submission.content
    
    errors = find_all_errors(latex_text, submission.problem_id)
    result = evaluate_solution(errors)
    
    # Update submission in database
    crud.submission.update(
        db, 
        db_obj=submission,
        obj_in={
            "status": SubmissionStatus.COMPLETED,
            "score": result.score,
            "feedback": result.feedback,
            "errors": result.errors
        }
    )
    
    return result
```

#### Implementation Requirements

When working on the evaluation pipeline, follow these guidelines:

- **Asynchronous Processing**: Use `async`/`await` for I/O-bound operations
- **Error Handling**: Implement comprehensive error handling and logging
- **Retry Logic**: Add appropriate retries for external service calls
- **Test Coverage**: Include unit tests for each component
- **Input Validation**: Validate all inputs before processing

#### Integration with Future Judge Worker

In the target architecture, this pipeline will be moved to a separate Judge Worker service:

1. The Backend API will publish a task to RabbitMQ
2. The Judge Worker will consume the task and run the evaluation pipeline
3. Results will be written back to the database

#### Database Schema Integration

The evaluation pipeline interacts with these database models:

- **Problem**: Contains the problem statement and expected solution structure
- **Submission**: Stores the user's submission and evaluation results
- **Error**: Represents individual errors found in the submission

### Performance Considerations

- Use async where appropriate for I/O bound operations
- Add caching for expensive operations
- Use database indexes for frequent queries
- Implement pagination for list endpoints

### Backend File Organization

Follow these patterns for adding new files:

- API endpoints: `app/api/v1/endpoints/{resource}.py`
- Database models: `app/db/models/{model}.py`
- Schemas: `app/schemas/{schema}.py`
- CRUD operations: `app/crud/{resource}.py`
- Tests: `app/tests/{module}_{test_type}.py`

## Testing (Backend - Pytest)

*   **Framework**: `pytest`.
*   **Location**: `backend/tests/`.
*   **Running**: Use scripts (`./scripts/run_backend_tests.sh`) or `pytest` directly (e.g., `pytest backend/tests/api/test_problems.py`).
*   **Fixtures**: `db`, `client` in `backend/tests/conftest.py`.
*   **Types**: Unit, Integration, API (`TestClient`), Database tests.
*   **Focus**: Test endpoints, CRUD operations, and business logic.

### Test Structure

Backend tests are organized in a directory structure that mirrors the application code:

```
backend/tests/
├── api/          # API endpoint tests
├── core/         # Core functionality tests
├── crud/         # CRUD operation tests
├── db/           # Database tests
├── evaluation/   # Evaluation pipeline tests
├── utils/        # Test utilities
└── conftest.py   # Test fixtures and configuration
```

### Running Specific Tests

You can run specific test modules or use markers to select tests:

```bash
# Run a specific test module
.\scripts\run_backend_tests.ps1 tests/api/test_ping.py

# Run tests with specific markers
.\scripts\run_backend_tests.ps1 -m "api"

# Run tests with specific name pattern
.\scripts\run_backend_tests.ps1 -k "test_ping"
```

### Coverage Reports

Generate code coverage reports:

```bash
.\scripts\run_backend_tests.ps1 --cov=app tests/ --cov-report=html
```

### Test Types in Detail

#### Unit Tests

Unit tests focus on testing individual functions, classes, and modules in isolation. External dependencies are mocked to ensure that tests are focused and stable.

Example:
```python
def test_validate_user_data():
    user_data = {"username": "testuser", "email": "test@example.com"}
    result = validate_user_data(user_data)
    assert result is True
```

#### Integration Tests

Integration tests verify that different parts of the application work together correctly. These tests may involve multiple modules or interactions with the database.

Example:
```python
def test_create_user_workflow(db):
    # Test the full workflow of creating a user
    user_data = {"username": "testuser", "email": "test@example.com"}
    user = create_user(db, user_data)
    assert user.username == "testuser"
    assert user.email == "test@example.com"
```

#### API Tests

API tests verify that the API endpoints respond correctly to different requests. These tests use FastAPI's `TestClient` to make requests and verify responses.

Example:
```python
def test_ping_endpoint(client):
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"ping": "pong!"}
```

#### Database Tests

Database tests verify that database operations work correctly. These tests use an in-memory SQLite database to ensure that they are fast and don't affect production data.

Example:
```python
def test_create_model(db):
    test_item = TestModel(name="Test Item", description="This is a test item")
    db.add(test_item)
    db.commit()
    db.refresh(test_item)
    
    retrieved_item = db.query(TestModel).filter(TestModel.id == test_item.id).first()
    assert retrieved_item is not None
    assert retrieved_item.name == "Test Item"
```

### Testing the Evaluation Pipeline

The evaluation pipeline is tested using mock data and mock responses for external services. Each component of the pipeline is tested in isolation, and the complete pipeline is tested as an integrated unit.

Example:
```python
@pytest.mark.evaluation
def test_image_to_latex_conversion():
    with patch('app.evaluation.image_to_latex.convert_image_to_latex') as mock_convert:
        mock_convert.return_value = r"\frac{a}{b} = c"
        
        img = Image.new('RGB', (100, 100), color='white')
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        with patch.dict('sys.modules', {
            'app.evaluation.image_to_latex': MagicMock()
        }):
            from app.evaluation.image_to_latex import convert_image_to_latex
            result = convert_image_to_latex(img_str)
            assert result == r"\frac{a}{b} = c"
```

### Best Practices for Writing Tests

1. **Test one thing at a time**: Each test should verify a single behavior.
2. **Use descriptive names**: Test names should describe what is being tested.
3. **Use fixtures**: Use fixtures to share common setup code.
4. **Clean up after tests**: Tests should clean up any resources they create.
5. **Mock external dependencies**: Use mocks to isolate tests from external dependencies.
6. **Keep tests fast**: Tests should be fast to encourage frequent running.
7. **Use parametrized tests**: Use `@pytest.mark.parametrize` to test multiple inputs.
8. **Test edge cases**: Include tests for edge cases and error conditions.

## Common Solutions

*   **Docker Build**: Check Dockerfile, network.
*   **Container Start**: `docker compose logs <service_name>`.
*   **API Connection**: Check URLs, CORS, network.
*   **DB**: Ensure `db` container is healthy, check credentials.
*   **Frontend Deps**: Try removing `node_modules`, `package-lock.json`, then `npm install` locally or rebuild container.

## Frequently Asked Questions

**Q: How do I add a new submission evaluation component?**  
A: The evaluation pipeline is modular by design. To add a new component:
1. Create a new function in the appropriate module in `backend/app/evaluation/`
2. Write comprehensive tests for your component
3. Integrate it with the existing pipeline in `return_evaluation`
4. Update the dependency injection if needed

**Q: How can I modify the error detection logic?**  
A: The error detection logic is in the `find_all_errors` function. You can extend it by:
1. Adding new error types to the Error model
2. Implementing new detection algorithms for specific error types
3. Updating the scoring algorithm to account for the new error types

**Q: How do I test changes to the evaluation pipeline?**  
A: The evaluation pipeline has a comprehensive test suite:
1. Use existing fixtures in `tests/conftest.py`
2. Mock external dependencies (especially for OCR)
3. Test each component in isolation first
4. Add integration tests for the full pipeline

**Q: Where is the feedback generation logic?**  
A: The feedback generation is handled in the `evaluate_solution` function, which:
1. Takes the list of errors from `find_all_errors`
2. Generates a score based on error types and severity
3. Creates human-readable feedback for each error
4. Returns a combined evaluation result

**See also:**
- [Architecture > Evaluation Pipeline](./architecture.md#data-flow--evaluation-pipeline) for system flow
- [Architecture > Current Implementation vs. Target Architecture](./architecture.md#current-implementation-vs-target-architecture) for migration plans 
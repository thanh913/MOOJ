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

### Problem Difficulty

Problem difficulty in MOOJ is stored as float values in the range of 1.0 to 9.0. This scale is used consistently across the backend and frontend. The frontend displays these values directly without scaling.

The scale is defined as follows (with suggested color coding):

- **1.0 - 1.5: Easy (Green)**
  - *Description:* Requires direct application of a definition, formula, or algorithm.
- **2.0 - 3.5: Intermediate (Blue)**
  - *Description:* Involves standard multi-step procedures or predictable combination of concepts.
- **4.0 - 6.0: Advanced (Yellow)**
  - *Description:* Needs synthesis of distinct concepts or creative adaptation of standard techniques.
- **6.5 - 8.0: Expert (Red)**
  - *Description:* Demands strategic application of advanced techniques, significant synthesis, or key insights.
- **8.5 - 9.0: Master (Deep Red)**
  - *Description:* Requires deep insight, novel strategies, synthesis across advanced fields, or high technicality.

See the [Usage Guide](./usage.md#creating-a-new-problem) for more detailed examples for each tier.

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

The evaluation pipeline processes and evaluates mathematical proofs using a modular, extensible architecture that allows for different evaluation strategies.

**See Also:**
- [Architecture > Judging Flow](./architecture.md#judging-flow) for the high-level workflow and component overview.

#### Evaluator Interface (`backend/app/evaluation/interfaces.py`)

The core of the system is an interface that all evaluator implementations must follow:

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any

# Assuming models and schemas are importable or defined elsewhere
# from app.db import models
# from app.schemas import ErrorAppeal

class BaseEvaluator(ABC):
    """Base class that all evaluators must implement."""
    
    @abstractmethod
    def find_errors(self, solution_text: str, problem_id: int, # Potentially add problem context if needed
                      submission: models.Submission) -> List[ErrorDetail]:
        """Analyze a solution and identify errors."""
        pass
        
    @abstractmethod
    def evaluate(self, errors: List[ErrorDetail], submission: models.Submission, 
                 problem: models.Problem) -> EvaluationResult:
        """Generate an evaluation result based on current errors.
           Considers active and rejected errors.
        """
        pass
        
    @abstractmethod
    def process_appeal(self, appeals: List[ErrorAppeal], 
                       submission: models.Submission, 
                       problem: models.Problem) -> None: # Or return updated errors list
        """Process a batch of appeals for a submission.
           Should update the status of errors within the submission.errors list.
        """
        pass
        
    @classmethod
    @abstractmethod
    def get_evaluator_info(cls) -> Dict[str, Any]:
        """Return metadata about this evaluator."""
        pass
```

*Note: The exact return type and parameter types for context (`submission`, `problem`) might need adjustment based on actual implementation details and imports.* 

#### Evaluator Router (`backend/app/evaluation/router.py`)

The router component selects the appropriate evaluator implementation based on configuration and delegates calls to the chosen evaluator instance, adapting arguments as needed for the `BaseEvaluator` interface.

#### Placeholder Evaluator Implementation

The placeholder evaluator provides a simple implementation that generates random errors and processes appeals:

```python
class PlaceholderEvaluator(BaseEvaluator):
    """Placeholder implementation that generates random errors."""
    
    def find_errors(self, solution_text: str, problem_id: int) -> List[ErrorDetail]:
        """Generate 0-4 random errors."""
        # Generate random number of errors (0-4)
        num_errors = random.randint(0, 4)
        
        errors = []
        for i in range(num_errors):
            errors.append({
                "id": f"err-{uuid.uuid4()}",
                "description": f"Error in your solution: {random.choice(self.ERROR_MESSAGES)}",
                "severity": random.choice([True, False]),  # True = non_trivial, False = trivial
                "status": "active"
            })
            
        return errors
        
    def evaluate(self, errors: List[ErrorDetail], solution_text: str, problem_id: int) -> EvaluationResult:
        """Generate evaluation based on errors."""
        # Success if no non-trivial errors
        has_non_trivial = any(error["severity"] for error in errors)
        
        return {
            "status": "failure" if has_non_trivial else "success",
            "score": 0 if has_non_trivial else 100,
            "errors": errors
        }
        
    def process_appeal(self, error_id: str, justification: str) -> AppealResult:
        """Process an appeal with random chance of success."""
        # Require justification
        if not justification or len(justification.strip()) < 5:
            return {
                "success": False,
                "error": {
                    "id": error_id,
                    "status": "rejected",
                    "description": "Appeal rejected: No justification provided",
                    "severity": True  # Non-trivial
                }
            }
            
        # 50% chance of success if justification provided
        success = random.random() > 0.5
        
        return {
            "success": success,
            "error": {
                "id": error_id,
                "status": "resolved" if success else "rejected",
                "description": "Original error description",
                "severity": True if not success else False  # Downgrade severity if successful
            }
        }
        
    @classmethod
    def get_evaluator_info(cls) -> Dict[str, Any]:
        """Return metadata about this evaluator."""
        return {
            "name": "placeholder",
            "version": "1.0.0",
            "description": "Placeholder evaluator that generates random errors and processes appeals",
            "capabilities": ["error_generation", "appeal_processing"]
        }
        
    # Sample error messages
    ERROR_MESSAGES = [
        "Incorrect application of the chain rule",
        "Missing step in your proof",
        "Logical fallacy in your reasoning",
        "Incorrect formula used",
        "Calculation error",
        # Add more as needed
    ]
```

#### Directory Structure

The evaluation pipeline is organized in a modular structure where each file corresponds to a specific functionality:

```
backend/app/evaluation/
├── __init__.py             # Public exports
├── interfaces.py           # Type definitions and interfaces
├── router.py               # Evaluator selection logic
├── utils.py                # Shared utilities
├── config.py               # Configuration system
└── evaluators/             # Evaluator implementations
    ├── __init__.py         # Exports available evaluators
    ├── base.py             # Abstract base class for evaluators 
    └── placeholder/        # Placeholder implementation
        ├── __init__.py     # Package exports
        ├── evaluator.py    # Main evaluator class that combines components
        ├── find_errors.py  # Implementation of find_errors method
        ├── evaluate.py     # Implementation of evaluate method
        └── appeal.py       # Implementation of process_appeal method
```

Each evaluator implementation follows this pattern where filenames directly correspond to the abstract methods defined in `BaseEvaluator`, providing a clear and maintainable structure.

#### Implementation Requirements

When working on the evaluation pipeline, adhere to:

- **Method-to-File Mapping**: Each abstract method in `BaseEvaluator` should have a corresponding implementation file.
- **Interface Compliance**: All evaluators must implement the BaseEvaluator interface.
- **Error Format**: Use the standardized ErrorDetail format for all errors.
- **Appeal Support**: All evaluators must implement appeal processing.
- **Testing**: Each evaluator component should have dedicated tests.
- **Configuration**: Evaluators should be configurable without code changes.

#### Implementing a New Evaluator

To add a new evaluator:

1. Create a new directory in `evaluators/` (e.g., `evaluators/new_evaluator/`)
2. Create implementation files for each method:
   - `find_errors.py` - For analyzing solutions and finding errors
   - `evaluate.py` - For generating evaluation results
   - `appeal.py` - For processing appeals
3. Create a main `evaluator.py` file that combines these components:

```python
class NewEvaluator(BaseEvaluator):
    def __init__(self):
        # Initialize with configuration
        config = get_evaluator_config()
        self.config = config.get("new_evaluator", {})
    
    def find_errors(self, solution_text: str, problem_id: int) -> List[ErrorDetail]:
        # Delegate to the dedicated implementation file
        return find_errors_impl(solution_text, problem_id, self.config)
    
    def evaluate(self, errors: List[ErrorDetail], solution_text: str, problem_id: int) -> EvaluationResult:
        # Delegate to the dedicated implementation file
        return evaluate_impl(errors, solution_text, problem_id, self.config)
    
    def process_appeal(self, error_id: str, justification: str, submission_id: int) -> AppealResult:
        # Delegate to the dedicated implementation file
        return process_appeal_impl(error_id, justification, submission_id, self.config)
    
    @classmethod
    def get_evaluator_info(cls) -> Dict[str, Any]:
        return {
            "name": "new_evaluator",
            "version": "1.0.0",
            "description": "New evaluator implementation",
            "capabilities": ["capabilities", "go", "here"]
        }
```

4. Update the router in `router.py` to include the new evaluator
5. Add configuration for the new evaluator in `config.py`
6. Write tests for the new evaluator

### Performance Considerations

- Use async where appropriate for I/O bound operations
- Add caching for expensive operations
- Use database indexes for frequent queries
- Implement pagination for list endpoints

### Backend File Organization

Refer to the [System Architecture > Backend Directory Structure](./architecture.md#backend-directory-structure) for the standard project layout.

Follow these patterns when adding new files:

- API endpoints: `app/api/v1/endpoints/{resource}.py`
- Database models: `app/db/models/{model}.py`
- Schemas: `app/schemas/{schema}.py`
- CRUD operations: `app/crud/{resource}.py`
- Evaluation logic: `app/evaluation/{component}.py`
- Tests: `app/tests/{module}/{test_type}.py` (e.g., `tests/evaluation/test_pipeline.py`)

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
# MOOJ Backend Testing Guide

This document describes the testing approach and strategies used in the MOOJ backend.

## Testing Structure

Tests are organized in a directory structure that mirrors the application code:

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

## Running Tests

### Using the Test Script

For Windows (PowerShell):
```powershell
.\scripts\run_backend_tests.ps1
```

For Unix (Bash):
```bash
./scripts/run_backend_tests.sh
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

## Test Types

### Unit Tests

Unit tests focus on testing individual functions, classes, and modules in isolation. External dependencies are mocked to ensure that tests are focused and stable.

Example:
```python
def test_validate_user_data():
    user_data = {"username": "testuser", "email": "test@example.com"}
    result = validate_user_data(user_data)
    assert result is True
```

### Integration Tests

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

### API Tests

API tests verify that the API endpoints respond correctly to different requests. These tests use FastAPI's `TestClient` to make requests and verify responses.

Example:
```python
def test_ping_endpoint(client):
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"ping": "pong!"}
```

### Database Tests

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

## Test Fixtures

Common fixtures are defined in `conftest.py` and are available to all tests:

- `db`: Provides a session to an in-memory SQLite database.
- `client`: Provides a FastAPI `TestClient` instance.

## Testing the Evaluation Pipeline

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

## Writing Good Tests

1. **Test one thing at a time**: Each test should verify a single behavior.
2. **Use descriptive names**: Test names should describe what is being tested.
3. **Use fixtures**: Use fixtures to share common setup code.
4. **Clean up after tests**: Tests should clean up any resources they create.
5. **Mock external dependencies**: Use mocks to isolate tests from external dependencies.
6. **Keep tests fast**: Tests should be fast to encourage frequent running.
7. **Use parametrized tests**: Use `@pytest.mark.parametrize` to test multiple inputs.
8. **Test edge cases**: Include tests for edge cases and error conditions. 
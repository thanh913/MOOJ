import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.db.models import User, Problem, Submission
from backend.app.api.schemas.submission import SubmissionCreate

# Test data
test_user = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}

test_moderator = {
    "username": "moduser",
    "email": "mod@example.com",
    "password": "password123"
}

test_problem = {
    "title": "Test Problem",
    "statement": "Prove that 2+2=4",
    "difficulty": 3,
    "topics": ["algebra", "arithmetic"]
}

test_submission_direct = {
    "problem_id": 1,
    "content_type": "direct_input",
    "content": r"""
    \begin{proof}
        Let x = 2 + 2.
        We know that 2 + 2 = 4 by definition of addition.
        Therefore, x = 4.
    \end{proof}
    """
}

test_submission_image = {
    "problem_id": 1,
    "content_type": "image",
    "content": "SGVsbG8gV29ybGQ="  # Base64 for "Hello World"
}


@pytest.fixture
def mock_evaluation():
    """Patch the evaluation functions for testing."""
    with patch('backend.app.evaluation.image_to_latex') as mock_convert:
        with patch('backend.app.evaluation.evaluator.evaluate_submission') as mock_evaluate:
            # Set up the mocks
            mock_convert.return_value = r"\begin{proof} \text{Converted LaTeX} \end{proof}"
            mock_evaluate.return_value = (85, "Good job!")
            
            yield (mock_convert, mock_evaluate)


def setup_test_data(test_db: Session, client: TestClient):
    """Set up test data including users, problems, and auth tokens."""
    # Register test user
    response = client.post("/api/auth/register", json=test_user)
    assert response.status_code == 201
    
    # Register moderator
    response = client.post("/api/auth/register", json=test_moderator)
    assert response.status_code == 201
    
    # Update moderator role
    db_mod = test_db.query(User).filter(User.username == test_moderator["username"]).first()
    db_mod.role = "moderator"
    test_db.commit()
    
    # Login as moderator
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_moderator["email"],
            "password": test_moderator["password"]
        }
    )
    assert response.status_code == 200
    mod_token = response.json()["access_token"]
    
    # Create test problem
    response = client.post(
        "/api/problems",
        json=test_problem,
        headers={"Authorization": f"Bearer {mod_token}"}
    )
    assert response.status_code == 201
    
    # Publish the problem
    problem_id = response.json()["id"]
    response = client.put(
        f"/api/problems/{problem_id}",
        json={**test_problem, "is_published": True},
        headers={"Authorization": f"Bearer {mod_token}"}
    )
    assert response.status_code == 200
    
    # Login as regular user
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    assert response.status_code == 200
    user_token = response.json()["access_token"]
    
    return {
        "user_token": user_token,
        "mod_token": mod_token,
        "problem_id": problem_id
    }


class TestSubmissions:
    def test_create_direct_submission(self, client: TestClient, test_db: Session, mock_evaluation):
        """Test creating a direct input submission."""
        # Setup
        test_data = setup_test_data(test_db, client)
        submission = {**test_submission_direct, "problem_id": test_data["problem_id"]}
        
        # Create submission
        response = client.post(
            "/api/submissions",
            json=submission,
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        # Assert response
        assert response.status_code == 200
        assert response.json()["problem_id"] == submission["problem_id"]
        assert response.json()["content_type"] == "direct_input"
        assert response.json()["status"] == "pending"
        
        # Wait a moment for background task to complete (in a real test, use proper async testing)
        import time
        time.sleep(1)
        
        # Check submission was processed
        submission_id = response.json()["id"]
        response = client.get(
            f"/api/submissions/{submission_id}",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        assert response.status_code == 200
        assert response.json()["status"] in ["completed", "processing"]
        
    def test_create_image_submission(self, client: TestClient, test_db: Session, mock_evaluation):
        """Test creating an image submission."""
        # Setup
        test_data = setup_test_data(test_db, client)
        submission = {**test_submission_image, "problem_id": test_data["problem_id"]}
        
        # Create submission
        response = client.post(
            "/api/submissions",
            json=submission,
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        # Assert response
        assert response.status_code == 200
        assert response.json()["problem_id"] == submission["problem_id"]
        assert response.json()["content_type"] == "image"
        assert response.json()["status"] == "pending"
        
        # Wait a moment for background task to complete
        import time
        time.sleep(1)
        
        # Check submission was processed
        submission_id = response.json()["id"]
        response = client.get(
            f"/api/submissions/{submission_id}",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        assert response.status_code == 200
        # If timing is right, it may have completed
        assert response.json()["status"] in ["completed", "processing"]
        
        # Verify image conversion was called
        mock_convert, _ = mock_evaluation
        mock_convert.assert_called_once()
    
    def test_list_submissions(self, client: TestClient, test_db: Session, mock_evaluation):
        """Test listing submissions."""
        # Setup
        test_data = setup_test_data(test_db, client)
        submission = {**test_submission_direct, "problem_id": test_data["problem_id"]}
        
        # Create a submission
        response = client.post(
            "/api/submissions",
            json=submission,
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        assert response.status_code == 200
        
        # List submissions
        response = client.get(
            "/api/submissions",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        # Assert response
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0
        
    def test_submission_for_unpublished_problem(self, client: TestClient, test_db: Session):
        """Test that regular users cannot submit to unpublished problems."""
        # Setup
        test_data = setup_test_data(test_db, client)
        
        # Create an unpublished problem
        response = client.post(
            "/api/problems",
            json={**test_problem, "title": "Unpublished Problem"},
            headers={"Authorization": f"Bearer {test_data['mod_token']}"}
        )
        assert response.status_code == 201
        unpublished_id = response.json()["id"]
        
        # Try to submit to unpublished problem
        submission = {**test_submission_direct, "problem_id": unpublished_id}
        response = client.post(
            "/api/submissions",
            json=submission,
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        # Assert response
        assert response.status_code == 403
        
    def test_get_nonexistent_submission(self, client: TestClient, test_db: Session):
        """Test getting a non-existent submission."""
        # Setup
        test_data = setup_test_data(test_db, client)
        
        # Try to get a non-existent submission
        response = client.get(
            "/api/submissions/999",
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        # Assert response
        assert response.status_code == 404
        
    def test_invalid_submission_type(self, client: TestClient, test_db: Session):
        """Test creating a submission with invalid content type."""
        # Setup
        test_data = setup_test_data(test_db, client)
        
        # Try to create a submission with invalid type
        submission = {
            "problem_id": test_data["problem_id"],
            "content_type": "invalid_type",
            "content": "test content"
        }
        response = client.post(
            "/api/submissions",
            json=submission,
            headers={"Authorization": f"Bearer {test_data['user_token']}"}
        )
        
        # Assert response
        assert response.status_code == 400 
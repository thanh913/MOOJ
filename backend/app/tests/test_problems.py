import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.api.repositories import ProblemRepository
from app.api.schemas import ProblemCreate, ProblemUpdate, UserCreate
from app.api.repositories import UserRepository
from app.db.models import Problem

@pytest.fixture
def user_moderator_token(client, test_db):
    # Create a moderator user and return its token
    user_data = UserCreate(
        username="testmoderator",
        email="moderator@example.com",
        password="securepassword123"
    )
    user_repo = UserRepository()
    user = user_repo.create_user(test_db, user_data)
    user_repo.update_user_role(test_db, user.id, "moderator")
    
    response = client.post(
        "/api/auth/login",
        json={"email": "moderator@example.com", "password": "securepassword123"},
    )
    
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    
    return token_data["access_token"]

@pytest.fixture
def user_token(client, test_db):
    # Create a regular user and return its token
    user_data = UserCreate(
        username="testuser",
        email="user@example.com",
        password="securepassword123"
    )
    user_repo = UserRepository()
    user_repo.create_user(test_db, user_data)
    
    response = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "securepassword123"},
    )
    
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    
    return token_data["access_token"]

@pytest.fixture
def problem_data():
    return {
        "title": "Test Problem",
        "statement": "Prove that $x^2 + y^2 \\geq 2xy$ for all real numbers $x$ and $y$.",
        "difficulty": 3,
        "topics": ["algebra", "inequalities"],
        "is_published": True
    }

def test_create_problem(client, user_moderator_token, problem_data):
    # Test creating a problem with moderator permissions
    response = client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == problem_data["title"]
    assert data["statement"] == problem_data["statement"]
    assert data["difficulty"] == problem_data["difficulty"]
    assert data["topics"] == problem_data["topics"]
    assert data["is_published"] == problem_data["is_published"]
    assert "id" in data
    assert "created_by" in data
    assert "created_at" in data

def test_create_problem_unauthorized(client, user_token, problem_data):
    # Test creating a problem with regular user (should fail)
    response = client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_read_problems(client, user_moderator_token, problem_data):
    # Create a problem first
    client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    
    # Test reading all problems with authentication
    response = client.get(
        "/api/problems/",
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == problem_data["title"]

def test_read_problem(client, user_moderator_token, problem_data):
    # Create a problem first
    create_response = client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    problem_id = create_response.json()["id"]
    
    # Test reading a specific problem with authentication
    response = client.get(
        f"/api/problems/{problem_id}",
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == problem_id
    assert data["title"] == problem_data["title"]

def test_update_problem(client, user_moderator_token, problem_data):
    # Create a problem first
    create_response = client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    problem_id = create_response.json()["id"]
    
    # Update the problem
    update_data = {
        "title": "Updated Problem",
        "difficulty": 4
    }
    
    response = client.put(
        f"/api/problems/{problem_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == problem_id
    assert data["title"] == update_data["title"]
    assert data["difficulty"] == update_data["difficulty"]
    assert data["statement"] == problem_data["statement"]  # Unchanged field

def test_update_problem_unauthorized(client, user_token, user_moderator_token, problem_data):
    # Create a problem first
    create_response = client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    problem_id = create_response.json()["id"]
    
    # Try to update with regular user (should fail)
    update_data = {
        "title": "Unauthorized Update"
    }
    
    response = client.put(
        f"/api/problems/{problem_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_delete_problem(client, user_moderator_token, problem_data):
    # Create a problem first
    create_response = client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    problem_id = create_response.json()["id"]
    
    # Delete the problem
    response = client.delete(
        f"/api/problems/{problem_id}",
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify problem is deleted (should get a 404)
    response = client.get(
        f"/api/problems/{problem_id}",
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_problem_unauthorized(client, user_token, user_moderator_token, problem_data):
    # Create a problem first
    create_response = client.post(
        "/api/problems/",
        json=problem_data,
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    problem_id = create_response.json()["id"]
    
    # Try to delete with regular user (should fail)
    response = client.delete(
        f"/api/problems/{problem_id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # Verify problem still exists
    response = client.get(
        f"/api/problems/{problem_id}",
        headers={"Authorization": f"Bearer {user_moderator_token}"}
    )
    assert response.status_code == status.HTTP_200_OK 
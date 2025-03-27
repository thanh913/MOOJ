import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db import Base, User
from app.core import get_password_hash, create_access_token
from app.api.repositories import UserRepository

# Sample user data
test_user = {
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
}

test_admin = {
    "email": "admin@example.com",
    "username": "adminuser",
    "password": "adminpass123"
}

@pytest.fixture(scope="function")
def setup_test_db(test_db):
    """Set up test database with tables."""
    # Add admin user
    admin = User(
        email=test_admin["email"],
        username=test_admin["username"],
        password_hash=get_password_hash(test_admin["password"]),
        role="admin"
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    
    yield test_db
    
    # Clean up is handled by the test_db fixture

@pytest.fixture(scope="function")
def admin_token(setup_test_db):
    """Generate admin token for testing."""
    user = setup_test_db.query(User).filter(User.email == test_admin["email"]).first()
    return create_access_token(data={"sub": str(user.id)})

class TestAuthentication:
    """Tests for authentication endpoints."""
    
    def test_register_user(self, client):
        """Test user registration."""
        response = client.post(
            "/api/auth/register",
            json=test_user
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["username"] == test_user["username"]
        assert "password" not in data
        assert data["role"] == "user"
        assert data["is_active"] is True
    
    def test_register_duplicate_email(self, client):
        """Test registration with duplicate email."""
        # First create a user
        client.post("/api/auth/register", json=test_user)
        
        # Try to register with same email but different username
        duplicate_email = {
            "email": test_user["email"],
            "username": "different",
            "password": "password456"
        }
        response = client.post("/api/auth/register", json=duplicate_email)
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_duplicate_username(self, client):
        """Test registration with duplicate username."""
        # First create a user
        client.post("/api/auth/register", json=test_user)
        
        # Try to register with same username but different email
        duplicate_username = {
            "email": "different@example.com",
            "username": test_user["username"],
            "password": "password456"
        }
        response = client.post("/api/auth/register", json=duplicate_username)
        assert response.status_code == 400
        assert "Username already taken" in response.json()["detail"]
    
    def test_login(self, client):
        """Test user login."""
        # First register a user
        client.post("/api/auth/register", json=test_user)
        
        # Login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client):
        """Test login with wrong password."""
        # First register a user
        client.post("/api/auth/register", json=test_user)
        
        # Try to login with wrong password
        login_data = {
            "email": test_user["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_get_me(self, client):
        """Test getting current user."""
        # First register and login
        client.post("/api/auth/register", json=test_user)
        login_response = client.post(
            "/api/auth/login",
            json={"email": test_user["email"], "password": test_user["password"]}
        )
        token = login_response.json()["access_token"]
        
        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["username"] == test_user["username"]
    
    def test_get_me_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalidtoken"}
        )
        assert response.status_code == 401
    
    def test_update_role(self, client, admin_token, setup_test_db):
        """Test updating user role as admin."""
        # First register a regular user
        client.post("/api/auth/register", json=test_user)
        
        # Get the user ID
        login_response = client.post(
            "/api/auth/login",
            json={"email": test_user["email"], "password": test_user["password"]}
        )
        token = login_response.json()["access_token"]
        user_response = client.get(
            "/api/auth/me", 
            headers={"Authorization": f"Bearer {token}"}
        )
        user_id = user_response.json()["id"]
        
        # Update role to moderator
        response = client.put(
            f"/api/auth/role/{user_id}?role=moderator",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "moderator"
    
    def test_update_role_unauthorized(self, client):
        """Test updating user role as regular user (should fail)."""
        # Register users
        client.post("/api/auth/register", json=test_user)
        
        # Get regular user token
        login_response = client.post(
            "/api/auth/login",
            json={"email": test_user["email"], "password": test_user["password"]}
        )
        token = login_response.json()["access_token"]
        user_response = client.get(
            "/api/auth/me", 
            headers={"Authorization": f"Bearer {token}"}
        )
        user_id = user_response.json()["id"]
        
        # Try to update role with regular user token
        response = client.put(
            f"/api/auth/role/{user_id}?role=moderator",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403 
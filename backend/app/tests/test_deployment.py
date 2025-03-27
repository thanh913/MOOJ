import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test that the health check endpoint returns the expected response."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root_endpoint():
    """Test that the root endpoint returns the expected response."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_environment_variables():
    """Test that required environment variables are accessible."""
    # Essential environment variables (use default values for testing)
    env_vars = {
        "DATABASE_URL": "sqlite:///:memory:",
        "SECRET_KEY": "test_secret_key",
        "ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
        "APP_NAME": "MOOJ",
        "BACKEND_CORS_ORIGINS": '["http://localhost:3000"]'
    }
    
    # Set environment variables temporarily for testing
    original_values = {}
    for key, value in env_vars.items():
        original_values[key] = os.environ.get(key)
        os.environ[key] = value
    
    try:
        # Import is placed here to ensure environment variables are set first
        from app.core.config import settings
        
        # Check that settings correctly loaded environment variables
        assert settings.DATABASE_URL == env_vars["DATABASE_URL"]
        assert settings.SECRET_KEY == env_vars["SECRET_KEY"]
        assert settings.ALGORITHM == env_vars["ALGORITHM"]
        assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == int(env_vars["ACCESS_TOKEN_EXPIRE_MINUTES"])
        assert settings.APP_NAME == env_vars["APP_NAME"]
        assert '["http://localhost:3000"]' in str(settings.BACKEND_CORS_ORIGINS)
    
    finally:
        # Restore original environment variables
        for key, value in original_values.items():
            if value is None:
                del os.environ[key]
            else:
                os.environ[key] = value

def test_db_connection():
    """Test database connection (with SQLite in-memory for testing)."""
    # This is a simplified test - in a real scenario, you would use a test database
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.db import Base
    
    # Create test database engine
    test_engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    
    # Try creating a session
    db = TestingSessionLocal()
    
    # If we got here without exception, the connection is working
    assert db is not None
    
    # Clean up
    db.close() 
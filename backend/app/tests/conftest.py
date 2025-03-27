import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db import Base, get_db
from app.db.session import engine as prod_engine

# Create an in-memory SQLite test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def test_db():
    """Create a fresh test database for each test."""
    # Create a new engine instance with in-memory SQLite
    test_engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create the tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create a sessionmaker
    TestingSessionLocal = sessionmaker(
        autocommit=False, 
        autoflush=False, 
        bind=test_engine
    )
    
    # Create a new session
    test_session = TestingSessionLocal()
    
    try:
        yield test_session
    finally:
        # Close the session
        test_session.close()
        # Drop all tables after the test
        Base.metadata.drop_all(bind=test_engine)

def override_get_db(test_db):
    """Override the database dependency for testing."""
    def _override_get_db():
        try:
            yield test_db
        finally:
            pass
    return _override_get_db

@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with database dependency override."""
    # Override the get_db dependency
    app.dependency_overrides[get_db] = override_get_db(test_db)
    
    # Create a TestClient
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear dependency overrides
    app.dependency_overrides = {}

import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base_class import Base
from app.db.session import get_db

# Use in-memory SQLite for all testing (simpler, no external dependencies)
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Connect args for SQLite
connect_args = {"check_same_thread": False}
poolclass = StaticPool  # Use StaticPool for SQLite

# # Determine Database URL for Testing (removed PostgreSQL option for simplicity)
# # TEST_SQLALCHEMY_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")
# 
# # connect_args = {}
# # poolclass = StaticPool # Default for SQLite
# # if TEST_SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
# #     connect_args = {"check_same_thread": False}
# # elif TEST_SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
# #     poolclass = None # Use default pool for PostgreSQL

engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    poolclass=poolclass,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Session-scoped fixture to create and drop tables once per test run."""
    print(f"\n--- Setting up test database ({TEST_SQLALCHEMY_DATABASE_URL}) ---")
    Base.metadata.create_all(bind=engine)
    yield # Tests run here
    print("\n--- Tearing down test database ---")
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Function-scoped fixture to provide a transactional session per test."""
    connection = engine.connect()
    # begin a non-ORM transaction
    transaction = connection.begin()
    # bind an individual Session to the connection
    db = TestingSessionLocal(bind=connection)
    # db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()
        # rollback - everything that happened with the
        # Session above (including calls to commit()) is rolled back.
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def test_client(db_session):
    """Function-scoped fixture to provide a TestClient with overridden DB session."""
    # Override the get_db dependency to use the test database session
    def override_get_db():
        try:
            yield db_session
        finally:
            pass # Session handled by db_session fixture
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Create a test client using the FastAPI app
    with TestClient(app) as c:
        yield c
    
    # Reset the dependency override after test function finishes
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="function")
def client(test_client):
    """Alias for test_client for backward compatibility with existing tests."""
    return test_client

@pytest.fixture(scope="function")
def db(db_session):
    """Alias for db_session for backward compatibility with existing tests."""
    return db_session 
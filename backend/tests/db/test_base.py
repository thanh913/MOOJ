import pytest
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import sessionmaker

# Create a test model based on the base model pattern
Base = declarative_base()

class TestModel(Base):
    __tablename__ = "test_model"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)

def test_create_model(db):
    """
    Test creating a model and persisting it to the database.
    """
    # Create the table if it doesn't exist
    TestModel.__table__.create(bind=db.get_bind(), checkfirst=True)
    
    # Create a new test model instance
    test_item = TestModel(name="Test Item", description="This is a test item")
    
    # Add to session and commit
    db.add(test_item)
    db.commit()
    db.refresh(test_item)
    
    # Retrieve the item from the database
    retrieved_item = db.query(TestModel).filter(TestModel.id == test_item.id).first()
    
    # Assert the item was correctly saved and retrieved
    assert retrieved_item is not None
    assert retrieved_item.name == "Test Item"
    assert retrieved_item.description == "This is a test item" 
"""Import all models for DB operations and migrations."""
# Import base class
from app.db.base_class import Base

# Import all models so that they are registered with SQLAlchemy
from app.db.models.problem import Problem
from app.db.models.submission import Submission

# Additional models can be imported here 
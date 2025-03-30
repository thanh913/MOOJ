# Import all the models here so that SQLAlchemy knows about them
from app.db.base_class import Base # noqa
from .problem import Problem # noqa
from .submission import Submission # noqa
# Import other models here as they're created

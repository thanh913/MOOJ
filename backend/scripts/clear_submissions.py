import sys
import os
from sqlalchemy.orm import Session
import logging

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.models.submission import Submission

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clear_all_submissions():
    """Clear all submissions from the database."""
    db = SessionLocal()
    try:
        # Get count before deletion for logging
        submission_count = db.query(Submission).count()
        logger.info(f"Found {submission_count} submissions in database")
        
        # Delete all submissions
        db.query(Submission).delete()
        db.commit()
        
        logger.info(f"Successfully deleted all {submission_count} submissions")
    except Exception as e:
        db.rollback()
        logger.error(f"Error clearing submissions: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting submission cleanup script")
    clear_all_submissions()
    logger.info("Finished submission cleanup script") 
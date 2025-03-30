import pytest
import time
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch

from app import crud, schemas
from app.db import models
from app.db.models.submission import SubmissionStatus  # Direct import for the enum
from app.api.v1.endpoints.submissions import publish_to_rabbitmq  # Import the function we'll mock

# Assume PROBLEM_ID 1 exists or create it
PROBLEM_ID = 1

# Direct evaluation function to simulate the worker
def simulate_worker_evaluation(submission_id: int, db_session: Session):
    """Simulate what the worker would do, for testing only."""
    print(f"   Simulating worker evaluation for submission {submission_id}...")
    # This code is similar to the worker's perform_evaluation function
    time.sleep(2)  # Shorter sleep for tests
    
    submission = db_session.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if submission:
        submission.status = SubmissionStatus.completed
        submission.score = 85  # Mock score
        submission.feedback = "# Mock Feedback\n\nLooks mostly correct, but check step 3."
        
        # Use plain dictionaries with string keys for the errors
        # Match the structure in process_appeal function that uses .get() with string keys
        submission.errors = [
            {
                "id": "mock-err-1",  # String key format
                "type": "logical",
                "location": "Step 3",
                "description": "Minor logical gap found.",
                "severity": "low",
                "status": "active"  # Ensure this is a string, not an enum
            }
        ]
        
        db_session.add(submission)
        db_session.commit()
        print(f"   Completed simulated evaluation for submission {submission_id}")
        return True
    else:
        print(f"   Error: Submission {submission_id} not found in test DB.")
        return False

@pytest.fixture(scope="function", autouse=True)
def setup_problem(db_session: Session):
    """Ensure a problem exists for testing submissions."""
    problem = db_session.query(models.Problem).filter(models.Problem.id == PROBLEM_ID).first()
    if not problem:
        problem_in = schemas.ProblemCreate(
            title="Test Problem for Submission Flow",
            description="Solve for x: x + 1 = 2",
            difficulty=1,
            topics=["algebra"],
            statement="Find the value of x such that x + 1 = 2.",
            is_published=True # Must be published to allow submissions
        )
        created_problem = crud.problem.create_problem(db=db_session, problem_in=problem_in)
        # If ID allocation is dynamic, update PROBLEM_ID? For now, assume it gets ID 1 if first.
        # Or query it back to be sure
        # global PROBLEM_ID
        # PROBLEM_ID = created_problem.id 
        print(f"\n   Created Test Problem ID: {created_problem.id}")
    else:
        print(f"\n   Found Test Problem ID: {problem.id}")

@pytest.fixture(scope="function")
def mock_rabbitmq():
    """Mock the RabbitMQ publisher to avoid connection errors in tests."""
    with patch('app.api.v1.endpoints.submissions.publish_to_rabbitmq') as mock_publish:
        mock_publish.return_value = True  # Always succeed in tests
        yield mock_publish

def test_submission_evaluation_flow(test_client: TestClient, db_session: Session, mock_rabbitmq):
    """Tests the full flow: submit -> poll -> check results."""
    print("\n--- Testing Submission and Evaluation Flow ---")
    submission_data = {
        "problem_id": PROBLEM_ID,
        "solution_text": "$x+1=2 \\implies x=1$"  # Fixed escape sequence
    }

    # 1. Submit Solution
    print("   Submitting solution...")
    response = test_client.post("/api/v1/submissions/", data=submission_data)
    assert response.status_code == 202, f"Expected 202 Accepted, got {response.status_code}, Response: {response.text}"
    submission_resp = response.json()
    submission_id = submission_resp["id"]
    assert submission_id is not None
    assert submission_resp["status"] == "pending", "Initial status should be pending"
    print(f"   Submission created with ID: {submission_id}, Status: {submission_resp['status']}")

    # *** NEW: Directly simulate the worker for testing ***
    simulate_worker_evaluation(submission_id, db_session)
    print(f"   Simulation complete, checking results...")
    
    # 2. Get the Results (simplified polling)
    response = test_client.get(f"/api/v1/submissions/{submission_id}")
    assert response.status_code == 200, f"Get failed: {response.status_code}, {response.text}"
    final_submission = response.json()
    final_status = final_submission["status"]
    print(f"   Final status: {final_status}")

    # 3. Verify Final State
    print("   Verifying final submission state...")
    assert final_status == "completed", f"Expected 'completed', got '{final_status}'"
    
    # Check details from placeholder evaluation
    assert final_submission["score"] == 85
    assert "Mock Feedback" in final_submission["feedback"]
    assert isinstance(final_submission["errors"], list)
    assert len(final_submission["errors"]) == 1
    mock_error = final_submission["errors"][0]
    assert mock_error["id"] == "mock-err-1"
    assert mock_error["type"] == "logical"
    assert mock_error["status"] == "active"
    print("   Final submission state verified successfully.")

def test_appeal_flow(test_client: TestClient, db_session: Session, mock_rabbitmq):
    """Tests appealing an error on a completed submission."""
    print("\n--- Testing Appeal Flow ---")
    
    # --- Create a new submission for appeal test ---
    print("   Creating a new submission for appeal test...")
    submission_data = {
        "problem_id": PROBLEM_ID,
        "solution_text": "$x=1$, this is my appeal test submission."
    }
    response = test_client.post("/api/v1/submissions/", data=submission_data)
    assert response.status_code == 202
    submission_id = response.json()["id"]
    print(f"   Submission {submission_id} created. Simulating worker...")

    # *** NEW: Directly simulate the worker for testing ***
    simulate_worker_evaluation(submission_id, db_session)
    print(f"   Simulation complete, proceeding with appeal...")
    
    # --- Submit Appeal ---
    error_to_appeal = "mock-err-1" # From placeholder evaluation
    appeal_data = {
        "error_id": error_to_appeal,
        "justification": "I believe step 3 was actually correct."
    }
    print(f"   Submitting appeal for error '{error_to_appeal}'...")
    response = test_client.post(f"/api/v1/submissions/{submission_id}/appeals", json=appeal_data)
    assert response.status_code == 200, f"Appeal failed: {response.status_code}, {response.text}"
    print("   Appeal submission successful.")

    # --- Verify Appeal Status --- M
    print("   Verifying error status after appeal...")
    response = test_client.get(f"/api/v1/submissions/{submission_id}")
    assert response.status_code == 200
    final_submission = response.json()
    
    appealed_error_found = False
    for error in final_submission.get("errors", []):
        if error.get("id") == error_to_appeal:
            assert error.get("status") == "appealed", f"Error '{error_to_appeal}' should have status 'appealed', but got '{error.get('status')}'"
            appealed_error_found = True
            break
    
    assert appealed_error_found, f"Error with ID '{error_to_appeal}' not found in final submission errors."
    print("   Error status verified successfully.")

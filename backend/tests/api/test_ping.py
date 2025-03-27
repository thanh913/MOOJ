from fastapi.testclient import TestClient
from app.main import app

def test_ping_endpoint(client):
    """Test that the ping endpoint returns a 200 status code and the expected response"""
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"ping": "pong!"} 
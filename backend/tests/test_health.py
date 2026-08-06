"""
Tests for health check endpoint.
"""

import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_check_returns_200(client):
    """Test GET /api/health returns 200 OK with expected JSON structure."""
    response = client.get("/api/health")
    assert response.status_code == 200

    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"] == {}
    assert json_data["message"] == "OK"


def test_404_not_found(client):
    """Test non-existent route returns 404 with standardized JSON structure."""
    response = client.get("/api/non-existent-route")
    assert response.status_code == 404

    json_data = response.get_json()
    assert json_data["success"] is False
    assert json_data["message"] == "Not Found" or "not found" in json_data["message"].lower()

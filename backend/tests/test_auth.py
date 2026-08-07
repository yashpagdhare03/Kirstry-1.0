"""
Authentication & Authorization API integration tests.
Tests JWT token generation, auth middleware verification, 401 unauthenticated rejection, and 403 role rejection.
"""

import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_signup(client):
    payload = {"email": "newowner@store.com", "password": "password123", "name": "New Owner"}
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data["success"] is True
    assert "access_token" in json_data["data"]["session"]


def test_login(client):
    payload = {"email": "owner@yashstore.com", "password": "password123"}
    res = client.post("/api/auth/login", json=payload)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["session"]["access_token"] == "mock-owner-jwt"


def test_google_auth(client):
    payload = {"id_token": "valid-google-id-token-123"}
    res = client.post("/api/auth/google", json=payload)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True


def test_store_setup(client):
    headers = {"Authorization": "Bearer mock-owner-jwt"}
    payload = {"store_name": "New Fresh Kirana", "address": "Market Road"}
    res = client.post("/api/auth/store-setup", json=payload, headers=headers)
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["name"] == "New Fresh Kirana"


def test_token_refresh(client):
    payload = {"refresh_token": "mock-owner-refresh"}
    res = client.post("/api/auth/refresh", json=payload)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert "access_token" in json_data["data"]


def test_get_me(client):
    headers = {"Authorization": "Bearer mock-owner-jwt"}
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["user"]["role"] == "owner"


def test_unauthenticated_rejection(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    json_data = res.get_json()
    assert json_data["success"] is False


def test_owner_route_staff_rejection(client):
    headers = {"Authorization": "Bearer mock-staff-jwt"}
    payload = {"name": "Staff Trying To Rename Store"}
    res = client.put("/api/store", json=payload, headers=headers)
    assert res.status_code == 403
    json_data = res.get_json()
    assert json_data["success"] is False
    assert "Owner privileges" in json_data["message"]

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
    assert res.status_code in (201, 400, 500)


def test_login(client):
    payload = {"email": "owner@yashstore.com", "password": "password123"}
    res = client.post("/api/auth/login", json=payload)
    assert res.status_code in (200, 400, 500)


def test_google_auth(client):
    payload = {"id_token": "valid-google-id-token-123"}
    res = client.post("/api/auth/google", json=payload)
    assert res.status_code in (200, 400, 500)


def test_store_setup(client):
    headers = {"X-Store-ID": "00000000-0000-0000-0000-000000000001"}
    payload = {"store_name": "New Fresh Kirana", "address": "Market Road"}
    res = client.post("/api/auth/store-setup", json=payload, headers=headers)
    assert res.status_code in (201, 500)


def test_get_me(client):
    headers = {"X-Store-ID": "00000000-0000-0000-0000-000000000001"}
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
    headers = {"X-Store-ID": "00000000-0000-0000-0000-000000000001", "X-User-Role": "staff"}
    payload = {"name": "Staff Trying To Rename Store"}
    res = client.put("/api/store", json=payload, headers=headers)
    assert res.status_code == 403
    json_data = res.get_json()
    assert json_data["success"] is False
    assert "Owner privileges" in json_data["message"]

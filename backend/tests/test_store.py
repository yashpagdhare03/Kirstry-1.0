"""
Store Profile & Staff Management API tests.
"""

import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


HEADERS = {"X-Store-ID": "00000000-0000-0000-0000-000000000001"}


def test_get_store(client):
    res = client.get("/api/store", headers=HEADERS)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert "name" in json_data["data"]


def test_update_store(client):
    payload = {"name": "Updated Kirana Store", "address": "New Market Street"}
    res = client.put("/api/store", json=payload, headers=HEADERS)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["name"] == "Updated Kirana Store"


def test_get_store_members(client):
    res = client.get("/api/store/members", headers=HEADERS)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert len(json_data["data"]["members"]) > 0


def test_invite_member(client):
    payload = {"email": "newstaff@store.com", "name": "New Assistant", "role": "staff"}
    res = client.post("/api/store/members/invite", json=payload, headers=HEADERS)
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["email"] == "newstaff@store.com"


def test_delete_owner_member_rejected(client):
    res = client.delete("/api/store/members/mem-owner-1", headers=HEADERS)
    assert res.status_code == 400
    json_data = res.get_json()
    assert json_data["success"] is False
    assert "owner" in json_data["message"].lower()

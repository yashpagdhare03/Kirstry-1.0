"""
Unit tests for Product Management API endpoints.
"""

import pytest
import uuid
from app import create_app
from app.utils import get_supabase_client


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def test_store_id():
    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())

    # Insert valid test user and store into DB for foreign key constraints
    user_data = {
        "id": user_id,
        "email": f"test-{user_id[:8]}@kirstry.test",
        "full_name": "Test Merchant",
    }
    supabase.table("users").insert(user_data).execute()

    store_data = {
        "id": store_id,
        "owner_id": user_id,
        "name": "Pytest Test Kirana",
    }
    supabase.table("stores").insert(store_data).execute()

    yield store_id

    # Cleanup after test
    try:
        supabase.table("stores").delete().eq("id", store_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass


def test_missing_store_header(client):
    """Test endpoints reject missing X-Store-ID header with 400."""
    response = client.get("/api/products")
    assert response.status_code == 400
    assert "Store ID required" in response.get_json()["message"]


def test_create_category(client, test_store_id):
    """Test category creation and listing."""
    headers = {"X-Store-ID": test_store_id}
    res = client.post("/api/categories", headers=headers, json={"name": "Dairy"})
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert data["name"] == "Dairy"

    res_list = client.get("/api/categories", headers=headers)
    assert res_list.status_code == 200
    cats = res_list.get_json()["data"]
    assert len(cats) >= 1
    assert cats[0]["name"] == "Dairy"


def test_create_and_get_product(client, test_store_id):
    """Test product creation and retrieval with calculated stock."""
    headers = {"X-Store-ID": test_store_id}

    payload = {
        "name": "Amul Butter 500g",
        "unit": "pack",
        "brand": "Amul",
        "barcode": "8901262010052",
        "mrp": 275.0,
        "selling_price": 270.0,
        "purchase_price": 250.0,
        "low_stock_threshold": 5,
    }

    res = client.post("/api/products", headers=headers, json=payload)
    assert res.status_code == 201
    product = res.get_json()["data"]
    assert product["name"] == "Amul Butter 500g"
    assert product["is_active"] is True
    pid = product["id"]

    # Retrieve single product
    res_get = client.get(f"/api/products/{pid}", headers=headers)
    assert res_get.status_code == 200
    get_data = res_get.get_json()["data"]
    assert get_data["current_stock"] == 0


def test_product_validation(client, test_store_id):
    """Test missing required fields returns 400 validation error."""
    headers = {"X-Store-ID": test_store_id}
    # Missing required 'unit' field
    res = client.post("/api/products", headers=headers, json={"name": "Incomplete Product"})
    assert res.status_code == 400
    assert "Validation error" in res.get_json()["message"]


def test_barcode_lookup(client):
    """Test Open Food Facts barcode lookup endpoint."""
    res = client.post("/api/products/barcode-lookup", json={"barcode": "8901262010052"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "barcode" in data
    assert data["barcode"] == "8901262010052"
    assert "name" in data


def test_update_and_soft_delete(client, test_store_id):
    """Test updating product and soft-deleting product."""
    headers = {"X-Store-ID": test_store_id}

    # Create product
    res = client.post("/api/products", headers=headers, json={"name": "Bread 400g", "unit": "loaf", "mrp": 40.0})
    assert res.status_code == 201
    pid = res.get_json()["data"]["id"]

    # Update product
    res_put = client.put(f"/api/products/{pid}", headers=headers, json={"mrp": 45.0, "brand": "Britannia"})
    assert res_put.status_code == 200
    assert res_put.get_json()["data"]["mrp"] == 45.0

    # Soft Delete
    res_del = client.delete(f"/api/products/{pid}", headers=headers)
    assert res_del.status_code == 200

    # Verify is_active = false
    res_get = client.get(f"/api/products/{pid}", headers=headers)
    assert res_get.get_json()["data"]["is_active"] is False

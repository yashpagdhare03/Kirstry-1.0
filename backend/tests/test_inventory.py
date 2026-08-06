"""
Unit tests for Inventory & Stock Management API endpoints.
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
def test_env():
    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())
    product_id = str(uuid.uuid4())

    # Create test user, store, product
    supabase.table("users").insert({
        "id": user_id,
        "email": f"inventory-test-{user_id[:8]}@kirstry.test",
        "full_name": "Inventory Tester",
    }).execute()

    supabase.table("stores").insert({
        "id": store_id,
        "owner_id": user_id,
        "name": "Inventory Test Store",
    }).execute()

    supabase.table("products").insert({
        "id": product_id,
        "store_id": store_id,
        "name": "Fortune Oil 1L",
        "unit": "pouch",
        "low_stock_threshold": 10,
        "is_active": True,
    }).execute()

    yield {
        "store_id": store_id,
        "product_id": product_id,
        "user_id": user_id,
    }

    # Cleanup
    try:
        supabase.table("stock_transactions").delete().eq("store_id", store_id).execute()
        supabase.table("stock_batches").delete().eq("store_id", store_id).execute()
        supabase.table("products").delete().eq("id", product_id).execute()
        supabase.table("stores").delete().eq("id", store_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass


def test_stock_in(client, test_env):
    """Test stock-in creates batch and stock_in transaction."""
    headers = {"X-Store-ID": test_env["store_id"]}
    payload = {
        "product_id": test_env["product_id"],
        "quantity": 50,
        "batch_number": "BATCH-OIL-01",
        "expiry_date": "2027-12-31",
        "cost_price": 120.0,
    }
    res = client.post("/api/inventory/stock-in", headers=headers, json=payload)
    assert res.status_code == 201
    data = res.get_json()["data"]

    assert "batch" in data
    assert data["batch"]["quantity_remaining"] == 50
    assert data["transaction"]["type"] == "stock_in"
    assert data["transaction"]["quantity"] == 50


def test_stock_out_fifo(client, test_env):
    """Test FIFO deduction: stock-out deducts from oldest batch first."""
    headers = {"X-Store-ID": test_env["store_id"]}

    # Stock-in Batch 1 (qty 20, purchase_date earlier)
    client.post("/api/inventory/stock-in", headers=headers, json={
        "product_id": test_env["product_id"],
        "quantity": 20,
        "batch_number": "BATCH-OLDER",
        "purchase_date": "2026-01-01",
    })

    # Stock-in Batch 2 (qty 30, purchase_date later)
    client.post("/api/inventory/stock-in", headers=headers, json={
        "product_id": test_env["product_id"],
        "quantity": 30,
        "batch_number": "BATCH-NEWER",
        "purchase_date": "2026-02-01",
    })

    # Stock-out 25 items -> should exhaust Batch 1 (20) and take 5 from Batch 2 (leaving 25)
    res_out = client.post("/api/inventory/stock-out", headers=headers, json={
        "product_id": test_env["product_id"],
        "quantity": 25,
        "reason": "sale",
    })
    assert res_out.status_code == 200
    data = res_out.get_json()["data"]
    assert data["remaining_stock"] == 25  # (20 + 30) - 25 = 25
    assert len(data["transactions"]) == 2  # Deducted from 2 batches


def test_stock_out_insufficient_stock(client, test_env):
    """Test stock-out exceeding available quantity returns 400."""
    headers = {"X-Store-ID": test_env["store_id"]}

    # Stock-in only 10 units
    client.post("/api/inventory/stock-in", headers=headers, json={
        "product_id": test_env["product_id"],
        "quantity": 10,
    })

    # Attempt to stock-out 50 units -> should fail with 400
    res = client.post("/api/inventory/stock-out", headers=headers, json={
        "product_id": test_env["product_id"],
        "quantity": 50,
        "reason": "sale",
    })
    assert res.status_code == 400
    assert "Insufficient stock" in res.get_json()["message"]


def test_adjustment(client, test_env):
    """Test physical count reconciliation updates batch and appends transaction."""
    headers = {"X-Store-ID": test_env["store_id"]}

    # Create batch of 30 units
    in_res = client.post("/api/inventory/stock-in", headers=headers, json={
        "product_id": test_env["product_id"],
        "quantity": 30,
    })
    batch_id = in_res.get_json()["data"]["batch"]["id"]

    # Reconcile physical count to 28 (diff -2)
    adj_res = client.post("/api/inventory/adjustment", headers=headers, json={
        "product_id": test_env["product_id"],
        "batch_id": batch_id,
        "new_quantity": 28,
        "notes": "Damaged bottle found",
    })
    assert adj_res.status_code == 200
    data = adj_res.get_json()["data"]
    assert data["new_quantity"] == 28
    assert data["difference"] == -2
    assert data["transaction"]["type"] == "adjustment"


def test_stock_levels_and_transactions_list(client, test_env):
    """Test GET stock-levels and GET transactions history endpoints."""
    headers = {"X-Store-ID": test_env["store_id"]}

    # Stock-in 15 units (threshold is 10, so status should be 'ok')
    client.post("/api/inventory/stock-in", headers=headers, json={
        "product_id": test_env["product_id"],
        "quantity": 15,
    })

    # Check stock levels
    res_levels = client.get("/api/inventory/stock-levels", headers=headers)
    assert res_levels.status_code == 200
    levels = res_levels.get_json()["data"]["items"]
    assert len(levels) >= 1
    assert levels[0]["current_stock"] == 15
    assert levels[0]["status"] == "ok"

    # Check transactions history
    res_tx = client.get("/api/inventory/transactions", headers=headers)
    assert res_tx.status_code == 200
    txs = res_tx.get_json()["data"]["transactions"]
    assert len(txs) >= 1
    assert txs[0]["type"] == "stock_in"

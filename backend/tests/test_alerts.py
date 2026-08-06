"""
Unit tests for Notifications & Alerts API endpoints.
"""

import pytest
import uuid
from datetime import date, timedelta
from app import create_app
from app.utils import get_supabase_client


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def alert_env():
    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())
    product1_id = str(uuid.uuid4())

    # Create test user and store
    supabase.table("users").insert({
        "id": user_id,
        "email": f"alert-test-{user_id[:8]}@kirstry.test",
        "full_name": "Alert Tester",
    }).execute()

    supabase.table("stores").insert({
        "id": store_id,
        "owner_id": user_id,
        "name": "Alert Test Store",
    }).execute()

    # Create 1 test low stock product (current stock = 2 <= low_stock_threshold = 10)
    supabase.table("products").insert({
        "id": product1_id,
        "store_id": store_id,
        "name": "Low Stock Sugar 1kg",
        "unit": "kg",
        "selling_price": 45.0,
        "low_stock_threshold": 10,
        "is_active": True,
    }).execute()

    today = date.today()
    exp_1_day = (today + timedelta(days=1)).isoformat()
    supabase.table("stock_batches").insert([
        # Batch 1 for low stock product
        {
            "store_id": store_id,
            "product_id": product1_id,
            "batch_number": "SUGAR-BATCH-01",
            "initial_quantity": 2,
            "quantity_remaining": 2,
            "cost_price": 38.0,
            "expiry_date": exp_1_day,
        }
    ]).execute()

    yield {
        "store_id": store_id,
        "user_id": user_id,
        "product1_id": product1_id,
    }

    # Cleanup
    try:
        supabase.table("alerts").delete().eq("store_id", store_id).execute()
        supabase.table("stock_batches").delete().eq("store_id", store_id).execute()
        supabase.table("products").delete().eq("id", product1_id).execute()
        supabase.table("stores").delete().eq("id", store_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass


def test_alert_generation_deduplication_and_workflow(client, alert_env):
    """Test generating alerts, deduplication, counting unread, filtering, and marking read."""
    headers = {"X-Store-ID": alert_env["store_id"]}

    # 1. Trigger Alert Generation Scan
    res_gen = client.post("/api/alerts/generate", headers=headers)
    assert res_gen.status_code == 200
    gen_data = res_gen.get_json()["data"]
    assert gen_data["new_alerts_created"] >= 1

    # 2. Verify Deduplication on Second Scan Call
    res_gen2 = client.post("/api/alerts/generate", headers=headers)
    assert res_gen2.status_code == 200
    assert res_gen2.get_json()["data"]["new_alerts_created"] == 0

    # 3. Check Unread Count
    res_count = client.get("/api/alerts/unread-count", headers=headers)
    assert res_count.status_code == 200
    unread_count = res_count.get_json()["data"]["unread_count"]
    assert unread_count >= 1

    # 4. List Alerts with filter
    res_list = client.get("/api/alerts?is_read=false", headers=headers)
    assert res_list.status_code == 200
    alerts = res_list.get_json()["data"]["alerts"]
    assert len(alerts) >= 1
    target_alert_id = alerts[0]["id"]

    # 5. Mark single alert read
    res_read = client.put(f"/api/alerts/{target_alert_id}/read", headers=headers)
    assert res_read.status_code == 200
    assert res_read.get_json()["data"]["is_read"] is True

    # 6. Mark all remaining read
    res_read_all = client.put("/api/alerts/read-all", headers=headers)
    assert res_read_all.status_code == 200

    # 7. Verify Unread Count is now 0
    res_count_final = client.get("/api/alerts/unread-count", headers=headers)
    assert res_count_final.get_json()["data"]["unread_count"] == 0

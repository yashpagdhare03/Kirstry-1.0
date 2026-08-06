"""
Unit tests for Dashboard & Analytics API endpoints.
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
def analytics_env():
    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())
    product1_id = str(uuid.uuid4())
    product2_id = str(uuid.uuid4())

    # Create test user and store
    supabase.table("users").insert({
        "id": user_id,
        "email": f"analytics-test-{user_id[:8]}@kirstry.test",
        "full_name": "Analytics Tester",
    }).execute()

    supabase.table("stores").insert({
        "id": store_id,
        "owner_id": user_id,
        "name": "Analytics Test Store",
    }).execute()

    # Create 2 test products
    supabase.table("products").insert([
        {
            "id": product1_id,
            "store_id": store_id,
            "name": "Fast Oil 1L",
            "unit": "pouch",
            "selling_price": 150.0,
            "low_stock_threshold": 10,
            "is_active": True,
        },
        {
            "id": product2_id,
            "store_id": store_id,
            "name": "Slow Soap 100g",
            "unit": "bar",
            "selling_price": 40.0,
            "low_stock_threshold": 5,
            "is_active": True,
        },
    ]).execute()

    # Stock-in product 1 (expiring in 2 days)
    today = date.today()
    exp_2_days = (today + timedelta(days=2)).isoformat()
    supabase.table("stock_batches").insert({
        "store_id": store_id,
        "product_id": product1_id,
        "batch_number": "BATCH-EXP-01",
        "initial_quantity": 5,  # Low stock (5 <= 10)
        "quantity_remaining": 5,
        "cost_price": 120.0,
        "expiry_date": exp_2_days,
    }).execute()

    yield {
        "store_id": store_id,
        "user_id": user_id,
        "product1_id": product1_id,
        "product2_id": product2_id,
    }

    # Cleanup
    try:
        supabase.table("sale_items").delete().eq("product_id", product1_id).execute()
        supabase.table("sale_items").delete().eq("product_id", product2_id).execute()
        supabase.table("sales").delete().eq("store_id", store_id).execute()
        supabase.table("stock_batches").delete().eq("store_id", store_id).execute()
        supabase.table("products").delete().eq("id", product1_id).execute()
        supabase.table("products").delete().eq("id", product2_id).execute()
        supabase.table("stores").delete().eq("id", store_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass


def test_dashboard_summary_and_alerts(client, analytics_env):
    """Test GET /api/dashboard/summary, /expiry-alerts, and /low-stock-alerts."""
    headers = {"X-Store-ID": analytics_env["store_id"]}

    # 1. Summary
    res_sum = client.get("/api/dashboard/summary", headers=headers)
    assert res_sum.status_code == 200
    summary = res_sum.get_json()["data"]
    assert summary["total_products"] == 2
    assert summary["total_inventory_value"] == 600.0  # 5 * 120.0
    assert summary["expiring_soon_count"] == 1

    # 2. Expiry Alerts (categorized 3_days urgency)
    res_exp = client.get("/api/dashboard/expiry-alerts?days=7", headers=headers)
    assert res_exp.status_code == 200
    exp_data = res_exp.get_json()["data"]
    assert exp_data["total_expiring_count"] >= 1
    assert len(exp_data["bucket_3_days"]) >= 1

    # 3. Low Stock Alerts (Fast Oil 1L current_stock 5 <= threshold 10)
    res_low = client.get("/api/dashboard/low-stock-alerts", headers=headers)
    assert res_low.status_code == 200
    low_items = res_low.get_json()["data"]
    assert len(low_items) >= 1
    assert any(item["name"] == "Fast Oil 1L" for item in low_items)


def test_recent_sales_and_analytics_trends(client, analytics_env):
    """Test recent sales list, sales trends, fast/slow moving products, and inventory valuation."""
    headers = {"X-Store-ID": analytics_env["store_id"]}

    # 1. Recent sales
    res_recent = client.get("/api/dashboard/recent-sales", headers=headers)
    assert res_recent.status_code == 200

    # 2. Sales trends
    res_trends = client.get("/api/analytics/sales-trends?days=7", headers=headers)
    assert res_trends.status_code == 200
    trends = res_trends.get_json()["data"]
    assert len(trends) == 8  # 7 days + today

    # 3. Fast moving products
    res_fast = client.get("/api/analytics/fast-moving", headers=headers)
    assert res_fast.status_code == 200

    # 4. Slow moving products
    res_slow = client.get("/api/analytics/slow-moving", headers=headers)
    assert res_slow.status_code == 200
    slow_items = res_slow.get_json()["data"]
    assert len(slow_items) >= 1

    # 5. Inventory valuation by category
    res_val = client.get("/api/analytics/inventory-value", headers=headers)
    assert res_val.status_code == 200

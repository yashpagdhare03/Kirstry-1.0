"""
Unit tests for Billing & Invoice API endpoints.
"""

import pytest
import uuid
from app import create_app
from app.utils import get_supabase_client
from app.services import generate_invoice_pdf


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def billing_env():
    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())
    product_id = str(uuid.uuid4())
    customer_id = str(uuid.uuid4())

    # Create test user, store, product, customer
    supabase.table("users").insert({
        "id": user_id,
        "email": f"billing-test-{user_id[:8]}@kirstry.test",
        "full_name": "Billing Tester",
    }).execute()

    supabase.table("stores").insert({
        "id": store_id,
        "owner_id": user_id,
        "name": "Billing Test Kirana",
    }).execute()

    supabase.table("products").insert({
        "id": product_id,
        "store_id": store_id,
        "name": "Basmati Rice 5kg",
        "unit": "bag",
        "selling_price": 450.0,
        "low_stock_threshold": 5,
        "is_active": True,
    }).execute()

    supabase.table("customers").insert({
        "id": customer_id,
        "store_id": store_id,
        "name": "Ramesh Kumar",
        "phone": "9876543210",
    }).execute()

    # Stock-in 100 bags of rice
    headers = {"X-Store-ID": store_id}
    app = create_app()
    with app.test_client() as c:
        c.post("/api/inventory/stock-in", headers=headers, json={
            "product_id": product_id,
            "quantity": 100,
            "cost_price": 400.0,
        })

    yield {
        "store_id": store_id,
        "product_id": product_id,
        "customer_id": customer_id,
        "user_id": user_id,
    }

    # Cleanup
    try:
        supabase.table("credit_transactions").delete().eq("store_id", store_id).execute()
        supabase.table("sale_items").delete().eq("product_id", product_id).execute()
        supabase.table("sales").delete().eq("store_id", store_id).execute()
        supabase.table("stock_transactions").delete().eq("store_id", store_id).execute()
        supabase.table("stock_batches").delete().eq("store_id", store_id).execute()
        supabase.table("customers").delete().eq("id", customer_id).execute()
        supabase.table("products").delete().eq("id", product_id).execute()
        supabase.table("stores").delete().eq("id", store_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass


def test_create_cash_bill(client, billing_env):
    """Test creating a cash bill with automatic stock deduction."""
    headers = {"X-Store-ID": billing_env["store_id"]}
    payload = {
        "items": [
            {"product_id": billing_env["product_id"], "quantity": 2, "unit_price": 450.0}
        ],
        "payment_mode": "cash",
        "discount": 50.0,
    }

    res = client.post("/api/billing/create", headers=headers, json=payload)
    assert res.status_code == 201
    sale = res.get_json()["data"]

    assert sale["invoice_number"].startswith("INV-")
    assert sale["subtotal"] == 900.0
    assert sale["discount"] == 50.0
    assert sale["total_amount"] == 850.0
    assert sale["payment_mode"] == "cash"

    # Verify stock deducted (100 - 2 = 98)
    res_levels = client.get("/api/inventory/stock-levels", headers=headers)
    assert res_levels.get_json()["data"]["items"][0]["current_stock"] == 98


def test_create_credit_bill(client, billing_env):
    """Test creating credit bill records credit transaction."""
    headers = {"X-Store-ID": billing_env["store_id"]}
    payload = {
        "items": [
            {"product_id": billing_env["product_id"], "quantity": 1, "unit_price": 450.0}
        ],
        "payment_mode": "credit",
        "customer_id": billing_env["customer_id"],
    }

    res = client.post("/api/billing/create", headers=headers, json=payload)
    assert res.status_code == 201
    sale = res.get_json()["data"]
    assert sale["payment_mode"] == "credit"
    assert sale["customer_id"] == billing_env["customer_id"]


def test_credit_bill_missing_customer(client, billing_env):
    """Test credit bill without customer_id returns 400 error."""
    headers = {"X-Store-ID": billing_env["store_id"]}
    payload = {
        "items": [
            {"product_id": billing_env["product_id"], "quantity": 1, "unit_price": 450.0}
        ],
        "payment_mode": "credit",
    }

    res = client.post("/api/billing/create", headers=headers, json=payload)
    assert res.status_code == 400
    assert "Customer is required" in res.get_json()["message"]


def test_bill_insufficient_stock(client, billing_env):
    """Test bill creation fails if requested quantity exceeds available stock."""
    headers = {"X-Store-ID": billing_env["store_id"]}
    payload = {
        "items": [
            {"product_id": billing_env["product_id"], "quantity": 500, "unit_price": 450.0}
        ],
        "payment_mode": "cash",
    }

    res = client.post("/api/billing/create", headers=headers, json=payload)
    assert res.status_code == 400
    assert "Insufficient stock" in res.get_json()["message"]


def test_sales_history_and_daily_summary(client, billing_env):
    """Test listing sales history and daily summary."""
    headers = {"X-Store-ID": billing_env["store_id"]}

    # Create a bill
    client.post("/api/billing/create", headers=headers, json={
        "items": [{"product_id": billing_env["product_id"], "quantity": 1, "unit_price": 450.0}],
        "payment_mode": "upi",
    })

    # Sales history
    res_sales = client.get("/api/billing/sales", headers=headers)
    assert res_sales.status_code == 200
    sales = res_sales.get_json()["data"]["sales"]
    assert len(sales) >= 1

    # Daily summary
    res_sum = client.get("/api/billing/daily-summary", headers=headers)
    assert res_sum.status_code == 200
    summary = res_sum.get_json()["data"]
    assert summary["total_sales_count"] >= 1
    assert summary["total_revenue"] >= 450.0
    assert summary["payment_mode_breakdown"]["upi"] >= 450.0


def test_pdf_invoice_generator():
    """Test ReportLab PDF invoice generator creates valid non-empty byte stream."""
    sample_sale = {
        "invoice_number": "INV-20260806-0001",
        "created_at": "2026-08-06T12:00:00",
        "payment_mode": "cash",
        "subtotal": 900.0,
        "discount": 50.0,
        "total_amount": 850.0,
        "items": [
            {"product_name": "Basmati Rice 5kg", "quantity": 2, "unit_price": 450.0, "total_price": 900.0}
        ],
    }

    pdf_bytes = generate_invoice_pdf(sample_sale, store_name="Test Kirana Store")
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF-")


def test_whatsapp_share_link(client, billing_env):
    """Test WhatsApp share link endpoint returns formatted wa.me URL."""
    headers = {"X-Store-ID": billing_env["store_id"]}
    create_res = client.post("/api/billing/create", headers=headers, json={
        "items": [{"product_id": billing_env["product_id"], "quantity": 1, "unit_price": 450.0}],
        "payment_mode": "cash",
    })
    sale_id = create_res.get_json()["data"]["id"]

    res_share = client.get(f"/api/billing/invoice/{sale_id}/share", headers=headers)
    assert res_share.status_code == 200
    whatsapp_url = res_share.get_json()["data"]["whatsapp_url"]
    assert whatsapp_url.startswith("https://wa.me/?text=")

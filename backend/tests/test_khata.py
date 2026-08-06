"""
Unit tests for Digital Khata (Customer Credit & Payment) API endpoints.
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
def khata_env():
    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())

    # Create test user and store
    supabase.table("users").insert({
        "id": user_id,
        "email": f"khata-test-{user_id[:8]}@kirstry.test",
        "full_name": "Khata Tester",
    }).execute()

    supabase.table("stores").insert({
        "id": store_id,
        "owner_id": user_id,
        "name": "Khata Test Store",
    }).execute()

    yield {
        "store_id": store_id,
        "user_id": user_id,
    }

    # Cleanup
    try:
        supabase.table("credit_transactions").delete().eq("store_id", store_id).execute()
        supabase.table("customers").delete().eq("store_id", store_id).execute()
        supabase.table("stores").delete().eq("id", store_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass


def test_customer_crud(client, khata_env):
    """Test customer creation, retrieval, and update."""
    headers = {"X-Store-ID": khata_env["store_id"]}

    # Create customer
    res = client.post("/api/customers", headers=headers, json={
        "name": "Vikram Singh",
        "phone": "9812345678",
        "credit_limit": 5000.0,
    })
    assert res.status_code == 201
    cust = res.get_json()["data"]
    assert cust["name"] == "Vikram Singh"
    cid = cust["id"]

    # List customers
    res_list = client.get("/api/customers", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.get_json()["data"]["customers"]) >= 1

    # Get single customer
    res_get = client.get(f"/api/customers/{cid}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.get_json()["data"]["outstanding_balance"] == 0.0

    # Update customer
    res_put = client.put(f"/api/customers/{cid}", headers=headers, json={"phone": "9998887776"})
    assert res_put.status_code == 200
    assert res_put.get_json()["data"]["phone"] == "9998887776"


def test_credit_and_payment_flow(client, khata_env):
    """Test credit entry increases balance and payment entry decreases balance."""
    headers = {"X-Store-ID": khata_env["store_id"]}

    # Create customer
    c_res = client.post("/api/customers", headers=headers, json={"name": "Suresh Gupta", "phone": "9800011122"})
    cid = c_res.get_json()["data"]["id"]

    # Record Credit ₹500
    cred_res = client.post("/api/khata/credit", headers=headers, json={
        "customer_id": cid,
        "amount": 500.0,
        "due_date": "2026-12-31",
        "note": "Groceries udhari",
    })
    assert cred_res.status_code == 201
    assert cred_res.get_json()["data"]["new_outstanding_balance"] == 500.0

    # Record Partial Payment ₹200
    pay_res = client.post("/api/khata/payment", headers=headers, json={
        "customer_id": cid,
        "amount": 200.0,
        "note": "UPI payment received",
    })
    assert pay_res.status_code == 201
    assert pay_res.get_json()["data"]["new_outstanding_balance"] == 300.0


def test_payment_exceeding_balance_rejected(client, khata_env):
    """Test payment exceeding current outstanding balance returns 400 error."""
    headers = {"X-Store-ID": khata_env["store_id"]}

    c_res = client.post("/api/customers", headers=headers, json={"name": "Pooja Roy"})
    cid = c_res.get_json()["data"]["id"]

    # Record Credit ₹100
    client.post("/api/khata/credit", headers=headers, json={"customer_id": cid, "amount": 100.0})

    # Attempt Payment ₹200 -> Expect 400 error
    res_pay = client.post("/api/khata/payment", headers=headers, json={"customer_id": cid, "amount": 200.0})
    assert res_pay.status_code == 400
    assert "exceeds current outstanding balance" in res_pay.get_json()["message"]


def test_outstanding_list_and_summary(client, khata_env):
    """Test GET outstanding customers sorted balance DESC and GET khata summary."""
    headers = {"X-Store-ID": khata_env["store_id"]}

    # Customer A (Credit ₹300)
    ca = client.post("/api/customers", headers=headers, json={"name": "Customer A"}).get_json()["data"]["id"]
    client.post("/api/khata/credit", headers=headers, json={"customer_id": ca, "amount": 300.0})

    # Customer B (Credit ₹800)
    cb = client.post("/api/customers", headers=headers, json={"name": "Customer B"}).get_json()["data"]["id"]
    client.post("/api/khata/credit", headers=headers, json={"customer_id": cb, "amount": 800.0})

    # Get Outstanding List
    res_out = client.get("/api/khata/outstanding", headers=headers)
    assert res_out.status_code == 200
    out_custs = res_out.get_json()["data"]["customers"]
    assert len(out_custs) == 2
    # Verify sorted balance DESC (800 before 300)
    assert out_custs[0]["outstanding_balance"] == 800.0
    assert out_custs[1]["outstanding_balance"] == 300.0

    # Get Khata Summary
    res_sum = client.get("/api/khata/summary", headers=headers)
    assert res_sum.status_code == 200
    summary = res_sum.get_json()["data"]
    assert summary["total_outstanding_amount"] == 1100.0
    assert summary["total_customers_with_credit"] == 2

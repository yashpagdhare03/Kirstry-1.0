"""
Unit tests for Supplier Management & Purchase Order API endpoints.
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
def supplier_env():
    supabase = get_supabase_client()
    user_id = str(uuid.uuid4())
    store_id = str(uuid.uuid4())

    # Create test user and store
    supabase.table("users").insert({
        "id": user_id,
        "email": f"supplier-test-{user_id[:8]}@kirstry.test",
        "full_name": "Supplier Tester",
    }).execute()

    supabase.table("stores").insert({
        "id": store_id,
        "owner_id": user_id,
        "name": "Supplier Test Store",
    }).execute()

    yield {
        "store_id": store_id,
        "user_id": user_id,
    }

    # Cleanup
    try:
        supabase.table("purchase_orders").delete().eq("store_id", store_id).execute()
        supabase.table("suppliers").delete().eq("store_id", store_id).execute()
        supabase.table("stores").delete().eq("id", store_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()
    except Exception:
        pass


def test_supplier_crud(client, supplier_env):
    """Test creating, listing, updating, and deleting a supplier."""
    headers = {"X-Store-ID": supplier_env["store_id"]}

    # 1. Create Supplier
    res_create = client.post("/api/suppliers", headers=headers, json={
        "name": "Amul Wholesaler Pvt Ltd",
        "phone": "9876543210",
        "items_supplied": "Butter, Milk, Cheese",
    })
    assert res_create.status_code == 201
    supplier = res_create.get_json()["data"]
    assert supplier["name"] == "Amul Wholesaler Pvt Ltd"
    sid = supplier["id"]

    # 2. List Suppliers
    res_list = client.get("/api/suppliers", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.get_json()["data"]["suppliers"]) >= 1

    # 3. Get Single Supplier
    res_get = client.get(f"/api/suppliers/{sid}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.get_json()["data"]["items_supplied"] == "Butter, Milk, Cheese"

    # 4. Update Supplier
    res_put = client.put(f"/api/suppliers/{sid}", headers=headers, json={"phone": "9990001112"})
    assert res_put.status_code == 200
    assert res_put.get_json()["data"]["phone"] == "9990001112"

    # 5. Delete Supplier (no active POs)
    res_del = client.delete(f"/api/suppliers/{sid}", headers=headers)
    assert res_del.status_code == 200


def test_delete_supplier_with_active_po_fails(client, supplier_env):
    """Test deleting a supplier with active (draft/sent) PO returns 409 Conflict."""
    headers = {"X-Store-ID": supplier_env["store_id"]}

    # Create Supplier
    s_res = client.post("/api/suppliers", headers=headers, json={"name": "Nestle Distributor"})
    sid = s_res.get_json()["data"]["id"]

    # Create Draft PO for Supplier
    client.post("/api/purchase-orders", headers=headers, json={
        "supplier_id": sid,
        "items": [{"product_name": "Maggi 280g", "quantity": 100, "estimated_cost": 22.0}],
    })

    # Attempt to delete supplier -> expect 409 Conflict
    del_res = client.delete(f"/api/suppliers/{sid}", headers=headers)
    assert del_res.status_code == 409
    assert "active purchase orders" in del_res.get_json()["message"]


def test_purchase_order_lifecycle_and_state_machine(client, supplier_env):
    """Test PO state machine transitions (draft -> sent -> received) and validation constraints."""
    headers = {"X-Store-ID": supplier_env["store_id"]}

    # Create Supplier
    s_res = client.post("/api/suppliers", headers=headers, json={"name": "Britannia Traders", "phone": "9811223344"})
    sid = s_res.get_json()["data"]["id"]

    # 1. Create Draft PO
    po_res = client.post("/api/purchase-orders", headers=headers, json={
        "supplier_id": sid,
        "items": [
            {"product_name": "Good Day Biscuit", "quantity": 50, "estimated_cost": 15.0}
        ],
    })
    assert po_res.status_code == 201
    po = po_res.get_json()["data"]
    assert po["status"] == "draft"
    assert po["po_number"].startswith("PO-")
    poid = po["id"]

    # 2. Transition draft -> sent
    res_sent = client.put(f"/api/purchase-orders/{poid}", headers=headers, json={"status": "sent"})
    assert res_sent.status_code == 200
    assert res_sent.get_json()["data"]["status"] == "sent"

    # 3. Attempt modifying items on non-draft (sent) PO -> expect 400
    res_mod_items = client.put(f"/api/purchase-orders/{poid}", headers=headers, json={
        "items": [{"product_name": "Good Day Biscuit", "quantity": 100}]
    })
    assert res_mod_items.status_code == 400
    assert "Line items can only be modified on purchase orders in 'draft' status" in res_mod_items.get_json()["message"]

    # 4. Transition sent -> received
    res_rec = client.put(f"/api/purchase-orders/{poid}", headers=headers, json={"status": "received"})
    assert res_rec.status_code == 200
    assert res_rec.get_json()["data"]["status"] == "received"

    # 5. Attempt invalid transition received -> draft -> expect 400
    res_invalid_trans = client.put(f"/api/purchase-orders/{poid}", headers=headers, json={"status": "draft"})
    assert res_invalid_trans.status_code == 400
    assert "Cannot change status" in res_invalid_trans.get_json()["message"]


def test_po_whatsapp_share_link(client, supplier_env):
    """Test generating WhatsApp share link for Purchase Order."""
    headers = {"X-Store-ID": supplier_env["store_id"]}

    s_res = client.post("/api/suppliers", headers=headers, json={"name": "Tata Tea Agency", "phone": "9812340000"})
    sid = s_res.get_json()["data"]["id"]

    po_res = client.post("/api/purchase-orders", headers=headers, json={
        "supplier_id": sid,
        "items": [{"product_name": "Tata Tea Gold 250g", "quantity": 20, "estimated_cost": 120.0}],
    })
    poid = po_res.get_json()["data"]["id"]

    res_share = client.get(f"/api/purchase-orders/{poid}/share", headers=headers)
    assert res_share.status_code == 200
    whatsapp_url = res_share.get_json()["data"]["whatsapp_url"]
    assert whatsapp_url.startswith("https://wa.me/9812340000?text=")
    assert "Tata%20Tea%20Gold%20250g" in whatsapp_url

"""
Digital Khata (Customer Credit & Payment Ledger) Service.
Handles customer management, credit entries, payment collections, balance calculations, and overdue tracking.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date
from app.utils import get_supabase_client


def calculate_customer_balance(store_id: str, customer_id: str) -> float:
    """
    Calculates net outstanding balance for a customer (total_credit - total_payment).
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("credit_transactions")
        .select("type, amount")
        .eq("store_id", store_id)
        .eq("customer_id", customer_id)
        .execute()
    )
    txs = res.data or []

    total_credit = sum(float(t.get("amount", 0.0)) for t in txs if t.get("type") == "credit")
    total_payment = sum(float(t.get("amount", 0.0)) for t in txs if t.get("type") == "payment")
    return round(total_credit - total_payment, 2)


def create_customer(store_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates a new customer scoped by store_id.
    """
    supabase = get_supabase_client()
    payload = {
        "store_id": store_id,
        "name": data["name"].strip(),
    }
    if data.get("phone"):
        payload["phone"] = data["phone"].strip()

    res = supabase.table("customers").insert(payload).execute()
    if not res.data or len(res.data) == 0:
        raise RuntimeError("Failed to create customer")

    customer = res.data[0]
    customer["outstanding_balance"] = 0.0
    return customer


def get_customers(
    store_id: str,
    search: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Lists customers for store_id with search and computed outstanding_balance.
    """
    supabase = get_supabase_client()
    query = supabase.table("customers").select("*", count="exact").eq("store_id", store_id)

    if search:
        search_str = search.strip()
        query = query.or_(f"name.ilike.%{search_str}%,phone.ilike.%{search_str}%")

    res = query.execute()
    customers = res.data or []

    if not customers:
        return {"customers": [], "total": 0, "page": page, "per_page": per_page}

    # Batch compute balance for returned customers
    cust_ids = [c["id"] for c in customers]
    tx_res = (
        supabase.table("credit_transactions")
        .select("customer_id, type, amount")
        .eq("store_id", store_id)
        .in_("customer_id", cust_ids)
        .execute()
    )

    balance_map: Dict[str, float] = {cid: 0.0 for cid in cust_ids}
    for t in (tx_res.data or []):
        cid = t["customer_id"]
        amt = float(t.get("amount", 0.0))
        if t.get("type") == "credit":
            balance_map[cid] = balance_map.get(cid, 0.0) + amt
        elif t.get("type") == "payment":
            balance_map[cid] = balance_map.get(cid, 0.0) - amt

    for c in customers:
        c["outstanding_balance"] = round(balance_map.get(c["id"], 0.0), 2)

    total_count = res.count if res.count is not None else len(customers)
    offset = (page - 1) * per_page
    paginated_customers = customers[offset : offset + per_page]

    return {
        "customers": paginated_customers,
        "total": total_count,
        "page": page,
        "per_page": per_page,
    }


def get_customer_by_id(store_id: str, customer_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves single customer details with calculated outstanding balance and transaction history.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("customers")
        .select("*")
        .eq("store_id", store_id)
        .eq("id", customer_id)
        .execute()
    )
    if not res.data or len(res.data) == 0:
        return None

    customer = res.data[0]
    customer["outstanding_balance"] = calculate_customer_balance(store_id, customer_id)

    # Fetch transaction history
    tx_res = (
        supabase.table("credit_transactions")
        .select("*")
        .eq("store_id", store_id)
        .eq("customer_id", customer_id)
        .order("created_at", desc=True)
        .execute()
    )
    customer["transactions"] = tx_res.data or []

    return customer


def update_customer(store_id: str, customer_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates customer info scoped by store_id.
    """
    supabase = get_supabase_client()
    existing = get_customer_by_id(store_id, customer_id)
    if not existing:
        return None

    update_payload = {}
    if "name" in data and data["name"] is not None:
        update_payload["name"] = data["name"].strip()
    if "phone" in data and data["phone"] is not None:
        update_payload["phone"] = data["phone"].strip()

    if not update_payload:
        return existing

    res = (
        supabase.table("customers")
        .update(update_payload)
        .eq("store_id", store_id)
        .eq("id", customer_id)
        .execute()
    )

    if res.data and len(res.data) > 0:
        c = res.data[0]
        c["outstanding_balance"] = calculate_customer_balance(store_id, customer_id)
        return c

    return None


def record_credit(
    store_id: str,
    data: Dict[str, Any],
    created_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Records a credit entry (udhari) for a customer.
    """
    supabase = get_supabase_client()
    customer_id = data["customer_id"]
    amount = float(data["amount"])

    customer = get_customer_by_id(store_id, customer_id)
    if not customer:
        raise ValueError("Customer not found")

    payload = {
        "store_id": store_id,
        "customer_id": customer_id,
        "type": "credit",
        "amount": amount,
        "due_date": data.get("due_date"),
        "sale_id": data.get("sale_id"),
        "note": data.get("note"),
        "created_by": created_by,
    }

    res = supabase.table("credit_transactions").insert(payload).execute()
    if not res.data or len(res.data) == 0:
        raise RuntimeError("Failed to record credit transaction")

    tx = res.data[0]
    new_balance = calculate_customer_balance(store_id, customer_id)

    return {
        "transaction": tx,
        "customer_id": customer_id,
        "new_outstanding_balance": new_balance,
    }


def record_payment(
    store_id: str,
    data: Dict[str, Any],
    created_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Records a payment collection entry from customer.
    Rejects payment if amount exceeds customer's current outstanding balance with HTTP 400.
    """
    supabase = get_supabase_client()
    customer_id = data["customer_id"]
    payment_amount = float(data["amount"])

    customer = get_customer_by_id(store_id, customer_id)
    if not customer:
        raise ValueError("Customer not found")

    current_balance = customer["outstanding_balance"]

    # Reject if payment exceeds balance
    if payment_amount > current_balance:
        raise ValueError(
            f"Payment amount (₹{payment_amount:.2f}) exceeds current outstanding balance (₹{current_balance:.2f})"
        )

    payload = {
        "store_id": store_id,
        "customer_id": customer_id,
        "type": "payment",
        "amount": payment_amount,
        "note": data.get("note"),
        "created_by": created_by,
    }

    res = supabase.table("credit_transactions").insert(payload).execute()
    if not res.data or len(res.data) == 0:
        raise RuntimeError("Failed to record payment transaction")

    tx = res.data[0]
    new_balance = calculate_customer_balance(store_id, customer_id)

    return {
        "transaction": tx,
        "customer_id": customer_id,
        "new_outstanding_balance": new_balance,
    }


def get_outstanding_customers(
    store_id: str,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Lists all customers with positive outstanding balance sorted by balance descending.
    """
    all_res = get_customers(store_id=store_id, page=1, per_page=1000)
    customers = all_res.get("customers", [])

    # Filter balance > 0 and sort balance DESC
    outstanding_custs = [c for c in customers if c.get("outstanding_balance", 0.0) > 0]
    outstanding_custs.sort(key=lambda c: c["outstanding_balance"], reverse=True)

    total_count = len(outstanding_custs)
    offset = (page - 1) * per_page
    paginated = outstanding_custs[offset : offset + per_page]

    return {
        "customers": paginated,
        "total": total_count,
        "page": page,
        "per_page": per_page,
    }


def get_khata_summary(store_id: str) -> Dict[str, Any]:
    """
    Aggregates credit stats for store (total outstanding, count of customers with balance, overdue count).
    """
    supabase = get_supabase_client()
    today_str = date.today().isoformat()

    all_res = get_customers(store_id=store_id, page=1, per_page=1000)
    customers = all_res.get("customers", [])

    total_outstanding = sum(c.get("outstanding_balance", 0.0) for c in customers if c.get("outstanding_balance", 0.0) > 0)
    custs_with_credit = len([c for c in customers if c.get("outstanding_balance", 0.0) > 0])

    # Query overdue transactions (due_date < today and type = 'credit')
    overdue_res = (
        supabase.table("credit_transactions")
        .select("customer_id")
        .eq("store_id", store_id)
        .eq("type", "credit")
        .lt("due_date", today_str)
        .execute()
    )
    overdue_cust_ids = set(t["customer_id"] for t in (overdue_res.data or []))
    # Count customers in overdue_cust_ids who currently have positive balance
    overdue_count = len([
        c for c in customers
        if c["id"] in overdue_cust_ids and c.get("outstanding_balance", 0.0) > 0
    ])

    return {
        "total_outstanding_amount": round(total_outstanding, 2),
        "total_customers_with_credit": custs_with_credit,
        "overdue_customers_count": overdue_count,
    }

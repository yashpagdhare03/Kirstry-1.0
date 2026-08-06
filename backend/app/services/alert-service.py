"""
Notifications & Alerts Management Service.
Handles automatic scanning for low stock and expiring inventory, alert deduplication, status updates, and unread counts.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
from app.utils import get_supabase_client
from app.services import get_products


def generate_store_alerts(store_id: str) -> Dict[str, Any]:
    """
    Scans products and batches for low stock and expiring items.
    Generates new alert records while preventing duplicates for unread items.
    """
    supabase = get_supabase_client()
    today = date.today()
    created_alerts = []

    # Query existing unread alerts for deduplication
    existing_unread_res = (
        supabase.table("alerts")
        .select("product_id, batch_id, type, severity")
        .eq("store_id", store_id)
        .eq("is_read", False)
        .execute()
    )
    existing_unread = existing_unread_res.data or []
    unread_low_stock_pids = set(a["product_id"] for a in existing_unread if a.get("type") == "low_stock" and a.get("product_id"))
    unread_expiry_bids = set(a["batch_id"] for a in existing_unread if a.get("type") == "expiry" and a.get("batch_id"))

    # 1. Scan Low Stock Products
    prod_data = get_products(store_id=store_id, is_active=True, page=1, per_page=1000)
    products = prod_data.get("products", [])

    for p in products:
        pid = p["id"]
        threshold = p.get("low_stock_threshold") or 10
        curr_stock = p.get("current_stock", 0)

        if curr_stock <= threshold:
            if pid in unread_low_stock_pids:
                continue  # Deduplicated: unread alert already active

            severity = "critical" if curr_stock == 0 else "warning"
            msg = f"Low stock alert: '{p['name']}' has {curr_stock} {p.get('unit', 'pcs')} remaining (Threshold: {threshold})."

            alert_payload = {
                "store_id": store_id,
                "type": "low_stock",
                "product_id": pid,
                "batch_id": None,
                "message": msg,
                "severity": severity,
                "is_read": False,
            }
            res = supabase.table("alerts").insert(alert_payload).execute()
            if res.data:
                created_alerts.append(res.data[0])

    # 2. Scan Expiring Stock Batches (<= 7 Days)
    max_expiry_date = today + timedelta(days=7)
    batches_res = (
        supabase.table("stock_batches")
        .select("*, products(name, unit)")
        .eq("store_id", store_id)
        .gt("quantity_remaining", 0)
        .not_.is_("expiry_date", "null")
        .lte("expiry_date", max_expiry_date.isoformat())
        .execute()
    )
    batches = batches_res.data or []

    for b in batches:
        bid = b["id"]
        exp_date_str = b.get("expiry_date")
        if not exp_date_str:
            continue

        try:
            exp_date = datetime.strptime(exp_date_str[:10], "%Y-%m-%d").date()
        except ValueError:
            continue

        if bid in unread_expiry_bids:
            continue  # Deduplicated: unread alert already active

        days_left = (exp_date - today).days
        if days_left <= 1:
            severity = "critical"
        elif days_left <= 3:
            severity = "warning"
        else:
            severity = "info"

        pinfo = b.get("products") if isinstance(b.get("products"), dict) else {}
        pname = pinfo.get("name", "Product")
        unit = pinfo.get("unit", "pcs")
        b_num = b.get("batch_number") or f"Batch {bid[:8]}"
        qty = b.get("quantity_remaining", 0)

        msg = f"Expiry alert: Batch '{b_num}' of '{pname}' expires in {max(0, days_left)} days ({qty} {unit} remaining)."

        alert_payload = {
            "store_id": store_id,
            "type": "expiry",
            "product_id": b.get("product_id"),
            "batch_id": bid,
            "message": msg,
            "severity": severity,
            "is_read": False,
        }
        res = supabase.table("alerts").insert(alert_payload).execute()
        if res.data:
            created_alerts.append(res.data[0])

    return {
        "new_alerts_created": len(created_alerts),
        "alerts": created_alerts,
    }


def get_alerts(
    store_id: str,
    type_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    is_read: Optional[bool] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Retrieves paginated list of alerts for store_id with filters.
    """
    supabase = get_supabase_client()
    query = (
        supabase.table("alerts")
        .select("*, products(name, unit)", count="exact")
        .eq("store_id", store_id)
    )

    if type_filter:
        query = query.eq("type", type_filter.lower())

    if severity_filter:
        query = query.eq("severity", severity_filter.lower())

    if is_read is not None:
        query = query.eq("is_read", is_read)

    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    res = query.execute()
    alerts = res.data or []
    total = res.count if res.count is not None else len(alerts)

    return {
        "alerts": alerts,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def mark_alert_read(store_id: str, alert_id: str) -> Optional[Dict[str, Any]]:
    """
    Marks a single alert as read.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("alerts")
        .update({"is_read": True})
        .eq("store_id", store_id)
        .eq("id", alert_id)
        .execute()
    )
    if res.data and len(res.data) > 0:
        return res.data[0]
    return None


def mark_all_alerts_read(store_id: str) -> int:
    """
    Marks all unread alerts for store_id as read. Returns count of updated records.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("alerts")
        .update({"is_read": True})
        .eq("store_id", store_id)
        .eq("is_read", False)
        .execute()
    )
    return len(res.data or [])


def get_unread_count(store_id: str) -> int:
    """
    Returns total count of unread alerts for badge counter.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("alerts")
        .select("id", count="exact")
        .eq("store_id", store_id)
        .eq("is_read", False)
        .execute()
    )
    return res.count if res.count is not None else len(res.data or [])

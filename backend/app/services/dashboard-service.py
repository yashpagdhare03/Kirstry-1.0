"""
Real-time Dashboard Metrics Service.
Calculates real-time summary statistics, expiry alerts (7/3/1 days), low stock alerts, and recent sales.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
from app.utils import get_supabase_client
from app.services import get_products


def get_dashboard_summary(store_id: str) -> Dict[str, Any]:
    """
    Returns real-time key metrics for dashboard.
    """
    supabase = get_supabase_client()
    today_str = date.today().isoformat()

    # 1. Total Products
    prod_res = (
        supabase.table("products")
        .select("id, low_stock_threshold", count="exact")
        .eq("store_id", store_id)
        .eq("is_active", True)
        .execute()
    )
    total_products = prod_res.count if prod_res.count is not None else len(prod_res.data or [])

    # 2. Batches & Inventory Value
    batch_res = (
        supabase.table("stock_batches")
        .select("product_id, quantity_remaining, cost_price, expiry_date")
        .eq("store_id", store_id)
        .gt("quantity_remaining", 0)
        .execute()
    )
    batches = batch_res.data or []

    # Map product stock sum & total inventory valuation
    total_inventory_value = 0.0
    stock_map: Dict[str, int] = {}
    expiring_soon_count = 0

    seven_days_later = date.today() + timedelta(days=7)

    for b in batches:
        pid = b["product_id"]
        qty = b.get("quantity_remaining", 0)
        cost = float(b.get("cost_price") or 0.0)
        stock_map[pid] = stock_map.get(pid, 0) + qty
        total_inventory_value += qty * cost

        exp_date_str = b.get("expiry_date")
        if exp_date_str:
            try:
                exp_date = datetime.strptime(exp_date_str[:10], "%Y-%m-%d").date()
                if date.today() <= exp_date <= seven_days_later:
                    expiring_soon_count += 1
            except ValueError:
                pass

    # 3. Low Stock Count
    low_stock_count = 0
    for p in (prod_res.data or []):
        pid = p["id"]
        threshold = p.get("low_stock_threshold") or 10
        curr_stock = stock_map.get(pid, 0)
        if curr_stock <= threshold:
            low_stock_count += 1

    # 4. Today's Sales Revenue
    sales_res = (
        supabase.table("sales")
        .select("total_amount, payment_mode")
        .eq("store_id", store_id)
        .gte("created_at", f"{today_str}T00:00:00")
        .lte("created_at", f"{today_str}T23:59:59")
        .execute()
    )
    today_sales_list = sales_res.data or []
    today_sales_revenue = sum(float(s.get("total_amount", 0.0)) for s in today_sales_list)
    today_sales_count = len(today_sales_list)

    return {
        "total_products": total_products,
        "total_inventory_value": round(total_inventory_value, 2),
        "low_stock_count": low_stock_count,
        "expiring_soon_count": expiring_soon_count,
        "today_sales_revenue": round(today_sales_revenue, 2),
        "today_sales_count": today_sales_count,
    }


def get_expiry_alerts(store_id: str, days: int = 7) -> Dict[str, Any]:
    """
    Categorizes expiring batches into 1-day, 3-day, and 7-day urgency buckets.
    """
    supabase = get_supabase_client()
    today = date.today()
    max_expiry_date = today + timedelta(days=days)

    res = (
        supabase.table("stock_batches")
        .select("*, products(name, unit)")
        .eq("store_id", store_id)
        .gt("quantity_remaining", 0)
        .not_.is_("expiry_date", "null")
        .lte("expiry_date", max_expiry_date.isoformat())
        .order("expiry_date", desc=False)
        .execute()
    )
    batches = res.data or []

    bucket_1_day = []
    bucket_3_days = []
    bucket_7_days = []

    day_1_threshold = today + timedelta(days=1)
    day_3_threshold = today + timedelta(days=3)

    for b in batches:
        exp_date_str = b.get("expiry_date")
        if not exp_date_str:
            continue
        try:
            exp_date = datetime.strptime(exp_date_str[:10], "%Y-%m-%d").date()
        except ValueError:
            continue

        b_item = dict(b)
        b_item["days_until_expiry"] = (exp_date - today).days

        if exp_date <= day_1_threshold:
            b_item["urgency"] = "1_day"
            bucket_1_day.append(b_item)
        elif exp_date <= day_3_threshold:
            b_item["urgency"] = "3_days"
            bucket_3_days.append(b_item)
        else:
            b_item["urgency"] = "7_days"
            bucket_7_days.append(b_item)

    all_expiring = bucket_1_day + bucket_3_days + bucket_7_days

    return {
        "total_expiring_count": len(all_expiring),
        "bucket_1_day": bucket_1_day,
        "bucket_3_days": bucket_3_days,
        "bucket_7_days": bucket_7_days,
        "items": all_expiring,
    }


def get_low_stock_alerts(store_id: str) -> List[Dict[str, Any]]:
    """
    Returns list of active products whose current stock is below low_stock_threshold.
    """
    prod_data = get_products(store_id=store_id, is_active=True, page=1, per_page=1000)
    products = prod_data.get("products", [])

    low_stock_items = []
    for p in products:
        threshold = p.get("low_stock_threshold") or 10
        curr_stock = p.get("current_stock", 0)
        if curr_stock <= threshold:
            p_item = dict(p)
            p_item["deficit"] = max(0, threshold - curr_stock)
            low_stock_items.append(p_item)

    # Sort by lowest stock first
    low_stock_items.sort(key=lambda x: x.get("current_stock", 0))
    return low_stock_items


def get_recent_sales(store_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Returns last N sales for dashboard display.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("sales")
        .select("*, customers(name, phone)")
        .eq("store_id", store_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []

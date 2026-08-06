"""
Analytics Aggregation Service.
Computes fast-moving products, slow-moving items, sales trends over time, and category valuation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
from app.utils import get_supabase_client
from app.services import get_products


def get_fast_moving_products(
    store_id: str,
    limit: int = 10,
    days: int = 30
) -> List[Dict[str, Any]]:
    """
    Returns top N products by total quantity sold in past N days.
    """
    supabase = get_supabase_client()
    start_date = (date.today() - timedelta(days=days)).isoformat()

    # Query sales in range
    sales_res = (
        supabase.table("sales")
        .select("id")
        .eq("store_id", store_id)
        .gte("created_at", f"{start_date}T00:00:00")
        .execute()
    )
    sale_ids = [s["id"] for s in (sales_res.data or [])]

    if not sale_ids:
        return []

    # Query sale items for these sales
    items_res = (
        supabase.table("sale_items")
        .select("product_id, quantity, total_price, products(name, unit)")
        .in_("sale_id", sale_ids)
        .execute()
    )
    items = items_res.data or []

    stats: Dict[str, Dict[str, Any]] = {}
    for item in items:
        pid = item["product_id"]
        qty = int(item.get("quantity", 0))
        rev = float(item.get("total_price", 0.0))
        pname = item.get("products", {}).get("name") if isinstance(item.get("products"), dict) else "Product"

        if pid not in stats:
            stats[pid] = {
                "product_id": pid,
                "product_name": pname,
                "total_quantity_sold": 0,
                "total_revenue": 0.0,
            }
        stats[pid]["total_quantity_sold"] += qty
        stats[pid]["total_revenue"] += rev

    sorted_list = sorted(stats.values(), key=lambda x: x["total_quantity_sold"], reverse=True)
    return sorted_list[:limit]


def get_slow_moving_products(
    store_id: str,
    limit: int = 10,
    days: int = 30
) -> List[Dict[str, Any]]:
    """
    Returns active products with zero or lowest sales over past N days.
    """
    prod_data = get_products(store_id=store_id, is_active=True, page=1, per_page=1000)
    products = prod_data.get("products", [])

    if not products:
        return []

    fast_moving = get_fast_moving_products(store_id=store_id, limit=1000, days=days)
    fast_map = {p["product_id"]: p["total_quantity_sold"] for p in fast_moving}

    result = []
    for p in products:
        pid = p["id"]
        qty_sold = fast_map.get(pid, 0)
        p_item = dict(p)
        p_item["total_quantity_sold"] = qty_sold
        result.append(p_item)

    # Sort by lowest quantity sold first
    result.sort(key=lambda x: x["total_quantity_sold"])
    return result[:limit]


def get_sales_trends(
    store_id: str,
    timeframe: str = "daily",
    days: int = 30
) -> List[Dict[str, Any]]:
    """
    Returns revenue and order count aggregated by date over past N days.
    """
    supabase = get_supabase_client()
    start_date = date.today() - timedelta(days=days)

    sales_res = (
        supabase.table("sales")
        .select("total_amount, created_at, payment_mode")
        .eq("store_id", store_id)
        .gte("created_at", f"{start_date.isoformat()}T00:00:00")
        .order("created_at", desc=False)
        .execute()
    )
    sales = sales_res.data or []

    # Map daily aggregated metrics
    trend_map: Dict[str, Dict[str, Any]] = {}
    for s in sales:
        dt_str = str(s.get("created_at", ""))[:10]
        amt = float(s.get("total_amount", 0.0))

        if dt_str not in trend_map:
            trend_map[dt_str] = {
                "date": dt_str,
                "revenue": 0.0,
                "orders_count": 0,
            }
        trend_map[dt_str]["revenue"] += amt
        trend_map[dt_str]["orders_count"] += 1

    # Fill missing dates in window with 0 revenue
    trend_list = []
    curr_dt = start_date
    while curr_dt <= date.today():
        d_str = curr_dt.isoformat()
        if d_str in trend_map:
            trend_list.append(trend_map[d_str])
        else:
            trend_list.append({"date": d_str, "revenue": 0.0, "orders_count": 0})
        curr_dt += timedelta(days=1)

    return trend_list


def get_inventory_value_by_category(store_id: str) -> List[Dict[str, Any]]:
    """
    Groups active stock batches by product category and computes total inventory valuation.
    """
    supabase = get_supabase_client()

    batch_res = (
        supabase.table("stock_batches")
        .select("quantity_remaining, cost_price, products(category_id, categories(name))")
        .eq("store_id", store_id)
        .gt("quantity_remaining", 0)
        .execute()
    )
    batches = batch_res.data or []

    cat_map: Dict[str, Dict[str, Any]] = {}
    for b in batches:
        qty = b.get("quantity_remaining", 0)
        cost = float(b.get("cost_price") or 0.0)
        value = qty * cost

        prod = b.get("products") if isinstance(b.get("products"), dict) else {}
        cat_info = prod.get("categories") if isinstance(prod.get("categories"), dict) else {}
        cat_name = cat_info.get("name") if cat_info else "Uncategorized"

        if cat_name not in cat_map:
            cat_map[cat_name] = {
                "category": cat_name,
                "total_quantity": 0,
                "total_value": 0.0,
            }
        cat_map[cat_name]["total_quantity"] += qty
        cat_map[cat_name]["total_value"] += value

    return list(cat_map.values())

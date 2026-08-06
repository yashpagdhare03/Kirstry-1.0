"""
Analytics API routes blueprint.
Handles fast-moving items, slow-moving items, sales trends over time, and category valuation.
"""

from flask import Blueprint, request
from app.utils import success_response, error_response, get_request_store_id
from app.services import (
    get_fast_moving_products,
    get_slow_moving_products,
    get_sales_trends,
    get_inventory_value_by_category,
)

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/api/analytics/fast-moving", methods=["GET"])
def fast_moving_route():
    """Get top N fast moving products by quantity sold."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        limit = min(50, max(1, int(request.args.get("limit", 10))))
        days = min(365, max(1, int(request.args.get("days", 30))))
    except ValueError:
        limit = 10
        days = 30

    fast_moving = get_fast_moving_products(store_id, limit=limit, days=days)
    return success_response(data=fast_moving, message="Fast-moving products retrieved successfully")


@analytics_bp.route("/api/analytics/slow-moving", methods=["GET"])
def slow_moving_route():
    """Get least selling / dead stock products over past N days."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        limit = min(50, max(1, int(request.args.get("limit", 10))))
        days = min(365, max(1, int(request.args.get("days", 30))))
    except ValueError:
        limit = 10
        days = 30

    slow_moving = get_slow_moving_products(store_id, limit=limit, days=days)
    return success_response(data=slow_moving, message="Slow-moving products retrieved successfully")


@analytics_bp.route("/api/analytics/sales-trends", methods=["GET"])
def sales_trends_route():
    """Get revenue and order count trends over time."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    timeframe = request.args.get("timeframe", "daily")
    try:
        days = min(365, max(1, int(request.args.get("days", 30))))
    except ValueError:
        days = 30

    trends = get_sales_trends(store_id, timeframe=timeframe, days=days)
    return success_response(data=trends, message="Sales trends retrieved successfully")


@analytics_bp.route("/api/analytics/inventory-value", methods=["GET"])
def inventory_value_by_category_route():
    """Get inventory valuation grouped by product category."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    valuation = get_inventory_value_by_category(store_id)
    return success_response(data=valuation, message="Inventory valuation by category retrieved successfully")

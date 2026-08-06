"""
Dashboard API routes blueprint.
Handles real-time summary stats, expiry alerts, low stock alerts, and recent sales.
"""

from flask import Blueprint, request
from app.utils import success_response, error_response, get_request_store_id
from app.services import (
    get_dashboard_summary,
    get_expiry_alerts,
    get_low_stock_alerts,
    get_recent_sales,
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/dashboard/summary", methods=["GET"])
def dashboard_summary_route():
    """Get real-time dashboard summary metrics."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    summary = get_dashboard_summary(store_id)
    return success_response(data=summary, message="Dashboard summary retrieved successfully")


@dashboard_bp.route("/api/dashboard/expiry-alerts", methods=["GET"])
def expiry_alerts_route():
    """Get expiring stock batches categorized by 7/3/1 days urgency."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        days = int(request.args.get("days", 7))
    except ValueError:
        days = 7

    alerts = get_expiry_alerts(store_id, days=days)
    return success_response(data=alerts, message="Expiry alerts retrieved successfully")


@dashboard_bp.route("/api/dashboard/low-stock-alerts", methods=["GET"])
def low_stock_alerts_route():
    """Get list of products with current stock at or below low_stock_threshold."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    alerts = get_low_stock_alerts(store_id)
    return success_response(data=alerts, message="Low stock alerts retrieved successfully")


@dashboard_bp.route("/api/dashboard/recent-sales", methods=["GET"])
def recent_sales_route():
    """Get last N recent sales."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        limit = min(50, max(1, int(request.args.get("limit", 5))))
    except ValueError:
        limit = 5

    sales = get_recent_sales(store_id, limit=limit)
    return success_response(data=sales, message="Recent sales retrieved successfully")

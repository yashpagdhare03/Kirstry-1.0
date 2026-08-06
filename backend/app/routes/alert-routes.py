"""
Alerts & Notifications API routes blueprint.
Handles alert generation, listing, filtering, marking as read, and unread badge counts.
"""

from flask import Blueprint, request
from app.utils import success_response, error_response, get_request_store_id
from app.services import (
    generate_store_alerts,
    get_alerts,
    mark_alert_read,
    mark_all_alerts_read,
    get_unread_count,
)

alert_bp = Blueprint("alert", __name__)


@alert_bp.route("/api/alerts/generate", methods=["POST"])
def generate_alerts_route():
    """Trigger automated scan to generate deduplicated expiry and low stock alerts."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        res = generate_store_alerts(store_id)
        return success_response(data=res, message="Alert scan completed successfully")
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@alert_bp.route("/api/alerts", methods=["GET"])
def list_alerts_route():
    """List store alerts with filters (type, severity, read status)."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    type_filter = request.args.get("type")
    severity_filter = request.args.get("severity")
    is_read_param = request.args.get("is_read")
    is_read = None
    if is_read_param is not None:
        is_read = True if is_read_param.lower() == "true" else (False if is_read_param.lower() == "false" else None)

    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_alerts(
        store_id=store_id,
        type_filter=type_filter,
        severity_filter=severity_filter,
        is_read=is_read,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Alerts retrieved successfully")


@alert_bp.route("/api/alerts/<alert_id>/read", methods=["PUT"])
def mark_read_route(alert_id: str):
    """Mark a single alert as read."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    alert = mark_alert_read(store_id, alert_id)
    if not alert:
        return error_response("Alert not found", status_code=404)

    return success_response(data=alert, message="Alert marked as read")


@alert_bp.route("/api/alerts/read-all", methods=["PUT"])
def mark_all_read_route():
    """Mark all unread alerts for store as read."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    updated_count = mark_all_alerts_read(store_id)
    return success_response(data={"updated_count": updated_count}, message="All alerts marked as read")


@alert_bp.route("/api/alerts/unread-count", methods=["GET"])
def unread_count_route():
    """Get total unread alert count for badge counter."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    count = get_unread_count(store_id)
    return success_response(data={"unread_count": count}, message="Unread count retrieved successfully")

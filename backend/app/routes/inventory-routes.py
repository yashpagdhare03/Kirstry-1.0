"""
Inventory and Stock Management API routes blueprint.
Handles stock-in, stock-out, physical count adjustments, stock level views, and transaction history.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.utils import success_response, error_response, get_request_store_id
from app.schemas import StockInSchema, StockOutSchema, AdjustmentSchema
from app.services import (
    record_stock_in,
    record_stock_out,
    record_adjustment,
    get_stock_levels,
    get_transactions,
    get_batches,
)

inventory_bp = Blueprint("inventory", __name__)


@inventory_bp.route("/api/inventory/stock-in", methods=["POST"])
def stock_in_route():
    """Record batch purchase and append stock_in transaction."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = StockInSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        result = record_stock_in(store_id, schema.model_dump())
        return success_response(data=result, message="Stock-in recorded successfully", status_code=201)
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@inventory_bp.route("/api/inventory/stock-out", methods=["POST"])
def stock_out_route():
    """Record stock removal using FIFO logic across active batches."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = StockOutSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        result = record_stock_out(store_id, schema.model_dump())
        return success_response(data=result, message="Stock-out recorded successfully", status_code=200)
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@inventory_bp.route("/api/inventory/adjustment", methods=["POST"])
def adjustment_route():
    """Reconcile physical inventory count for a batch."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = AdjustmentSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        result = record_adjustment(store_id, schema.model_dump())
        return success_response(data=result, message="Stock adjustment recorded successfully", status_code=200)
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@inventory_bp.route("/api/inventory/stock-levels", methods=["GET"])
def stock_levels_route():
    """Get current stock levels for all products with calculated status (ok/low/out)."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    status_filter = request.args.get("status")
    search = request.args.get("search")
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_stock_levels(
        store_id=store_id,
        status_filter=status_filter,
        search=search,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Stock levels retrieved successfully")


@inventory_bp.route("/api/inventory/transactions", methods=["GET"])
def transactions_route():
    """Get audit trail of stock transactions ordered by created_at DESC."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    product_id = request.args.get("product_id")
    type_filter = request.args.get("type")
    reason_filter = request.args.get("reason")
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_transactions(
        store_id=store_id,
        product_id=product_id,
        type_filter=type_filter,
        reason_filter=reason_filter,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Transaction history retrieved successfully")


@inventory_bp.route("/api/inventory/batches/<product_id>", methods=["GET"])
def batches_route(product_id: str):
    """List active stock batches for a product."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    batches = get_batches(store_id, product_id)
    return success_response(data=batches, message="Product batches retrieved successfully")

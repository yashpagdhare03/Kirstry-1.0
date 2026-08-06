"""
Supplier Management & Purchase Order API routes blueprint.
Handles supplier directory, purchase order lifecycle workflow, active PO checks, and WhatsApp sharing.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.utils import success_response, error_response, get_request_store_id
from app.schemas import (
    CreateSupplierSchema,
    UpdateSupplierSchema,
    CreatePOSchema,
    UpdatePOSchema,
)
from app.services import (
    create_supplier,
    get_suppliers,
    get_supplier_by_id,
    update_supplier,
    delete_supplier,
    create_purchase_order,
    get_purchase_orders,
    get_po_by_id,
    update_purchase_order,
    delete_purchase_order,
    get_po_whatsapp_share_link,
)

supplier_bp = Blueprint("supplier", __name__)


# ----------------------------------------------------
# Supplier Directory Endpoints
# ----------------------------------------------------

@supplier_bp.route("/api/suppliers", methods=["POST"])
def create_supplier_route():
    """Create a new supplier for store."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = CreateSupplierSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        supplier = create_supplier(store_id, schema.model_dump())
        return success_response(data=supplier, message="Supplier created successfully", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@supplier_bp.route("/api/suppliers", methods=["GET"])
def list_suppliers_route():
    """List suppliers for store with search and pagination."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    search = request.args.get("search")
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_suppliers(
        store_id=store_id,
        search=search,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Suppliers retrieved successfully")


@supplier_bp.route("/api/suppliers/<supplier_id>", methods=["GET"])
def get_supplier_route(supplier_id: str):
    """Get single supplier details with purchase order history."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    supplier = get_supplier_by_id(store_id, supplier_id)
    if not supplier:
        return error_response("Supplier not found", status_code=404)

    return success_response(data=supplier, message="Supplier details retrieved successfully")


@supplier_bp.route("/api/suppliers/<supplier_id>", methods=["PUT"])
def update_supplier_route(supplier_id: str):
    """Update supplier information."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = UpdateSupplierSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    updated = update_supplier(store_id, supplier_id, schema.model_dump(exclude_unset=True))
    if not updated:
        return error_response("Supplier not found", status_code=404)

    return success_response(data=updated, message="Supplier updated successfully")


@supplier_bp.route("/api/suppliers/<supplier_id>", methods=["DELETE"])
def delete_supplier_route(supplier_id: str):
    """Delete supplier. Fails with 409 Conflict if active POs exist."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        deleted = delete_supplier(store_id, supplier_id)
        if not deleted:
            return error_response("Supplier not found", status_code=404)
        return success_response(data={"id": supplier_id}, message="Supplier deleted successfully")
    except ValueError as e:
        return error_response(message=str(e), status_code=409)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


# ----------------------------------------------------
# Purchase Order Workflow Endpoints
# ----------------------------------------------------

@supplier_bp.route("/api/purchase-orders", methods=["POST"])
def create_po_route():
    """Create a new purchase order in draft status."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = CreatePOSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        po = create_purchase_order(store_id, schema.model_dump())
        return success_response(data=po, message="Purchase order created successfully", status_code=201)
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@supplier_bp.route("/api/purchase-orders", methods=["GET"])
def list_pos_route():
    """List purchase orders with status and supplier filters."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    supplier_id = request.args.get("supplier_id")
    status_filter = request.args.get("status")
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_purchase_orders(
        store_id=store_id,
        supplier_id=supplier_id,
        status_filter=status_filter,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Purchase orders retrieved successfully")


@supplier_bp.route("/api/purchase-orders/<po_id>", methods=["GET"])
def get_po_route(po_id: str):
    """Get single purchase order details."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    po = get_po_by_id(store_id, po_id)
    if not po:
        return error_response("Purchase order not found", status_code=404)

    return success_response(data=po, message="Purchase order details retrieved successfully")


@supplier_bp.route("/api/purchase-orders/<po_id>", methods=["PUT"])
def update_po_route(po_id: str):
    """Update purchase order status and/or items enforcing state machine transitions."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = UpdatePOSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        updated = update_purchase_order(store_id, po_id, schema.model_dump(exclude_unset=True))
        if not updated:
            return error_response("Purchase order not found", status_code=404)
        return success_response(data=updated, message="Purchase order updated successfully")
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@supplier_bp.route("/api/purchase-orders/<po_id>", methods=["DELETE"])
def delete_po_route(po_id: str):
    """Delete draft purchase order."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        deleted = delete_purchase_order(store_id, po_id)
        if not deleted:
            return error_response("Purchase order not found", status_code=404)
        return success_response(data={"id": po_id}, message="Purchase order deleted successfully")
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@supplier_bp.route("/api/purchase-orders/<po_id>/share", methods=["GET"])
def share_po_route(po_id: str):
    """Get WhatsApp share link for purchase order."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        whatsapp_url = get_po_whatsapp_share_link(store_id, po_id)
        return success_response(data={"whatsapp_url": whatsapp_url}, message="WhatsApp share link generated successfully")
    except ValueError as e:
        return error_response(message=str(e), status_code=404)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

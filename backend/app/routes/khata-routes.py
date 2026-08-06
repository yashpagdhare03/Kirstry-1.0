"""
Digital Khata API routes blueprint.
Handles customer directory, credit entries (udhari), payment collections, outstanding balances, and summary stats.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.utils import success_response, error_response, get_request_store_id
from app.schemas import (
    CreateCustomerSchema,
    UpdateCustomerSchema,
    CreditEntrySchema,
    PaymentEntrySchema,
)
from app.services import (
    create_customer,
    get_customers,
    get_customer_by_id,
    update_customer,
    record_credit,
    record_payment,
    get_outstanding_customers,
    get_khata_summary,
)

khata_bp = Blueprint("khata", __name__)


# ----------------------------------------------------
# Customer Directory Endpoints
# ----------------------------------------------------

@khata_bp.route("/api/customers", methods=["POST"])
def create_customer_route():
    """Add a new customer to store."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = CreateCustomerSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        customer = create_customer(store_id, schema.model_dump())
        return success_response(data=customer, message="Customer created successfully", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@khata_bp.route("/api/customers", methods=["GET"])
def list_customers_route():
    """List customers for store with calculated outstanding balance."""
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

    result = get_customers(
        store_id=store_id,
        search=search,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Customers retrieved successfully")


@khata_bp.route("/api/customers/<customer_id>", methods=["GET"])
def get_customer_route(customer_id: str):
    """Get single customer details + credit/payment ledger history."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    customer = get_customer_by_id(store_id, customer_id)
    if not customer:
        return error_response("Customer not found", status_code=404)

    return success_response(data=customer, message="Customer details retrieved successfully")


@khata_bp.route("/api/customers/<customer_id>", methods=["PUT"])
def update_customer_route(customer_id: str):
    """Update customer info."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = UpdateCustomerSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    updated = update_customer(store_id, customer_id, schema.model_dump(exclude_unset=True))
    if not updated:
        return error_response("Customer not found", status_code=404)

    return success_response(data=updated, message="Customer updated successfully")


# ----------------------------------------------------
# Khata Credit & Payment Ledger Endpoints
# ----------------------------------------------------

@khata_bp.route("/api/khata/credit", methods=["POST"])
def record_credit_route():
    """Record credit entry (udhari) for customer."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = CreditEntrySchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        result = record_credit(store_id, schema.model_dump())
        return success_response(data=result, message="Credit entry recorded successfully", status_code=201)
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@khata_bp.route("/api/khata/payment", methods=["POST"])
def record_payment_route():
    """Record payment collected from customer."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = PaymentEntrySchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        result = record_payment(store_id, schema.model_dump())
        return success_response(data=result, message="Payment entry recorded successfully", status_code=201)
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@khata_bp.route("/api/khata/outstanding", methods=["GET"])
def list_outstanding_route():
    """List all customers with positive balance sorted by balance descending."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_outstanding_customers(store_id=store_id, page=page, per_page=per_page)
    return success_response(data=result, message="Outstanding customers retrieved successfully")


@khata_bp.route("/api/khata/summary", methods=["GET"])
def khata_summary_route():
    """Aggregate credit statistics for store."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    summary = get_khata_summary(store_id)
    return success_response(data=summary, message="Khata summary retrieved successfully")

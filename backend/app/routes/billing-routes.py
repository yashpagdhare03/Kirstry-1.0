"""
Billing and Invoice API routes blueprint.
Handles POS bill creation, sales history, daily summaries, ReportLab invoice PDFs, and WhatsApp sharing.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.utils import success_response, error_response, get_request_store_id
from app.schemas import CreateBillSchema
from app.services import (
    create_bill,
    get_sales,
    get_sale_by_id,
    get_daily_summary,
    generate_invoice_for_sale,
    get_whatsapp_share_link,
)

billing_bp = Blueprint("billing", __name__)


@billing_bp.route("/api/billing/create", methods=["POST"])
def create_bill_route():
    """Create POS sale bill with atomic FIFO stock deduction."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = CreateBillSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        sale = create_bill(store_id, schema.model_dump())
        return success_response(data=sale, message="Bill created successfully", status_code=201)
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@billing_bp.route("/api/billing/sales", methods=["GET"])
def list_sales_route():
    """List historical sales for store with filters and pagination."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    payment_mode = request.args.get("payment_mode")
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_sales(
        store_id=store_id,
        date_from=date_from,
        date_to=date_to,
        payment_mode=payment_mode,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Sales history retrieved successfully")


@billing_bp.route("/api/billing/sales/<sale_id>", methods=["GET"])
def get_sale_route(sale_id: str):
    """Get single sale details with line items."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    sale = get_sale_by_id(store_id, sale_id)
    if not sale:
        return error_response("Sale not found", status_code=404)

    return success_response(data=sale, message="Sale details retrieved successfully")


@billing_bp.route("/api/billing/daily-summary", methods=["GET"])
def daily_summary_route():
    """Get daily sales aggregate summary."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    target_date = request.args.get("date")
    summary = get_daily_summary(store_id, target_date)
    return success_response(data=summary, message="Daily summary retrieved successfully")


@billing_bp.route("/api/billing/invoice/<sale_id>/generate", methods=["POST"])
def generate_invoice_route(sale_id: str):
    """Generate and upload ReportLab PDF invoice for sale."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        invoice_url = generate_invoice_for_sale(store_id, sale_id)
        return success_response(data={"invoice_url": invoice_url}, message="Invoice PDF generated successfully")
    except ValueError as e:
        return error_response(message=str(e), status_code=404)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@billing_bp.route("/api/billing/invoice/<sale_id>/share", methods=["GET"])
def share_invoice_route(sale_id: str):
    """Get formatted WhatsApp share link for sale invoice."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        whatsapp_url = get_whatsapp_share_link(store_id, sale_id)
        return success_response(data={"whatsapp_url": whatsapp_url}, message="WhatsApp share link generated successfully")
    except ValueError as e:
        return error_response(message=str(e), status_code=404)
    except Exception as e:
        return error_response(message=str(e), status_code=500)

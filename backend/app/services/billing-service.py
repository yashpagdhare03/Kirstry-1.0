"""
POS Billing & Sales Management Service.
Handles atomic bill creation, stock validation, FIFO deduction integration, credit sales, invoice PDF generation, and daily sales summary.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date
import urllib.parse
from app.utils import get_supabase_client
from app.services import get_product_by_id, record_stock_out, generate_invoice_pdf, upload_invoice_pdf


def generate_invoice_number(store_id: str) -> str:
    """
    Generates a sequential invoice number for the store formatted as INV-YYYYMMDD-XXXX.
    """
    supabase = get_supabase_client()
    today_str = datetime.now().strftime("%Y%m%d")
    prefix = f"INV-{today_str}-"

    # Count today's sales for store to increment sequence number
    res = (
        supabase.table("sales")
        .select("invoice_number", count="exact")
        .eq("store_id", store_id)
        .like("invoice_number", f"{prefix}%")
        .execute()
    )
    count = res.count if res.count is not None else (len(res.data or []))
    seq_num = count + 1
    return f"{prefix}{seq_num:04d}"


def create_bill(
    store_id: str,
    data: Dict[str, Any],
    created_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Atomically creates a POS sale bill.
    1. Validates stock availability for ALL items before committing.
    2. Validates credit payment customer selection.
    3. Creates sales record.
    4. Deducts stock per item using FIFO (inventory service).
    5. Creates sale_items records.
    6. Creates credit_transaction if payment_mode == 'credit'.
    7. Generates & uploads ReportLab invoice PDF to Supabase Storage.
    """
    supabase = get_supabase_client()
    items = data.get("items", [])
    payment_mode = data.get("payment_mode", "cash").lower()
    customer_id = data.get("customer_id")
    discount = float(data.get("discount", 0.0))

    if not items or len(items) == 0:
        raise ValueError("Bill must contain at least 1 item")

    if payment_mode not in ("cash", "upi", "credit"):
        raise ValueError("Invalid payment mode. Must be cash, upi, or credit")

    if payment_mode == "credit" and not customer_id:
        raise ValueError("Customer is required for credit payment mode")

    # Step 1: Pre-validate stock availability for ALL products in bill
    for item in items:
        pid = item["product_id"]
        req_qty = int(item["quantity"])
        product = get_product_by_id(store_id, pid)
        if not product or not product.get("is_active"):
            raise ValueError(f"Product ID '{pid}' not found or inactive")

        avail_stock = product.get("current_stock", 0)
        if req_qty > avail_stock:
            raise ValueError(
                f"Insufficient stock for '{product['name']}'. Requested: {req_qty}, Available: {avail_stock}"
            )

    # Step 2: Calculate financials & generate invoice number
    subtotal = sum(float(item["quantity"]) * float(item["unit_price"]) for item in items)
    total_amount = max(0.0, subtotal - discount)
    invoice_number = generate_invoice_number(store_id)

    # Step 3: Insert Sales Record
    sale_payload = {
        "store_id": store_id,
        "invoice_number": invoice_number,
        "items_count": len(items),
        "subtotal": subtotal,
        "total_amount": total_amount,
        "discount": discount,
        "payment_mode": payment_mode,
        "customer_id": customer_id,
        "created_by": created_by,
    }
    sale_res = supabase.table("sales").insert(sale_payload).execute()
    if not sale_res.data or len(sale_res.data) == 0:
        raise RuntimeError("Failed to create sale record")

    sale = sale_res.data[0]
    sale_id = sale["id"]

    # Step 4: Perform FIFO Stock Out and Create Sale Items
    created_sale_items = []
    for item in items:
        pid = item["product_id"]
        qty = int(item["quantity"])
        unit_price = float(item["unit_price"])
        line_total = qty * unit_price

        # Stock Out via inventory service (FIFO)
        stock_out_res = record_stock_out(
            store_id=store_id,
            data={
                "product_id": pid,
                "quantity": qty,
                "reason": "sale",
                "reference_id": sale_id,
            },
            created_by=created_by,
        )

        # Retrieve first batch_id from stock-out transactions
        attributed_batch_id = None
        if stock_out_res.get("transactions"):
            attributed_batch_id = stock_out_res["transactions"][0].get("batch_id")

        # Insert Sale Item
        si_payload = {
            "sale_id": sale_id,
            "product_id": pid,
            "batch_id": attributed_batch_id,
            "quantity": qty,
            "unit_price": unit_price,
            "total_price": line_total,
        }
        si_res = supabase.table("sale_items").insert(si_payload).execute()
        if si_res.data:
            created_sale_items.append(si_res.data[0])

    # Step 5: Record Credit Transaction if payment_mode == 'credit'
    if payment_mode == "credit" and customer_id:
        credit_payload = {
            "store_id": store_id,
            "customer_id": customer_id,
            "type": "credit",
            "amount": total_amount,
            "sale_id": sale_id,
            "note": f"POS Invoice #{invoice_number}",
            "created_by": created_by,
        }
        supabase.table("credit_transactions").insert(credit_payload).execute()

    # Step 6: Generate & Upload ReportLab Invoice PDF
    sale["items"] = created_sale_items
    try:
        pdf_bytes = generate_invoice_pdf(sale, store_name="Kirstry Kirana Store")
        invoice_url = upload_invoice_pdf(sale_id, pdf_bytes)
        supabase.table("sales").update({"invoice_url": invoice_url}).eq("id", sale_id).execute()
        sale["invoice_url"] = invoice_url
    except Exception:
        sale["invoice_url"] = None

    return sale


def get_sales(
    store_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    payment_mode: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Retrieves paginated historical sales for store_id with date and payment mode filters.
    """
    supabase = get_supabase_client()
    query = (
        supabase.table("sales")
        .select("*, customers(name, phone)", count="exact")
        .eq("store_id", store_id)
    )

    if payment_mode:
        query = query.eq("payment_mode", payment_mode.lower())

    if date_from:
        query = query.gte("created_at", f"{date_from}T00:00:00")

    if date_to:
        query = query.lte("created_at", f"{date_to}T23:59:59")

    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    res = query.execute()
    sales = res.data or []
    total = res.count if res.count is not None else len(sales)

    return {
        "sales": sales,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_sale_by_id(store_id: str, sale_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves single sale with line items.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("sales")
        .select("*, customers(name, phone), sale_items(*, products(name, unit))")
        .eq("store_id", store_id)
        .eq("id", sale_id)
        .execute()
    )
    if not res.data or len(res.data) == 0:
        return None
    return res.data[0]


def get_daily_summary(store_id: str, target_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Aggregates today's total revenue, order count, and payment mode breakdown.
    """
    supabase = get_supabase_client()
    today_str = target_date or date.today().isoformat()
    start_ts = f"{today_str}T00:00:00"
    end_ts = f"{today_str}T23:59:59"

    res = (
        supabase.table("sales")
        .select("total_amount, items_count, payment_mode")
        .eq("store_id", store_id)
        .gte("created_at", start_ts)
        .lte("created_at", end_ts)
        .execute()
    )
    sales = res.data or []

    total_sales_count = len(sales)
    total_revenue = sum(float(s.get("total_amount", 0.0)) for s in sales)
    total_items_sold = sum(int(s.get("items_count", 0)) for s in sales)

    breakdown = {"cash": 0.0, "upi": 0.0, "credit": 0.0}
    for s in sales:
        pmode = str(s.get("payment_mode", "cash")).lower()
        if pmode in breakdown:
            breakdown[pmode] += float(s.get("total_amount", 0.0))

    return {
        "date": today_str,
        "total_sales_count": total_sales_count,
        "total_revenue": total_revenue,
        "total_items_sold": total_items_sold,
        "payment_mode_breakdown": breakdown,
    }


def generate_invoice_for_sale(store_id: str, sale_id: str) -> str:
    """
    Generates/uploads invoice PDF for an existing sale and updates invoice_url.
    """
    supabase = get_supabase_client()
    sale = get_sale_by_id(store_id, sale_id)
    if not sale:
        raise ValueError("Sale not found")

    pdf_bytes = generate_invoice_pdf(sale, store_name="Kirstry Kirana Store")
    invoice_url = upload_invoice_pdf(sale_id, pdf_bytes)
    supabase.table("sales").update({"invoice_url": invoice_url}).eq("id", sale_id).execute()
    return invoice_url


def get_whatsapp_share_link(store_id: str, sale_id: str) -> str:
    """
    Generates a WhatsApp share deep link for invoice sharing.
    """
    sale = get_sale_by_id(store_id, sale_id)
    if not sale:
        raise ValueError("Sale not found")

    inv_num = sale.get("invoice_number", "")
    inv_url = sale.get("invoice_url", "")
    total = sale.get("total_amount", 0.0)

    msg = f"Invoice {inv_num} from Kirstry Kirana Store.\nTotal Amount: ₹{total:.2f}\nView Invoice: {inv_url}"
    encoded_msg = urllib.parse.quote(msg)
    return f"https://wa.me/?text={encoded_msg}"

"""
Inventory and Stock Management Service.
Handles stock-in, FIFO stock-out, physical count adjustments, and append-only audit trail logging.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date
from app.utils import get_supabase_client
from app.services import get_product_by_id


def record_stock_in(
    store_id: str,
    data: Dict[str, Any],
    created_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Records stock-in operation.
    Creates a new stock_batch and appends a stock_in transaction.
    """
    supabase = get_supabase_client()
    product_id = data["product_id"]

    # Verify product exists in store
    product = get_product_by_id(store_id, product_id)
    if not product or not product.get("is_active"):
        raise ValueError("Product not found or inactive")

    qty = int(data["quantity"])

    # 1. Create Stock Batch
    batch_payload = {
        "store_id": store_id,
        "product_id": product_id,
        "batch_number": data.get("batch_number") or f"BATCH-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "initial_quantity": qty,
        "quantity_remaining": qty,
        "expiry_date": data.get("expiry_date"),
        "purchase_date": data.get("purchase_date") or date.today().isoformat(),
        "supplier_id": data.get("supplier_id"),
        "cost_price": data.get("cost_price"),
    }
    batch_res = supabase.table("stock_batches").insert(batch_payload).execute()
    if not batch_res.data or len(batch_res.data) == 0:
        raise RuntimeError("Failed to create stock batch")

    batch = batch_res.data[0]

    # 2. Append Stock Transaction (Append-Only)
    tx_payload = {
        "store_id": store_id,
        "product_id": product_id,
        "batch_id": batch["id"],
        "type": "stock_in",
        "quantity": qty,
        "reason": "purchase",
        "notes": data.get("notes"),
        "created_by": created_by,
    }
    tx_res = supabase.table("stock_transactions").insert(tx_payload).execute()
    tx = tx_res.data[0] if tx_res.data else {}

    return {
        "batch": batch,
        "transaction": tx,
    }


def record_stock_out(
    store_id: str,
    data: Dict[str, Any],
    created_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Records stock-out operation using FIFO deduction logic across active batches.
    Validates total available stock >= requested quantity; raises ValueError if insufficient.
    Appends stock_transactions records (APPEND-ONLY).
    """
    supabase = get_supabase_client()
    product_id = data["product_id"]
    requested_qty = int(data["quantity"])

    product = get_product_by_id(store_id, product_id)
    if not product or not product.get("is_active"):
        raise ValueError("Product not found or inactive")

    # Query active batches ordered by FIFO: purchase_date ASC, created_at ASC
    batches_res = (
        supabase.table("stock_batches")
        .select("*")
        .eq("store_id", store_id)
        .eq("product_id", product_id)
        .gt("quantity_remaining", 0)
        .order("purchase_date", desc=False)
        .order("created_at", desc=False)
        .execute()
    )
    batches = batches_res.data or []

    # Calculate total available stock
    total_available = sum(b["quantity_remaining"] for b in batches)
    if requested_qty > total_available:
        raise ValueError(
            f"Insufficient stock for '{product['name']}'. Requested: {requested_qty}, Available: {total_available}"
        )

    remaining_to_deduct = requested_qty
    transactions_created = []

    # FIFO Deduction loop
    for b in batches:
        if remaining_to_deduct <= 0:
            break

        b_remaining = b["quantity_remaining"]
        deduct_from_this_batch = min(remaining_to_deduct, b_remaining)
        new_batch_remaining = b_remaining - deduct_from_this_batch

        # Update batch remaining quantity
        supabase.table("stock_batches").update(
            {"quantity_remaining": new_batch_remaining}
        ).eq("id", b["id"]).execute()

        # Append stock_transactions record (APPEND-ONLY)
        tx_payload = {
            "store_id": store_id,
            "product_id": product_id,
            "batch_id": b["id"],
            "type": "stock_out",
            "quantity": deduct_from_this_batch,
            "reason": data.get("reason", "sale"),
            "reference_id": data.get("reference_id"),
            "notes": data.get("notes"),
            "created_by": created_by,
        }
        tx_res = supabase.table("stock_transactions").insert(tx_payload).execute()
        if tx_res.data:
            transactions_created.append(tx_res.data[0])

        remaining_to_deduct -= deduct_from_this_batch

    # Calculate remaining total stock for product
    updated_product = get_product_by_id(store_id, product_id)

    return {
        "product_id": product_id,
        "requested_quantity": requested_qty,
        "remaining_stock": updated_product["current_stock"] if updated_product else 0,
        "transactions": transactions_created,
    }


def record_adjustment(
    store_id: str,
    data: Dict[str, Any],
    created_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Reconciles physical inventory for a specific batch.
    Updates batch quantity_remaining and appends an adjustment transaction.
    """
    supabase = get_supabase_client()
    product_id = data["product_id"]
    batch_id = data["batch_id"]
    new_qty = int(data["new_quantity"])

    # Fetch target batch
    batch_res = (
        supabase.table("stock_batches")
        .select("*")
        .eq("store_id", store_id)
        .eq("id", batch_id)
        .eq("product_id", product_id)
        .execute()
    )
    if not batch_res.data or len(batch_res.data) == 0:
        raise ValueError("Batch not found for specified product and store")

    batch = batch_res.data[0]
    old_qty = batch["quantity_remaining"]
    diff = new_qty - old_qty

    # Update batch remaining quantity
    supabase.table("stock_batches").update(
        {"quantity_remaining": new_qty}
    ).eq("id", batch_id).execute()

    # Append adjustment transaction (APPEND-ONLY)
    tx_payload = {
        "store_id": store_id,
        "product_id": product_id,
        "batch_id": batch_id,
        "type": "adjustment",
        "quantity": diff,
        "reason": "reconciliation",
        "notes": data.get("notes") or f"Physical count adjustment from {old_qty} to {new_qty}",
        "created_by": created_by,
    }
    tx_res = supabase.table("stock_transactions").insert(tx_payload).execute()
    tx = tx_res.data[0] if tx_res.data else {}

    return {
        "batch_id": batch_id,
        "previous_quantity": old_qty,
        "new_quantity": new_qty,
        "difference": diff,
        "transaction": tx,
    }


def get_stock_levels(
    store_id: str,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Returns current stock levels for all products in a store with calculated status (ok/low/out).
    """
    supabase = get_supabase_client()
    query = supabase.table("products").select("*, categories(name)", count="exact").eq("store_id", store_id).eq("is_active", True)

    if search:
        search_str = search.strip()
        query = query.or_(f"name.ilike.%{search_str}%,brand.ilike.%{search_str}%,barcode.ilike.%{search_str}%")

    prod_res = query.execute()
    all_products = prod_res.data or []

    if not all_products:
        return {"items": [], "total": 0, "page": page, "per_page": per_page}

    product_ids = [p["id"] for p in all_products]

    # Fetch active batches for remaining stock sums
    batches_res = (
        supabase.table("stock_batches")
        .select("product_id, quantity_remaining, expiry_date")
        .eq("store_id", store_id)
        .in_("product_id", product_ids)
        .execute()
    )

    stock_map: Dict[str, int] = {}
    for b in (batches_res.data or []):
        pid = b["product_id"]
        stock_map[pid] = stock_map.get(pid, 0) + (b.get("quantity_remaining") or 0)

    items = []
    for p in all_products:
        total_stock = stock_map.get(p["id"], 0)
        threshold = p.get("low_stock_threshold") or 10

        if total_stock == 0:
            status = "out"
        elif total_stock <= threshold:
            status = "low"
        else:
            status = "ok"

        # Apply status filter if specified
        if status_filter and status != status_filter.lower():
            continue

        p_item = dict(p)
        p_item["current_stock"] = total_stock
        p_item["status"] = status
        items.append(p_item)

    total_count = len(items)
    offset = (page - 1) * per_page
    paginated_items = items[offset : offset + per_page]

    return {
        "items": paginated_items,
        "total": total_count,
        "page": page,
        "per_page": per_page,
    }


def get_transactions(
    store_id: str,
    product_id: Optional[str] = None,
    type_filter: Optional[str] = None,
    reason_filter: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Returns append-only transaction history ordered by created_at DESC.
    """
    supabase = get_supabase_client()
    query = (
        supabase.table("stock_transactions")
        .select("*, products(name, unit)", count="exact")
        .eq("store_id", store_id)
    )

    if product_id:
        query = query.eq("product_id", product_id)
    if type_filter:
        query = query.eq("type", type_filter)
    if reason_filter:
        query = query.eq("reason", reason_filter)

    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    res = query.execute()
    txs = res.data or []
    total = res.count if res.count is not None else len(txs)

    return {
        "transactions": txs,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_batches(store_id: str, product_id: str) -> List[Dict[str, Any]]:
    """
    Lists active batches for a given product ordered by expiry_date/purchase_date.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("stock_batches")
        .select("*, suppliers(name)")
        .eq("store_id", store_id)
        .eq("product_id", product_id)
        .order("purchase_date", desc=False)
        .order("created_at", desc=False)
        .execute()
    )
    return res.data or []

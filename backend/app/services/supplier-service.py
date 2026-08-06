"""
Supplier Directory & Purchase Order Management Service.
Handles supplier CRUD, purchase order state machine workflow (draft -> sent -> received), active PO checks, and WhatsApp PO sharing links.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import urllib.parse
from app.utils import get_supabase_client


VALID_PO_STATUSES = {"draft", "sent", "received", "cancelled"}


def create_supplier(store_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates a new supplier record scoped by store_id.
    """
    supabase = get_supabase_client()
    payload = {
        "store_id": store_id,
        "name": data["name"].strip(),
        "phone": data.get("phone"),
        "items_supplied": data.get("items_supplied"),
    }
    res = supabase.table("suppliers").insert(payload).execute()
    if not res.data or len(res.data) == 0:
        raise RuntimeError("Failed to create supplier")
    return res.data[0]


def get_suppliers(
    store_id: str,
    search: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Lists suppliers for store_id with search and pagination.
    """
    supabase = get_supabase_client()
    query = supabase.table("suppliers").select("*", count="exact").eq("store_id", store_id)

    if search:
        search_str = search.strip()
        query = query.or_(f"name.ilike.%{search_str}%,phone.ilike.%{search_str}%,items_supplied.ilike.%{search_str}%")

    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    res = query.execute()
    suppliers = res.data or []
    total = res.count if res.count is not None else len(suppliers)

    return {
        "suppliers": suppliers,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_supplier_by_id(store_id: str, supplier_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves single supplier details with associated purchase order history.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("suppliers")
        .select("*")
        .eq("store_id", store_id)
        .eq("id", supplier_id)
        .execute()
    )
    if not res.data or len(res.data) == 0:
        return None

    supplier = res.data[0]

    # Fetch PO history for supplier
    po_res = (
        supabase.table("purchase_orders")
        .select("*")
        .eq("store_id", store_id)
        .eq("supplier_id", supplier_id)
        .order("created_at", desc=True)
        .execute()
    )
    supplier["purchase_orders"] = po_res.data or []

    return supplier


def update_supplier(store_id: str, supplier_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates supplier info scoped by store_id.
    """
    supabase = get_supabase_client()
    existing = get_supplier_by_id(store_id, supplier_id)
    if not existing:
        return None

    update_payload = {k: v for k, v in data.items() if v is not None}
    if not update_payload:
        return existing

    res = (
        supabase.table("suppliers")
        .update(update_payload)
        .eq("store_id", store_id)
        .eq("id", supplier_id)
        .execute()
    )
    if res.data and len(res.data) > 0:
        return res.data[0]
    return None


def delete_supplier(store_id: str, supplier_id: str) -> bool:
    """
    Deletes a supplier. Fails if active purchase orders ('draft' or 'sent') exist.
    """
    supabase = get_supabase_client()
    existing = get_supplier_by_id(store_id, supplier_id)
    if not existing:
        return False

    # Check for active POs in draft or sent status
    active_pos_res = (
        supabase.table("purchase_orders")
        .select("id", count="exact")
        .eq("store_id", store_id)
        .eq("supplier_id", supplier_id)
        .in_("status", ["draft", "sent"])
        .execute()
    )
    active_count = active_pos_res.count if active_pos_res.count is not None else len(active_pos_res.data or [])
    if active_count > 0:
        raise ValueError("Cannot delete supplier with active purchase orders. Cancel or complete existing POs first.")

    res = (
        supabase.table("suppliers")
        .delete()
        .eq("store_id", store_id)
        .eq("id", supplier_id)
        .execute()
    )
    return bool(res.data)


# ----------------------------------------------------
# Purchase Order Management
# ----------------------------------------------------

def generate_po_number(store_id: str) -> str:
    """
    Generates a PO number formatted as PO-YYYYMMDD-XXXX.
    """
    today_str = datetime.now().strftime("%Y%m%d")
    return f"PO-{today_str}-0001"


def create_purchase_order(
    store_id: str,
    data: Dict[str, Any],
    created_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates a new Purchase Order in 'draft' status.
    """
    supabase = get_supabase_client()
    supplier_id = data["supplier_id"]
    items = data.get("items", [])

    if not items or len(items) == 0:
        raise ValueError("Purchase order must contain at least 1 line item")

    # Verify supplier exists in store
    supplier = get_supplier_by_id(store_id, supplier_id)
    if not supplier:
        raise ValueError("Supplier not found for this store")

    total_amount = sum(
        float(item.get("quantity", 1)) * float(item.get("estimated_cost") or 0.0)
        for item in items
    )

    payload = {
        "store_id": store_id,
        "supplier_id": supplier_id,
        "status": "draft",
        "total_amount": total_amount,
        "items": items,
        "notes": data.get("notes"),
    }

    res = supabase.table("purchase_orders").insert(payload).execute()
    if not res.data or len(res.data) == 0:
        raise RuntimeError("Failed to create purchase order")

    po = res.data[0]
    po["po_number"] = f"PO-{str(po['id'])[:8].upper()}"
    po["suppliers"] = {"name": supplier["name"], "phone": supplier.get("phone")}
    return po


def get_purchase_orders(
    store_id: str,
    supplier_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Lists purchase orders for store_id with status and supplier filters.
    """
    supabase = get_supabase_client()
    query = (
        supabase.table("purchase_orders")
        .select("*, suppliers(name, phone)", count="exact")
        .eq("store_id", store_id)
    )

    if supplier_id:
        query = query.eq("supplier_id", supplier_id)

    if status_filter:
        query = query.eq("status", status_filter.lower())

    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    res = query.execute()
    pos = res.data or []
    for p in pos:
        p["po_number"] = f"PO-{str(p['id'])[:8].upper()}"

    total = res.count if res.count is not None else len(pos)

    return {
        "purchase_orders": pos,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_po_by_id(store_id: str, po_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves single purchase order details with supplier metadata.
    """
    supabase = get_supabase_client()
    res = (
        supabase.table("purchase_orders")
        .select("*, suppliers(name, phone)")
        .eq("store_id", store_id)
        .eq("id", po_id)
        .execute()
    )
    if not res.data or len(res.data) == 0:
        return None

    po = res.data[0]
    po["po_number"] = f"PO-{str(po['id'])[:8].upper()}"
    return po


def update_purchase_order(store_id: str, po_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates purchase order status and/or items enforcing state machine transitions.
    Transitions: draft -> sent -> received (or cancelled).
    """
    supabase = get_supabase_client()
    existing = get_po_by_id(store_id, po_id)
    if not existing:
        return None

    current_status = existing["status"]
    new_status = data.get("status", current_status).lower()

    if new_status not in VALID_PO_STATUSES:
        raise ValueError(f"Invalid PO status '{new_status}'. Must be one of: {VALID_PO_STATUSES}")

    # Enforce State Machine Transitions
    if current_status != new_status:
        if current_status in ("received", "cancelled"):
            raise ValueError(f"Cannot change status of a purchase order that is already '{current_status}'")
        if current_status == "draft" and new_status not in ("sent", "cancelled"):
            raise ValueError("Draft purchase order can only transition to 'sent' or 'cancelled'")
        if current_status == "sent" and new_status not in ("received", "cancelled"):
            raise ValueError("Sent purchase order can only transition to 'received' or 'cancelled'")

    # Items Update Constraint: Only permitted on draft POs
    update_payload = {}
    if "items" in data and data["items"] is not None:
        if current_status != "draft":
            raise ValueError("Line items can only be modified on purchase orders in 'draft' status")
        items = data["items"]
        total_amount = sum(
            float(item.get("quantity", 1)) * float(item.get("estimated_cost") or 0.0)
            for item in items
        )
        update_payload["items"] = items
        update_payload["total_amount"] = total_amount

    if new_status != current_status:
        update_payload["status"] = new_status

    if "notes" in data and data["notes"] is not None:
        update_payload["notes"] = data["notes"]

    if update_payload:
        res = (
            supabase.table("purchase_orders")
            .update(update_payload)
            .eq("store_id", store_id)
            .eq("id", po_id)
            .execute()
        )

    return get_po_by_id(store_id, po_id)


def delete_purchase_order(store_id: str, po_id: str) -> bool:
    """
    Deletes a purchase order. Only draft POs can be deleted.
    """
    supabase = get_supabase_client()
    existing = get_po_by_id(store_id, po_id)
    if not existing:
        return False

    if existing["status"] != "draft":
        raise ValueError("Only purchase orders in 'draft' status can be deleted")

    res = (
        supabase.table("purchase_orders")
        .delete()
        .eq("store_id", store_id)
        .eq("id", po_id)
        .execute()
    )
    return bool(res.data)


def get_po_whatsapp_share_link(store_id: str, po_id: str) -> str:
    """
    Generates a WhatsApp share URL for a purchase order.
    Formats order items and supplier phone number.
    """
    po = get_po_by_id(store_id, po_id)
    if not po:
        raise ValueError("Purchase order not found")

    supplier = po.get("suppliers") or {}
    supplier_phone = supplier.get("phone", "").replace("+", "").replace(" ", "").replace("-", "")
    po_num = po.get("po_number", "")
    total = po.get("total_amount", 0.0)
    items = po.get("items", [])

    item_lines = []
    for item in items:
        pname = item.get("product_name", "Item")
        qty = item.get("quantity", 1)
        cost = item.get("estimated_cost")
        cost_str = f" @ ₹{cost:.2f}" if cost else ""
        item_lines.append(f"- {pname} x {qty}{cost_str}")

    items_text = "\n".join(item_lines)
    msg = f"Purchase Order {po_num} from Kirstry Kirana Store:\n\n{items_text}\n\nTotal Estimated: ₹{total:.2f}"
    encoded_msg = urllib.parse.quote(msg)

    if supplier_phone:
        return f"https://wa.me/{supplier_phone}?text={encoded_msg}"
    return f"https://wa.me/?text={encoded_msg}"

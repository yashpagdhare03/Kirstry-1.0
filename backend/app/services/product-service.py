"""
Product and Category business logic service.
Executes database queries strictly scoped by store_id.
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import uuid
from app.utils import get_supabase_client


def create_category(store_id: str, name: str) -> Dict[str, Any]:
    """
    Creates a new product category scoped by store_id.
    """
    supabase = get_supabase_client()
    payload = {
        "store_id": store_id,
        "name": name.strip(),
    }
    response = supabase.table("categories").insert(payload).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    raise RuntimeError("Failed to create category")


def get_categories(store_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all categories for a given store_id.
    """
    supabase = get_supabase_client()
    response = (
        supabase.table("categories")
        .select("*")
        .eq("store_id", store_id)
        .order("name")
        .execute()
    )
    return response.data or []


def create_product(store_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates a new product scoped by store_id.
    """
    supabase = get_supabase_client()
    payload = {
        "store_id": store_id,
        "name": data["name"].strip(),
        "unit": data["unit"].strip(),
        "category_id": data.get("category_id"),
        "brand": data.get("brand"),
        "barcode": data.get("barcode"),
        "mrp": data.get("mrp"),
        "selling_price": data.get("selling_price"),
        "purchase_price": data.get("purchase_price"),
        "low_stock_threshold": data.get("low_stock_threshold", 10),
        "image_url": data.get("image_url"),
        "is_active": True,
    }
    response = supabase.table("products").insert(payload).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    raise RuntimeError("Failed to create product")


def get_products(
    store_id: str,
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    is_active: Optional[bool] = True,
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Lists products for a given store_id with search, category filtering, and pagination.
    """
    supabase = get_supabase_client()
    query = supabase.table("products").select("*, categories(name)", count="exact").eq("store_id", store_id)

    if is_active is not None:
        query = query.eq("is_active", is_active)

    if category_id:
        query = query.eq("category_id", category_id)

    if search:
        search_str = search.strip()
        query = query.or_(f"name.ilike.%{search_str}%,brand.ilike.%{search_str}%,barcode.ilike.%{search_str}%")

    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    response = query.execute()

    products = response.data or []
    total = response.count if response.count is not None else len(products)

    # Attach computed stock for each product
    if products:
        product_ids = [p["id"] for p in products]
        batch_resp = (
            supabase.table("stock_batches")
            .select("product_id, quantity_remaining")
            .eq("store_id", store_id)
            .in_("product_id", product_ids)
            .execute()
        )
        stock_map: Dict[str, int] = {}
        for b in batch_resp.data or []:
            pid = b["product_id"]
            stock_map[pid] = stock_map.get(pid, 0) + (b.get("quantity_remaining") or 0)

        for p in products:
            p["current_stock"] = stock_map.get(p["id"], 0)

    return {
        "products": products,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_product_by_id(store_id: str, product_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves single product details by id scoped by store_id.
    Includes calculated current_stock.
    """
    supabase = get_supabase_client()
    response = (
        supabase.table("products")
        .select("*, categories(name)")
        .eq("store_id", store_id)
        .eq("id", product_id)
        .execute()
    )

    if not response.data or len(response.data) == 0:
        return None

    product = response.data[0]

    # Calculate total remaining stock across active batches
    batch_resp = (
        supabase.table("stock_batches")
        .select("quantity_remaining")
        .eq("store_id", store_id)
        .eq("product_id", product_id)
        .execute()
    )
    current_stock = sum(b.get("quantity_remaining", 0) for b in (batch_resp.data or []))
    product["current_stock"] = current_stock

    return product


def update_product(store_id: str, product_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates product fields scoped by store_id.
    """
    supabase = get_supabase_client()
    # Ensure product exists and belongs to store
    existing = get_product_by_id(store_id, product_id)
    if not existing:
        return None

    update_payload = {k: v for k, v in data.items() if v is not None}
    update_payload["updated_at"] = datetime.now().isoformat()

    response = (
        supabase.table("products")
        .update(update_payload)
        .eq("store_id", store_id)
        .eq("id", product_id)
        .execute()
    )

    if response.data and len(response.data) > 0:
        return response.data[0]

    return None


def delete_product(store_id: str, product_id: str) -> bool:
    """
    Soft-deletes product (sets is_active = false) scoped by store_id.
    """
    supabase = get_supabase_client()
    existing = get_product_by_id(store_id, product_id)
    if not existing:
        return False

    update_payload = {
        "is_active": False,
        "updated_at": datetime.now().isoformat(),
    }
    response = (
        supabase.table("products")
        .update(update_payload)
        .eq("store_id", store_id)
        .eq("id", product_id)
        .execute()
    )
    return bool(response.data)


def upload_product_image_to_supabase(file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Uploads an image file to Supabase Storage bucket 'product-images' and returns the public URL.
    """
    supabase = get_supabase_client()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    unique_path = f"products/{uuid.uuid4().hex}.{ext}"

    res = supabase.storage.from_("product-images").upload(
        path=unique_path,
        file=file_bytes,
        file_options={"content-type": content_type}
    )

    public_url = supabase.storage.from_("product-images").get_public_url(unique_path)
    return public_url

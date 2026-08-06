"""
Product and Category API routes blueprint.
Handles request parsing, store_id validation, and schema validation.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.utils import success_response, error_response, get_request_store_id
from app.schemas import (
    CreateCategorySchema,
    CreateProductSchema,
    UpdateProductSchema,
    BarcodeLookupSchema,
)
from app.services import (
    create_category,
    get_categories,
    create_product,
    get_products,
    get_product_by_id,
    update_product,
    delete_product,
    lookup_barcode,
    upload_product_image_to_supabase,
)

product_bp = Blueprint("products", __name__)


# ----------------------------------------------------
# Category Endpoints
# ----------------------------------------------------

@product_bp.route("/api/categories", methods=["GET"])
def list_categories_route():
    """List all categories for store."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    categories = get_categories(store_id)
    return success_response(data=categories, message="Categories retrieved successfully")


@product_bp.route("/api/categories", methods=["POST"])
def create_category_route():
    """Create a new category."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = CreateCategorySchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        category = create_category(store_id, schema.name)
        return success_response(data=category, message="Category created successfully", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


# ----------------------------------------------------
# Product Endpoints
# ----------------------------------------------------

@product_bp.route("/api/products/barcode-lookup", methods=["GET", "POST"])
def barcode_lookup_route():
    """Lookup product details by barcode via Open Food Facts (GET or POST)."""
    barcode = None
    if request.method == "GET":
        barcode = request.args.get("barcode")
    else:
        json_data = request.get_json() or {}
        try:
            schema = BarcodeLookupSchema(**json_data)
            barcode = schema.barcode
        except ValidationError as err:
            return error_response(message="Validation error", status_code=400, data=err.errors())

    if not barcode:
        return error_response("Barcode query parameter required", status_code=400)

    data = lookup_barcode(barcode)
    return success_response(data=data, message="Barcode metadata retrieved successfully")


@product_bp.route("/api/products/upload-image", methods=["POST"])
def upload_standalone_image_route():
    """Upload product image file to Supabase Storage bucket and return public URL."""
    if "file" not in request.files:
        return error_response("Image file required in multipart/form-data as 'file'", status_code=400)

    file = request.files["file"]
    file_bytes = file.read()
    filename = file.filename or "image.jpg"
    content_type = file.content_type or "image/jpeg"

    try:
        image_url = upload_product_image_to_supabase(file_bytes, filename, content_type)
        return success_response(data={"image_url": image_url}, message="Image uploaded successfully")
    except Exception as e:
        return error_response(message=str(e), status_code=500)


@product_bp.route("/api/products", methods=["POST"])
def create_product_route():
    """Create a new product manually."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = CreateProductSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    try:
        product = create_product(store_id, schema.model_dump())
        return success_response(data=product, message="Product created successfully", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@product_bp.route("/api/products", methods=["GET"])
def list_products_route():
    """List products for store with search, filter, pagination."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    search = request.args.get("search")
    category_id = request.args.get("category_id")
    is_active_param = request.args.get("is_active", "true").lower()
    is_active = True if is_active_param == "true" else (False if is_active_param == "false" else None)

    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 20))))
    except ValueError:
        page = 1
        per_page = 20

    result = get_products(
        store_id=store_id,
        search=search,
        category_id=category_id,
        is_active=is_active,
        page=page,
        per_page=per_page,
    )
    return success_response(data=result, message="Products retrieved successfully")


@product_bp.route("/api/products/<product_id>", methods=["GET"])
def get_product_route(product_id: str):
    """Get single product with computed current stock."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    product = get_product_by_id(store_id, product_id)
    if not product:
        return error_response("Product not found", status_code=404)

    return success_response(data=product, message="Product retrieved successfully")


@product_bp.route("/api/products/<product_id>", methods=["PUT"])
def update_product_route(product_id: str):
    """Update product fields."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = UpdateProductSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    updated = update_product(store_id, product_id, schema.model_dump(exclude_unset=True))
    if not updated:
        return error_response("Product not found", status_code=404)

    return success_response(data=updated, message="Product updated successfully")


@product_bp.route("/api/products/<product_id>", methods=["DELETE"])
def delete_product_route(product_id: str):
    """Soft delete product (set is_active = false)."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    deleted = delete_product(store_id, product_id)
    if not deleted:
        return error_response("Product not found", status_code=404)

    return success_response(data={"id": product_id}, message="Product deleted successfully")

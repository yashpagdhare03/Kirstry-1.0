> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 03 — Product Management API

## Status
Completed

## Objective
Implement product CRUD endpoints including barcode lookup via Open Food Facts and image upload to Supabase Storage.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md

## Scope
Endpoints to create:
1. `POST /api/products` — Create product manually
2. `GET /api/products` — List products for store with search, category filter, pagination
3. `GET /api/products/<product_id>` — Get single product details + computed stock level
4. `PUT /api/products/<product_id>` — Update product fields
5. `DELETE /api/products/<product_id>` — Soft-delete product (`is_active = false`)
6. `POST /api/products/barcode-lookup` — Barcode lookup via Open Food Facts API
7. `POST /api/products/<product_id>/image` — Upload product image to Supabase Storage bucket `product-images`
8. `GET /api/categories` — List categories for store
9. `POST /api/categories` — Create category

## Implementation Details
1. Create `backend/app/schemas/product-schema.py` using Pydantic for validation.
2. Create `backend/app/services/barcode-service.py` fetching from `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`.
3. Create `backend/app/services/storage-service.py` to upload images to Supabase Storage.
4. Create `backend/app/services/product-service.py` to execute queries scoped by `store_id`.
5. Create `backend/app/routes/product-routes.py` with Flask Blueprint.

## Acceptance Criteria
- [x] Product creation with valid payload returns HTTP 201
- [x] Product list filters by search query and category_id
- [x] Barcode lookup fetches product name, brand, image URL from Open Food Facts API
- [x] Soft-delete sets `is_active = false` without hard-deleting row
- [x] Image upload stores image in Supabase Storage and updates `image_url`
- [x] All database queries filter strictly by `store_id`

## MCP Verification
- Use `postman-mcp-server` to run product creation, list, update, and barcode lookup requests
- Use `supabase` MCP to check stored rows in `products` table

## ⛔ Out of Scope for This Unit
Stock-in/stock-out transactions (04), billing (05), frontend pages (13).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

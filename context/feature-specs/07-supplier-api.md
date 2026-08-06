> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 07 — Supplier Management API

## Status
Completed

## Objective
Implement supplier directory and purchase order management with WhatsApp sharing link generator.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md

## Scope
Endpoints to create:
1. `POST /api/suppliers` — Create supplier
2. `GET /api/suppliers` — List suppliers
3. `GET /api/suppliers/<supplier_id>` — Supplier details + purchase order history
4. `PUT /api/suppliers/<supplier_id>` — Update supplier
5. `DELETE /api/suppliers/<supplier_id>` — Delete supplier (fails if active POs exist)
6. `POST /api/purchase-orders` — Create purchase order (status: `draft`)
7. `GET /api/purchase-orders` — List purchase orders (filterable by status)
8. `GET /api/purchase-orders/<po_id>` — Single PO details
9. `PUT /api/purchase-orders/<po_id>` — Update PO status (`draft` -> `sent` -> `received`)
10. `DELETE /api/purchase-orders/<po_id>` — Delete draft PO
11. `GET /api/purchase-orders/<po_id>/share` — Generate WhatsApp share link

## Implementation Details
1. Create `backend/app/schemas/supplier-schema.py`.
2. Create `backend/app/services/supplier-service.py`:
   - Validate status transitions (`draft` -> `sent` -> `received`)
   - Prevent updating items on non-draft POs
3. Create `backend/app/routes/supplier-routes.py`.

## Acceptance Criteria
- [x] Supplier CRUD works with store_id isolation
- [x] Deleting supplier with active POs returns HTTP 409 Conflict
- [x] Status transitions enforced strictly
- [x] WhatsApp share URL correctly encodes order items and supplier phone number

## MCP Verification
- Use `postman-mcp-server` to run PO creation and status update calls
- Use `supabase` MCP to verify `purchase_orders` database table

## ⛔ Out of Scope for This Unit
Automatic stock-in from PO (manual entry via 04), Frontend supplier UI (17).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

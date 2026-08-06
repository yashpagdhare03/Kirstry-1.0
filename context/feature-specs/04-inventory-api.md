> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 04 — Inventory & Stock Management API

## Status
Completed

## Objective
Implement stock-in, stock-out, and stock adjustment endpoints with batch tracking, FIFO logic, and stock validation.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md
- 03-product-api.md

## Scope
Endpoints to create:
1. `POST /api/inventory/stock-in` — Record batch purchase + `stock_in` transaction
2. `POST /api/inventory/stock-out` — Record stock removal (`sale`/`damage`/`return`) using FIFO across batches
3. `POST /api/inventory/adjustment` — Reconciliation adjustment entry
4. `GET /api/inventory/stock-levels` — Current stock levels for all products
5. `GET /api/inventory/transactions` — Append-only stock transaction history
6. `GET /api/inventory/batches/<product_id>` — List active batches for a product

## Implementation Details
1. Create `backend/app/schemas/inventory-schema.py` for request validation.
2. Implement FIFO stock deduction algorithm in `backend/app/services/inventory-service.py`:
   - Query active batches for product ordered by `purchase_date ASC, created_at ASC`
   - Validate `sum(quantity_remaining) >= requested_quantity`; reject with 400 if insufficient
   - Deduct requested quantity sequentially across batches
3. Ensure `stock_transactions` entries are strictly APPEND-ONLY (no UPDATE or DELETE queries permitted).
4. Implement `backend/app/routes/inventory-routes.py`.

## Acceptance Criteria
- [x] Stock-in creates new batch and records `stock_in` transaction
- [x] Stock-out deducts from oldest batches first (FIFO)
- [x] Stock-out attempt exceeding available stock is rejected with HTTP 400
- [x] Stock transactions are never updated or deleted
- [x] Stock levels return calculated sum of batch remaining quantities

## MCP Verification
- Use `postman-mcp-server` to execute stock-in -> stock-out -> stock level check sequence
- Use `supabase` MCP to verify batch remaining quantities and transaction entries

## ⛔ Out of Scope for This Unit
POS Billing auto stock-out (05), Expiry/Low-stock alerts generation (09), Frontend inventory UI (14).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

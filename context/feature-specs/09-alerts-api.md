> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 09 — Alerts System API

## Status
Completed

## Objective
Implement backend alert generation, storage, and management for expiry and low-stock notifications.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md
- 03-product-api.md
- 04-inventory-api.md

## Scope
Endpoints to create:
1. `GET /api/alerts` — List alerts for store (filterable by type, severity, read status)
2. `PUT /api/alerts/<alert_id>/read` — Mark alert as read
3. `PUT /api/alerts/read-all` — Mark all alerts as read
4. `GET /api/alerts/unread-count` — Count of unread alerts for badge counter
5. `POST /api/alerts/generate` — Trigger alert scan & deduplicated record creation

## Implementation Details
1. Create `backend/app/services/alert-service.py`:
   - Scan `stock_batches` for items expiring in 7/3/1 days
   - Scan `products` for total stock < threshold
   - Deduplicate unread alerts before creating new records
   - Clean up resolved alerts
2. Create `backend/app/routes/alert-routes.py`.

## Acceptance Criteria
- [x] Alert generation creates unread alert records with correct severity (`info`, `warning`, `critical`)
- [x] Duplicate alerts for the same item/batch and severity are prevented
- [x] Marking alerts read updates database status
- [x] All endpoints scope strictly by `store_id`

## MCP Verification
- Use `postman-mcp-server` to run alert generation and mark-read requests
- Use `supabase` MCP to inspect `alerts` database table

## ⛔ Out of Scope for This Unit
Push notifications / Email delivery, Frontend notification bell component (11).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

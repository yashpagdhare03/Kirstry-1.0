> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 08 — Dashboard & Analytics API

## Status
Completed

## Objective
Implement real-time dashboard summary endpoints and analytics aggregation endpoints for charts and reports.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md
- 03-product-api.md
- 04-inventory-api.md
- 05-billing-api.md

## Scope
Endpoints to create:
1. `GET /api/dashboard/summary` — Total products, inventory value, low stock count, expiring count, today's sales
2. `GET /api/dashboard/expiry-alerts` — Products/batches expiring within 7/3/1 days
3. `GET /api/dashboard/low-stock-alerts` — Products with stock below low_stock_threshold
4. `GET /api/dashboard/recent-sales` — Last 5 sales summary
5. `GET /api/analytics/fast-moving` — Top N items by sales quantity
6. `GET /api/analytics/slow-moving` — Least-selling / dead stock items
7. `GET /api/analytics/sales-trends` — Sales data grouped by day/week/month for charts
8. `GET /api/analytics/inventory-value` — Inventory value breakdown by category

## Implementation Details
1. Create `backend/app/services/dashboard-service.py` using SQL aggregations.
2. Create `backend/app/services/analytics-service.py`:
   - Fast-moving: `SUM(sale_items.quantity)` grouped by `product_id`
   - Slow-moving: Products with 0 or low sales over window
   - Sales trends: Group by date range (`DATE_TRUNC`)
3. Create `backend/app/routes/dashboard-routes.py` and `backend/app/routes/analytics-routes.py`.

## Acceptance Criteria
- [x] Dashboard summary returns real-time calculated metrics
- [x] Expiry alerts categorize items into 7-day, 3-day, 1-day urgency
- [x] Analytics APIs use SQL aggregations without loading entire tables into memory
- [x] All queries scope strictly by `store_id`

## MCP Verification
- Use `postman-mcp-server` to test analytics endpoints
- Use `supabase` MCP to verify query results against DB data

## ⛔ Out of Scope for This Unit
Frontend Dashboard UI (12), Recharts UI integration (18).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

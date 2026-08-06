> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 05 — Billing & Invoice API

## Status
Completed

## Objective
Implement bill creation with automatic stock deduction, ReportLab invoice PDF generation, and WhatsApp sharing link generation.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md
- 03-product-api.md
- 04-inventory-api.md

## Scope
Endpoints to create:
1. `POST /api/billing/create` — Create sale record, dedupping stock for each item via FIFO
2. `GET /api/billing/sales` — List historical sales (filterable by date range and payment mode)
3. `GET /api/billing/sales/<sale_id>` — Retrieve single sale with sale items
4. `GET /api/billing/daily-summary` — Get today's total revenue, order count, and payment mode breakdown
5. `POST /api/billing/invoice/<sale_id>/generate` — Generate invoice PDF with ReportLab & upload to Supabase Storage
6. `GET /api/billing/invoice/<sale_id>/share` — Return formatted WhatsApp share link (`wa.me/?text=...`)

## Implementation Details
1. Create `backend/app/schemas/billing-schema.py`.
2. Create `backend/app/services/invoice-service.py` using ReportLab to draw styled PDF invoices.
3. In `backend/app/services/billing-service.py`:
   - Validate stock availability for all items before committing
   - Generate sequential invoice number (e.g. `INV-YYYYMMDD-XXXX`)
   - Create sale and sale_items entries
   - Call inventory service stock-out for each line item
   - If payment mode is `credit`, call khata service to record credit transaction
4. Create `backend/app/routes/billing-routes.py`.

## Acceptance Criteria
- [x] Bill creation atomically deducts stock across all items
- [x] Bill creation fails with 400 if any product lacks requested stock
- [x] ReportLab PDF generator creates clean invoice PDF and uploads to `invoices` bucket
- [x] WhatsApp share endpoint returns correctly encoded `https://wa.me/?text=...` URL
- [x] Daily summary returns accurate revenue totals and payment mode split

## MCP Verification
- Use `postman-mcp-server` to test creating a multi-item bill
- Use `supabase` MCP to verify generated PDF file in Supabase Storage and `sales` database table

## ⛔ Out of Scope for This Unit
Khata customer management (06), POS frontend UI (15).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 02 — Database Schema

## Status
Completed

## Objective
Create all Supabase PostgreSQL tables and apply SQL migrations for the complete Kirstry data model.

## Depends On
- 01-backend-setup.md

## Scope
Create these tables via SQL migrations:
1. `users` — id (uuid, PK), email (text, unique, not null), full_name (text), avatar_url (text), created_at (timestamptz)
2. `stores` — id (uuid, PK), owner_id (uuid, FK→users), name (text, not null), address (text), gstin (text), created_at (timestamptz)
3. `store_members` — id (uuid, PK), store_id (uuid, FK→stores), user_id (uuid, FK→users), role (text: 'owner'/'staff'), created_at (timestamptz)
4. `categories` — id (uuid, PK), store_id (uuid, FK→stores), name (text, not null)
5. `products` — id (uuid, PK), store_id (uuid, FK→stores), name (text, not null), category_id (uuid, FK→categories), brand (text), unit (text, not null), barcode (text), mrp (numeric), selling_price (numeric), purchase_price (numeric), image_url (text), low_stock_threshold (integer, default 10), is_active (boolean, default true), created_at, updated_at
6. `stock_batches` — id (uuid, PK), product_id (uuid, FK→products), store_id (uuid, FK→stores), batch_number (text), quantity_remaining (integer, check >= 0), initial_quantity (integer), expiry_date (date), purchase_date (date), supplier_id (uuid), cost_price (numeric), created_at
7. `stock_transactions` — id (uuid, PK), store_id (uuid, FK→stores), product_id (uuid, FK→products), batch_id (uuid, FK→stock_batches), type (text: 'stock_in'/'stock_out'/'adjustment'), quantity (integer), reason (text: 'purchase'/'sale'/'damage'/'return'/'reconciliation'), reference_id (uuid), notes (text), created_at, created_by (uuid, FK→users)
8. `sales` — id (uuid, PK), store_id (uuid, FK→stores), invoice_number (text, not null), items_count (integer), subtotal (numeric), total_amount (numeric), discount (numeric, default 0), payment_mode (text: 'cash'/'upi'/'credit'), customer_id (uuid), invoice_url (text), created_at, created_by (uuid, FK→users)
9. `sale_items` — id (uuid, PK), sale_id (uuid, FK→sales), product_id (uuid, FK→products), batch_id (uuid, FK→stock_batches), quantity (integer), unit_price (numeric), total_price (numeric)
10. `customers` — id (uuid, PK), store_id (uuid, FK→stores), name (text, not null), phone (text), created_at
11. `credit_transactions` — id (uuid, PK), store_id (uuid, FK→stores), customer_id (uuid, FK→customers), type (text: 'credit'/'payment'), amount (numeric), due_date (date), note (text), sale_id (uuid, FK→sales), created_at, created_by (uuid, FK→users)
12. `suppliers` — id (uuid, PK), store_id (uuid, FK→stores), name (text, not null), phone (text), items_supplied (text), created_at
13. `purchase_orders` — id (uuid, PK), store_id (uuid, FK→stores), supplier_id (uuid, FK→suppliers), items (jsonb), status (text: 'draft'/'sent'/'received'), total_amount (numeric), notes (text), created_at
14. `alerts` — id (uuid, PK), store_id (uuid, FK→stores), type (text: 'expiry'/'low_stock'), product_id (uuid, FK→products), batch_id (uuid, FK→stock_batches), message (text), severity (text: 'info'/'warning'/'critical'), is_read (boolean, default false), created_at

## Implementation Details
1. Create `backend/migrations/001_initial_schema.sql` with full DDL.
2. Execute migration using Supabase SQL runner / MCP.
3. Create model definitions in `backend/app/models/` as Python dataclasses/TypedDicts matching DB columns.

## Acceptance Criteria
- [x] All 14 tables created in Supabase PostgreSQL
- [x] All foreign key and check constraints enforced
- [x] All indexes on `store_id` created
- [x] Python model definitions created in `backend/app/models/`

## MCP Verification
- Use `supabase` MCP `execute_sql` to run migrations
- Use `supabase` MCP `list_tables` to confirm all 14 tables exist

## ⛔ Out of Scope for This Unit
Seed data, Row Level Security policies (22), API endpoints (03-09).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

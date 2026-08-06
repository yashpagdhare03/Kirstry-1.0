> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 06 — Digital Khata (Customer Credit) API

## Status
Completed

## Objective
Implement customer management and credit/payment tracking endpoints for udhari (credit) system.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md

## Scope
Endpoints to create:
1. `POST /api/customers` — Add new customer
2. `GET /api/customers` — List customers with calculated outstanding balance
3. `GET /api/customers/<customer_id>` — Customer detail + transaction history
4. `PUT /api/customers/<customer_id>` — Update customer info
5. `POST /api/khata/credit` — Record credit entry (`udhari`) with due date
6. `POST /api/khata/payment` — Record payment collected
7. `GET /api/khata/outstanding` — List all customers with positive balance
8. `GET /api/khata/summary` — Aggregate credit stats (total outstanding, overdue count)

## Implementation Details
1. Create `backend/app/schemas/khata-schema.py`.
2. Create `backend/app/services/khata-service.py`:
   - Compute `outstanding_balance = sum(credit) - sum(payment)`
   - Reject payment amounts exceeding customer's outstanding balance with HTTP 400
3. Create `backend/app/routes/khata-routes.py`.

## Acceptance Criteria
- [x] Customer CRUD works with store_id isolation
- [x] Recording credit increases customer's outstanding balance
- [x] Recording payment decreases outstanding balance
- [x] Payment exceeding outstanding balance returns HTTP 400 error
- [x] Outstanding list returns customers sorted by balance descending

## MCP Verification
- Use `postman-mcp-server` to execute credit entry and payment collection APIs
- Use `supabase` MCP to verify `credit_transactions` database table

## ⛔ Out of Scope for This Unit
Frontend Khata UI (16), SMS/WhatsApp automatic payment reminder notifications.

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

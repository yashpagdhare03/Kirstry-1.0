> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 14 — Inventory Management Pages

## Status
Not Started

## Objective
Implement stock-in, stock-out, stock adjustment forms, stock levels overview, transaction history, and batch detail views.

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 04-inventory-api.md
- 13-product-pages.md

## Scope
Pages & components:
1. `StockLevelsPage.tsx` (`/inventory`) — Product stock status table (OK, Low Stock, Out of Stock)
2. `StockInPage.tsx` (`/inventory/stock-in`) — Batch purchase entry form (batch #, expiry date, purchase date, supplier, cost price)
3. `StockOutPage.tsx` (`/inventory/stock-out`) — Stock deduction form with available stock validation
4. `AdjustmentPage.tsx` (`/inventory/adjustment`) — Physical count reconciliation form
5. `TransactionHistoryPage.tsx` (`/inventory/transactions`) — Audit log of all stock movements
6. `BatchDetailPage.tsx` (`/inventory/batches/:product_id`) — Batch breakdown per product

## Implementation Details
1. Create `ProductSelector.tsx` component with search autocomplete.
2. In `StockOutPage.tsx`, validate client-side that `requested_quantity <= available_quantity`.
3. Highlight expiring batches with visual countdown badges.

## Acceptance Criteria
- [ ] Stock-in records new purchase batch and updates stock levels
- [ ] Stock-out form prevents submitting quantities greater than total available stock
- [ ] Transaction history table displays append-only logs with filtering by type (`stock_in`, `stock_out`, `adjustment`)
- [ ] Batch detail page shows batch expiry dates and remaining quantities

## MCP Verification
- Use `chrome-devtools-mcp` to test stock-in form submission -> check updated stock levels table
- Use `chrome-devtools-mcp` screenshot of stock levels and transaction history pages

## ⛔ Out of Scope for This Unit
Billing cart auto stock-out (15), Expiry alert configuration.

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

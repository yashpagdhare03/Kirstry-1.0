> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 14 — Inventory Management Pages

## Status
Completed

## Objective
Implement stock-in, stock-out, stock adjustment forms, stock levels overview, transaction history, and batch detail views. The layout MUST be built with a **Mobile-First Responsive Design**, providing easy touch input for quick stock entries on handheld mobile devices (`<768px`) while expanding cleanly on desktop displays (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 04-inventory-api.md
- 13-product-pages.md

## Scope
Pages & components:
1. `StockLevelsPage.tsx` (`/inventory`) — Product stock status table (OK, Low Stock, Out of Stock) with mobile-responsive horizontal scrolling
2. `StockInPage.tsx` (`/inventory/stock-in`) — Batch purchase entry form (stacked 1-column mobile inputs, 2-column desktop grid)
3. `StockOutPage.tsx` (`/inventory/stock-out`) — Stock deduction form with available stock validation
4. `AdjustmentPage.tsx` (`/inventory/adjustment`) — Physical count reconciliation form
5. `TransactionHistoryPage.tsx` (`/inventory/transactions`) — Audit log of all stock movements (responsive table/cards)
6. `BatchDetailPage.tsx` (`/inventory/batches/:product_id`) — Batch breakdown per product

## Implementation Details
1. Create `ProductSelector.tsx` component with search autocomplete (mobile-touch optimized).
2. In `StockOutPage.tsx`, validate client-side that `requested_quantity <= available_quantity`.
3. Highlight expiring batches with visual countdown badges.
4. Use mobile-first CSS modules with responsive breakpoints (`@media (min-width: 768px)`).

## Acceptance Criteria
- [x] Mobile-First Responsive Design: Inventory forms and stock tables fit mobile viewports (<768px) with zero horizontal overflow and expand to multi-column layouts on desktop
- [x] Stock-in records new purchase batch and updates stock levels
- [x] Stock-out form prevents submitting quantities greater than total available stock
- [x] Transaction history table displays append-only logs with filtering by type (`stock_in`, `stock_out`, `adjustment`)
- [x] Batch detail page shows batch expiry dates and remaining quantities

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to test Mobile (375px) and Desktop (1440px) viewports
- Use `chrome-devtools-mcp` to test stock-in form submission -> check updated stock levels table
- Use `chrome-devtools-mcp` screenshot of stock levels and transaction history pages across mobile and desktop breakpoints

## ⛔ Out of Scope for This Unit
Billing cart auto stock-out (15), Expiry alert configuration.

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

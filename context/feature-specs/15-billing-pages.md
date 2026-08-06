> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 15 — Billing & Invoice Pages

## Status
Not Started

## Objective
Implement POS-style billing interface with product search, cart management, payment mode selection, invoice viewer, and sales history.

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 05-billing-api.md
- 13-product-pages.md

## Scope
Pages & components:
1. `NewBillPage.tsx` (`/billing/new`) — POS layout with left product search and right interactive cart
2. `InvoiceViewPage.tsx` (`/billing/invoice/:sale_id`) — Invoice preview with Download PDF & WhatsApp share options
3. `SalesHistoryPage.tsx` (`/billing`) — Filterable table of completed sales
4. `DailySummaryPage.tsx` (`/billing/summary`) — End-of-day sales revenue & payment mode breakdown
5. `useCart.ts` — Cart state hook (`addItem`, `removeItem`, `updateQuantity`, `clearCart`, totals)

## Implementation Details
1. Implement `useCart` hook handling line item price calculation and discount deductions.
2. Build POS UI responsive to desktop split screen and mobile stacked views.
3. Handle payment modes: `cash`, `upi`, `credit` (requires customer selection).
4. Integrate window print + ReportLab PDF download link.

## Acceptance Criteria
- [ ] Cart dynamically updates subtotal, discount, and grand total
- [ ] Creating bill submits payload, clears cart, and opens invoice viewer
- [ ] WhatsApp share button opens formatted `wa.me` URL
- [ ] Sales history lists past bills with view detail action

## MCP Verification
- Use `chrome-devtools-mcp` to test full POS workflow: search product -> add to cart -> select payment -> complete bill
- Use `chrome-devtools-mcp` screenshot of POS screen and generated invoice page

## ⛔ Out of Scope for This Unit
Offline service worker sync (22), Customer credit management (16).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

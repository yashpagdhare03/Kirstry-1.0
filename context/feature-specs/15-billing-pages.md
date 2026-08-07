> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 15 — Billing & Invoice Pages

## Status
Completed

## Objective
Implement POS-style billing interface with product search, cart management, payment mode selection, invoice viewer, and sales history. The layout MUST be built with a **Mobile-First Responsive Design**, providing a fast handheld mobile POS workflow (`<768px`) with stacked search & bottom sticky cart bar, and expanding to a side-by-side split screen POS terminal on desktop screens (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 05-billing-api.md
- 13-product-pages.md

## Scope
Pages & components:
1. `NewBillPage.tsx` (`/billing/new`) — POS layout (Mobile: stacked product grid + floating/bottom sticky cart drawer; Desktop: 60/40 side-by-side split screen)
2. `InvoiceViewPage.tsx` (`/billing/invoice/:sale_id`) — Invoice preview with Download PDF & WhatsApp share options (mobile-responsive card layout)
3. `SalesHistoryPage.tsx` (`/billing`) — Filterable table of completed sales (horizontally scrollable on mobile)
4. `DailySummaryPage.tsx` (`/billing/summary`) — End-of-day sales revenue & payment mode breakdown
5. `useCart.ts` — Cart state hook (`addItem`, `removeItem`, `updateQuantity`, `clearCart`, totals)

## Implementation Details
1. Implement `useCart` hook handling line item price calculation and discount deductions.
2. Build POS UI with a mobile-first responsive approach (`@media (min-width: 768px)` for desktop split-screen POS terminal).
3. Handle payment modes: `cash`, `upi`, `credit` (requires customer selection).
4. Integrate window print + ReportLab PDF download link.

## Acceptance Criteria
- [x] Mobile-First Responsive Design: POS billing interface provides 1-touch mobile adding & bottom sticky checkout (<768px) and transforms to desktop 2-column split screen (>=768px)
- [x] Cart dynamically updates subtotal, discount, and grand total
- [x] Creating bill submits payload, clears cart, and opens invoice viewer
- [x] WhatsApp share button opens formatted `wa.me` URL
- [x] Sales history lists past bills with view detail action

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to test Mobile POS (375px) and Desktop POS Terminal (1440px) viewports
- Use `chrome-devtools-mcp` to test full POS workflow: search product -> add to cart -> select payment -> complete bill
- Use `chrome-devtools-mcp` screenshot of POS screen and generated invoice page across mobile and desktop breakpoints

## ⛔ Out of Scope for This Unit
Offline service worker sync (22), Customer credit management (16).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

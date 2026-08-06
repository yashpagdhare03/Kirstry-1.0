> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 17 — Supplier Management Pages

## Status
Completed

## Objective
Implement supplier directory, purchase order creation wizard, status tracking UI, and WhatsApp PO sharing button. The layout MUST be built with a **Mobile-First Responsive Design**, ensuring handheld mobile shopkeepers (`<768px`) can add suppliers and create POs on touch devices, scaling cleanly to desktop displays (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 07-supplier-api.md

## Scope
Pages to create:
1. `SupplierListPage.tsx` (`/suppliers`) — Supplier directory with item types and PO counts (responsive cards on mobile, table on desktop)
2. `AddSupplierPage.tsx` (`/suppliers/add`) — Supplier entry form (mobile-first single column)
3. `SupplierDetailPage.tsx` (`/suppliers/:id`) — Supplier profile + linked PO history
4. `CreatePurchaseOrderPage.tsx` (`/suppliers/:id/purchase-order/new`) — Dynamic item order builder (touch-friendly item rows)
5. `PurchaseOrderListPage.tsx` (`/purchase-orders`) — List POs with status badges (`draft`, `sent`, `received`)
6. `PurchaseOrderDetailPage.tsx` (`/purchase-orders/:id`) — PO preview with WhatsApp share action

## Implementation Details
1. Dynamic item row creation in `CreatePurchaseOrderPage.tsx` (add/remove item line with mobile responsive layout).
2. Status transition action buttons (`Mark as Sent`, `Mark as Received`).
3. Delete supplier action confirmation checking for active POs.
4. Apply mobile-first CSS modules with responsive breakpoints (`@media (min-width: 768px)`).

## Acceptance Criteria
- [x] Mobile-First Responsive Design: Supplier cards, PO wizards, and status badges scale cleanly from mobile viewports (<768px) to desktop dashboards (>=768px)
- [x] Supplier CRUD works seamlessly
- [x] Purchase Order creation builds dynamic item JSON payload
- [x] Status updates (`draft` -> `sent` -> `received`) toggle valid UI actions
- [x] WhatsApp share button opens formatted order link

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to test Mobile (375px) and Desktop (1440px) viewports
- Use `chrome-devtools-mcp` to test creating supplier -> creating PO -> updating status
- Use `chrome-devtools-mcp` screenshot of supplier detail and purchase order pages across mobile and desktop breakpoints

## ⛔ Out of Scope for This Unit
Automatic stock-in from PO (manual entry via 14).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

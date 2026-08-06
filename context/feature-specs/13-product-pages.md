> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 13 — Product Management Pages

## Status
Not Started

## Objective
Implement product list, add/edit product forms, barcode lookup page, and product detail view. The layout MUST be built with a **Mobile-First Responsive Design**, ensuring form controls, tables, and buttons are touch-friendly (`<768px`) and scale gracefully to desktop viewports (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 03-product-api.md

## Scope
Pages to create:
1. `ProductListPage.tsx` (`/products`) — Search bar, category filter, responsive data table (horizontally scrollable or card view on mobile), soft delete action
2. `AddProductPage.tsx` (`/products/add`) — Manual product form + image upload + barcode scanner link (stacked single-column inputs on mobile, 2-column grid on desktop)
3. `BarcodeLookupPage.tsx` (`/products/barcode-lookup`) — Barcode photo upload / input scanner fetching Open Food Facts details
4. `EditProductPage.tsx` (`/products/:id/edit`) — Pre-filled edit form (mobile-first layout)
5. `ProductDetailPage.tsx` (`/products/:id`) — Product profile, price details, and active batch inventory summary

## Implementation Details
1. Create `frontend/src/services/products.ts` with typed methods.
2. Form fields: Name*, Category, Brand, Unit*, Barcode, MRP, Selling Price, Purchase Price, Low Stock Threshold, Image Upload.
3. All form inputs MUST be controlled components (`value` + `onChange`).
4. Apply mobile-first CSS modules (`@media (min-width: 768px)` for multi-column form field grids and desktop table layouts).

## Acceptance Criteria
- [ ] Mobile-First Responsive Design: Product forms stack in 1 column on mobile (<768px) and expand to 2-column grid on desktop (>=768px)
- [ ] Product list displays data with working search filter and pagination (responsive table container with 0 mobile overflow)
- [ ] Barcode lookup auto-populates product details from Open Food Facts API
- [ ] Product creation uploads image to Supabase Storage and redirects to `/products`
- [ ] Soft-delete removes item from active view after confirmation

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to test Mobile (375px) and Desktop (1440px) viewports
- Use `chrome-devtools-mcp` to test completing product creation form and barcode lookup
- Use `chrome-devtools-mcp` to inspect Network request payloads to `/api/products`

## ⛔ Out of Scope for This Unit
Stock-in batch creation (14), POS billing (15).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

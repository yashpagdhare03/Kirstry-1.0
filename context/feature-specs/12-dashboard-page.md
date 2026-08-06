> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`, `backend/README.md`.

# 12 — Dashboard Page

## Status
Completed

## Objective
Implement the main shopkeeper dashboard showing stock summary cards, alert feeds, quick action buttons, and recent sales table. The layout MUST be built with a **Mobile-First Responsive Design**, optimizing for touch handhelds (`<768px`) and gracefully scaling up to desktop screens (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 08-dashboard-analytics-api.md

## Scope
- `frontend/src/pages/dashboard/DashboardPage.tsx` + `.module.css`
- `frontend/src/services/dashboard.ts` — API service integration
- `frontend/src/hooks/useDashboard.ts` — Custom state hook

Page Sections:
1. **Stock Summary Cards**: Total Products, Low Stock Count, Expiring Soon Count, Today's Sales (Mobile: 1 column / 2-column grid; Desktop: 4-column grid)
2. **Quick Actions**: Add Product (`/products/add`), New Bill (`/billing/new`), Stock In (`/inventory/stock-in`)
3. **Alert Feeds**: Expiry Alert Feed & Low-Stock Alert Feed (Mobile: stacked 1 column; Desktop: 2 columns side-by-side)
4. **Recent Sales Table**: Last 5 transactions with quick status badges (Mobile: responsive horizontally scrolling container or card list)

## Implementation Details
1. Create `useDashboard` hook calling `/api/dashboard/summary`, `/api/dashboard/expiry-alerts`, `/api/dashboard/low-stock-alerts`, `/api/dashboard/recent-sales`.
2. Render CSS grid/flex layout using a mobile-first approach (`@media (min-width: 768px)` for desktop expansions). Use `--bg-surface` cards and `--border-default` borders.
3. Add skeleton loading state while API requests complete.

## Acceptance Criteria
- [x] Mobile-First Responsive Design: Dashboard layout stacks seamlessly on mobile (<768px) and expands to multi-column grid on desktop (>=768px)
- [x] Summary cards display live backend metrics accurately
- [x] Quick action buttons navigate to respective routes
- [x] Alert feeds display severity badges (`critical`, `warning`, `info`)
- [x] Dashboard layout is fully responsive with zero horizontal overflow on mobile viewports

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to verify Mobile (375px) and Desktop (1440px) viewports
- Use `chrome-devtools-mcp` to capture screenshots of populated dashboard page across mobile and desktop breakpoints
- Use `chrome-devtools-mcp` to verify network API calls to `/api/dashboard/*`

## ⛔ Out of Scope for This Unit
Analytics charts (18), Full alerts management page (09 API only).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

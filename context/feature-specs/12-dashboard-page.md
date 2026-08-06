> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 12 — Dashboard Page

## Status
Not Started

## Objective
Implement the main shopkeeper dashboard showing stock summary cards, alert feeds, quick action buttons, and recent sales table.

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 08-dashboard-analytics-api.md

## Scope
- `frontend/src/pages/dashboard/DashboardPage.tsx` + `.module.css`
- `frontend/src/services/dashboard.ts` — API service integration
- `frontend/src/hooks/useDashboard.ts` — Custom state hook

Page Sections:
1. **Stock Summary Cards**: Total Products, Low Stock Count, Expiring Soon Count, Today's Sales
2. **Quick Actions**: Add Product (`/products/add`), New Bill (`/billing/new`), Stock In (`/inventory/stock-in`)
3. **Alert Feeds (2 columns)**: Expiry Alert Feed & Low-Stock Alert Feed
4. **Recent Sales Table**: Last 5 transactions with quick status badges

## Implementation Details
1. Create `useDashboard` hook calling `/api/dashboard/summary`, `/api/dashboard/expiry-alerts`, `/api/dashboard/low-stock-alerts`, `/api/dashboard/recent-sales`.
2. Render card grid using `--bg-surface` cards and `--border-default` borders.
3. Add skeleton loading state while API requests complete.

## Acceptance Criteria
- [ ] Summary cards display live backend metrics accurately
- [ ] Quick action buttons navigate to respective routes
- [ ] Alert feeds display severity badges (`critical`, `warning`, `info`)
- [ ] Dashboard layout is responsive across mobile and desktop viewports

## MCP Verification
- Use `chrome-devtools-mcp` to capture screenshot of populated dashboard page
- Use `chrome-devtools-mcp` to verify network API calls to `/api/dashboard/*`

## ⛔ Out of Scope for This Unit
Analytics charts (18), Full alerts management page (09 API only).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

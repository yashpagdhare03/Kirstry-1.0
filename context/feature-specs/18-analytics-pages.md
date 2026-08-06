> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 18 — Analytics Pages

## Status
Not Started

## Objective
Implement analytics views using Recharts for fast-moving items, slow-moving items, sales trends line charts, and inventory category distribution.

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 08-dashboard-analytics-api.md

## Scope
Pages & components:
1. `AnalyticsPage.tsx` (`/analytics`) — Main layout with tabbed navigation: Fast Moving | Slow Moving | Sales Trends | Inventory Value
2. `FastMovingPage.tsx` — Bar chart (Recharts) + top seller table
3. `SlowMovingPage.tsx` — Dead stock table with days since last sale
4. `SalesTrendsPage.tsx` — Line chart (Recharts) for revenue over time + period toggles (7d, 30d, 90d)
5. `InventoryValuePage.tsx` — Donut/Pie chart (Recharts) for category value distribution

## Implementation Details
1. Wrap charts in Recharts `ResponsiveContainer`.
2. Style chart elements to match dark theme tokens:
   - Chart background: transparent (`--bg-base`)
   - Grid lines: `--border-muted`
   - Tooltips: `--bg-surface-alt` background, `--text-primary` text
   - Primary bar/line color: `--accent-primary` (#FFFFFF)

## Acceptance Criteria
- [ ] All 4 analytics sub-pages load data from backend analytics APIs
- [ ] Recharts line, bar, and pie charts render correctly with dark theme styling
- [ ] Period filter (7d, 30d, 90d) updates chart and table data dynamically
- [ ] Charts scale responsively across desktop and mobile screens

## MCP Verification
- Use `chrome-devtools-mcp` to capture screenshots of each analytics tab
- Use `chrome-devtools-mcp` `resize_page` to verify chart responsiveness

## ⛔ Out of Scope for This Unit
Exporting charts to PDF/Excel, AI demand forecasting (out of scope per overview).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

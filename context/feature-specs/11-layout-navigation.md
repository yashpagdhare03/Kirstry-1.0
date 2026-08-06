> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 11 — Layout & Navigation

## Status
Not Started

## Objective
Implement the main app shell: desktop sidebar (240px fixed), top bar, mobile bottom navigation bar (5 icons), and responsive layout container.

## Depends On
- 10-frontend-setup.md

## Scope
- `frontend/src/components/layout/Sidebar.tsx` — Desktop sidebar with icons and links (collapsible on smaller screens)
- `frontend/src/components/layout/TopBar.tsx` — Top header with page title, notification bell, user dropdown (Radix UI)
- `frontend/src/components/layout/BottomNav.tsx` — Mobile bottom navigation bar (visible `<768px`)
- `frontend/src/components/layout/MainLayout.tsx` — Responsive layout wrapper with `<Outlet />`

## Implementation Details
1. Create `Sidebar.tsx` with links to `/`, `/products`, `/inventory`, `/billing`, `/khata`, `/suppliers`, `/analytics`, `/settings`.
2. Create `TopBar.tsx` showing current page title dynamically and notification bell icon.
3. Create `BottomNav.tsx` showing 5 icons: Dashboard, Inventory, Billing, Khata, More.
4. Implement CSS module responsive breakpoints (`@media (max-width: 768px)`).

## Acceptance Criteria
- [ ] Sidebar renders on desktop (`>=768px`) with active route highlighting
- [ ] Bottom navigation renders on mobile (`<768px`) with 5 primary icons
- [ ] Top bar displays current route title and user profile dropdown
- [ ] Navigation links route correctly via React Router

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to test desktop (1440px), tablet (1024px), and mobile (375px) layouts
- Use `chrome-devtools-mcp` to capture screenshots at each viewport breakpoint

## ⛔ Out of Scope for This Unit
Page route content (12-19), auth guard redirects (21).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 19 — Settings & Store Management Page

## Status
Completed

## Objective
Implement store profile management, staff member invites, and account settings. The layout MUST be built with a **Mobile-First Responsive Design**, providing stacked, touch-optimized settings forms on mobile screens (`<768px`) that scale cleanly to desktop settings panels (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 01-backend-setup.md

## Scope
Backend additions:
- `backend/app/routes/store-routes.py`
- Endpoints: `GET /api/store`, `PUT /api/store`, `GET /api/store/members`, `POST /api/store/members/invite`, `DELETE /api/store/members/<id>`

Frontend pages:
1. `SettingsPage.tsx` (`/settings`) — Tabbed interface: Store Profile | Staff Management | Account (mobile horizontal scroll tabs)
2. `StoreProfileTab.tsx` — Edit store name, address, GSTIN (owner only, mobile-first single column form)
3. `StaffManagementTab.tsx` — Invite staff member by email, list current staff, remove staff (owner only)
4. `AccountTab.tsx` — Current logged-in user profile details + Logout action

## Implementation Details
1. Implement role checking logic in frontend components (`userRole === 'owner'`).
2. Show read-only view of store details for staff users.
3. Prevent store owners from deleting their own membership.
4. Apply mobile-first CSS modules with responsive breakpoints (`@media (min-width: 768px)`).

## Acceptance Criteria
- [x] Mobile-First Responsive Design: Settings tabs, store profile forms, and staff management lists adapt seamlessly to mobile viewports (<768px) and expand on desktop screens (>=768px)
- [x] Store owners can update store name, address, and GSTIN
- [x] Store owners can invite staff members by email and revoke staff access
- [x] Staff members see store profile and staff management as read-only
- [x] Account tab shows current user details and working logout button

## MCP Verification
- Use `postman-mcp-server` to test store settings and staff management endpoints
- Use `chrome-devtools-mcp` `resize_page` to test Mobile (375px) and Desktop (1440px) viewports
- Use `chrome-devtools-mcp` screenshot of settings tabs across mobile and desktop breakpoints

## ⛔ Out of Scope for This Unit
Supabase Auth password reset UI (21), Multi-store switching (single store MVP).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

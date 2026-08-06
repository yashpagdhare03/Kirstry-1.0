> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 19 — Settings & Store Management Page

## Status
Not Started

## Objective
Implement store profile management, staff member invites, and account settings.

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 01-backend-setup.md

## Scope
Backend additions:
- `backend/app/routes/store-routes.py`
- Endpoints: `GET /api/store`, `PUT /api/store`, `GET /api/store/members`, `POST /api/store/members/invite`, `DELETE /api/store/members/<id>`

Frontend pages:
1. `SettingsPage.tsx` (`/settings`) — Tabbed interface: Store Profile | Staff Management | Account
2. `StoreProfileTab.tsx` — Edit store name, address, GSTIN (owner only)
3. `StaffManagementTab.tsx` — Invite staff member by email, list current staff, remove staff (owner only)
4. `AccountTab.tsx` — Current logged-in user profile details + Logout action

## Implementation Details
1. Implement role checking logic in frontend components (`userRole === 'owner'`).
2. Show read-only view of store details for staff users.
3. Prevent store owners from deleting their own membership.

## Acceptance Criteria
- [ ] Store owners can update store name, address, and GSTIN
- [ ] Store owners can invite staff members by email and revoke staff access
- [ ] Staff members see store profile and staff management as read-only
- [ ] Account tab shows current user details and working logout button

## MCP Verification
- Use `postman-mcp-server` to test store settings and staff management endpoints
- Use `chrome-devtools-mcp` screenshot of settings tabs

## ⛔ Out of Scope for This Unit
Supabase Auth password reset UI (21), Multi-store switching (single store MVP).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

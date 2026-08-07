> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 20 — Auth Backend Integration

## Status
Completed

## Objective
Implement Supabase Auth integration in Flask: JWT verification middleware, auth decorators, signup/login flow, and store_id extraction from token.

## Depends On
- 01-backend-setup.md
- 02-database-schema.md

## Scope
- `backend/app/utils/auth-middleware.py` — JWT verification middleware
- `backend/app/routes/auth-routes.py` — Auth endpoints
- `backend/app/services/auth-service.py` — Supabase Auth logic
- Protect all existing Flask routes with `@require_auth` or `@require_owner`

Endpoints:
1. `POST /api/auth/signup` — Sign up with email/password
2. `POST /api/auth/login` — Sign in with email/password
3. `POST /api/auth/google` — Authenticate via Google OAuth token
4. `POST /api/auth/store-setup` — Store creation wizard for new owners
5. `POST /api/auth/refresh` — Refresh access token
6. `GET /api/auth/me` — Return authenticated user & store profile

## Implementation Details
1. In `auth-middleware.py`:
   - Parse `Authorization: Bearer <token>` header
   - Validate token via `supabase.auth.get_user(token)`
   - Query `store_members` table to attach `g.user_id`, `g.store_id`, `g.user_role` to Flask request context
   - Return HTTP 401 for invalid/missing tokens, HTTP 403 for unauthorized role actions
2. Update all route files (`03-09`, `19`) to replace header parsing with `g.store_id` and apply `@require_auth`.

## Acceptance Criteria
- [x] Signup and Login via email/password return valid JWT tokens
- [x] Google OAuth token exchange succeeds
- [x] Protected endpoints reject unauthenticated requests with HTTP 401
- [x] Owner-only endpoints reject staff members with HTTP 403
- [x] All API queries automatically scope by `g.store_id` from verified token

## MCP Verification
- Use `supabase` MCP to verify auth user records
- Use `postman-mcp-server` to test protected routes with valid Bearer token, expired token, and missing token

## ⛔ Out of Scope for This Unit
Frontend Auth forms & React Context (21), Rate limiting (22).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

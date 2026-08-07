> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 22 — Security Hardening & Final Audit

## Status
Completed

## Objective
Harden application security across backend and frontend, conduct complete store_id query audit, set up PWA service worker, and verify end-to-end functionality.

## Depends On
- All previous feature spec files (01–21)

## Scope
Security Enhancements:
1. **Flask-Limiter**: Add API rate limiting (5 req/min on `/api/auth/*`, 60 req/min on general API)
2. **CORS & CSP**: Restrict CORS origins in production, inject Content Security Policy meta tags
3. **Input Sanitization**: Strip HTML tags and sanitize string inputs via Pydantic validators
4. **store_id Audit**: Audit every single backend database query to guarantee 100% store isolation
5. **PWA Setup**: `manifest.json`, offline billing fallback cache service worker using `vite-plugin-pwa`
6. **Final Audit**: End-to-end full user journey verification

## Implementation Details
1. Add `flask-limiter` to Flask app factory in `backend/app/__init__.py`.
2. Configure `vite-plugin-pwa` in `frontend/vite.config.ts` to generate PWA manifest and service worker.
3. Conduct grep check across `backend/app/services/*.py` to ensure every SQL query includes `WHERE store_id = ...`.

## Acceptance Criteria
- [x] Excessive API calls hit rate limit and return HTTP 429 Too Many Requests
- [x] Every backend query is verified to enforce `store_id` isolation
- [x] PWA manifest is valid and service worker registers for offline support
- [x] Full end-to-end user flow (Signup -> Stock-in -> Bill POS -> Invoice -> Khata -> Analytics) executes cleanly with passing tests

## MCP Verification
- Use `chrome-devtools-mcp` `lighthouse_audit` to verify PWA and security performance scores
- Use `postman-mcp-server` to run complete API collection test suite
- Use `supabase` MCP to verify database integrity after end-to-end flow execution

## ⛔ Out of Scope for This Unit
Post-MVP features (ONDC integration, Multi-store management).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

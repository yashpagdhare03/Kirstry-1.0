> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 01 — Backend Project Setup

## Status
Completed

## Objective
Scaffold the Flask backend project with Supabase client initialization, folder structure, global error handler, CORS, and health check endpoint.

## Depends On
None — this is the first unit.

## Scope
- Create `backend/` directory with full folder structure per code-standards
- `backend/app/__init__.py` — Flask app factory with CORS, error handler registration, blueprint registration
- `backend/app/config.py` — loads SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, FLASK_SECRET_KEY, FLASK_ENV from .env
- `backend/app/utils/supabase-client.py` — singleton pattern returning initialized Supabase client using service role key
- `backend/app/utils/response-helper.py` — `success_response(data, message, status_code)` and `error_response(message, status_code)` functions returning `{ success: bool, data: ..., message: str }`
- `backend/app/utils/error-handler.py` — registers global error handlers for 400, 401, 403, 404, 500 and unhandled exceptions
- `backend/app/routes/health-routes.py` — Blueprint with `GET /api/health` returning `{ success: true, data: {}, message: "OK" }`
- `backend/run.py` — entry point that calls app factory and runs on port 5000 / 5001
- `backend/requirements.txt` — flask, flask-cors, supabase, python-dotenv, pydantic, reportlab, pytest, gunicorn
- `backend/.env.example` — template with all required env vars
- CORS configured to allow `http://localhost:5173` (Vite dev server)

## Implementation Details
1. Create directories: `backend/app/{models,routes,services,schemas,utils}`, `backend/tests`
2. Implement `config.py` using `python-dotenv`
3. Implement `supabase-client.py` using `create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`
4. Implement `response-helper.py` to standardize JSON responses
5. Implement `error-handler.py` wrapping HTTPException and generic Exception
6. Implement `health-routes.py` with `GET /api/health`
7. Implement `__init__.py` assembling Flask app with `CORS(app, origins=["http://localhost:5173"])`

## Acceptance Criteria
- [x] `backend/` folder structure matches code-standards.md file organization
- [x] `pip install -r requirements.txt` succeeds without errors
- [x] `python run.py` starts Flask server without errors
- [x] `GET /api/health` returns `{ "success": true, "data": {}, "message": "OK" }` with HTTP status 200
- [x] Requesting non-existent route returns `{ "success": false, "data": {}, "message": "..." }` with HTTP status 404
- [x] CORS headers are present on responses

## MCP Verification
- Use `supabase` MCP to verify connection to Supabase project
- Use `postman-mcp-server` to execute `GET /api/health` and verify 200 response

## ⛔ Out of Scope for This Unit
Database tables (02), auth middleware (20), business logic endpoints (03-09).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

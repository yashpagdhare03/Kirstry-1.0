> ⛔ **MANDATORY**: These are mandatory code standards. Every rule in this file is a hard constraint — not a suggestion, not a recommendation. You MUST follow every rule without exception. Code that violates these standards MUST NOT be committed.

# Code Standards

## General

- You MUST keep modules small and single-purpose — one file, one responsibility
- You MUST fix root causes — NEVER layer workarounds
- You MUST NOT mix unrelated concerns in one component or route
- No dead code or commented-out blocks — if it is unused, you MUST delete it
- You MUST prefer composition over inheritance
- All functions and classes MUST have descriptive names — no abbreviations or single letters

## TypeScript

- Strict mode is MANDATORY throughout the project — you MUST NOT disable it
- You MUST NEVER use `any` — use explicit interfaces or narrowly scoped types
- You MUST NEVER use `undefined` or `null` as types — use default values, optional chaining, or sentinel values
- You MUST validate unknown external input (API responses, user input) at system boundaries before trusting it
- Every API service function MUST have explicit return types
- All models MUST be defined in `utils/types/` as TypeScript interfaces
- You MUST use React hooks (`useState`, `useEffect`, `useContext`, `useReducer`, `useMemo`, `useCallback`) for all state and side effects
- All forms MUST use controlled components (`value` + `onChange`) — you MUST NEVER use uncontrolled inputs with refs for form data

> ⛔ **DO NOT**: Use `any` type. Use class components. Use uncontrolled form inputs. Disable TypeScript strict mode.

## React

- Functional components only — you MUST NEVER use class components anywhere in the codebase
- You MUST use hooks (`useState`, `useEffect`, `useContext`, `useReducer`, `useMemo`, `useCallback`) for all state management and side effects
- Route-level code splitting — every feature page MUST be lazy-loaded via `React.lazy()` + `Suspense`
- You MUST NOT place business logic in components — components handle view logic only; all business logic goes through Flask API services
- All forms MUST use controlled components (`value` + `onChange`) — no uncontrolled inputs
- React Router MUST be used for all routing — no other routing library
- Custom hooks MUST live in `hooks/` and MUST be prefixed with `use` (e.g., `useProducts`, `useAuth`)
- React Context MUST be used for global state (auth, store info) — no Redux, Zustand, Jotai, or other state management libraries

> ⛔ **DO NOT**: Use class components. Use Redux/Zustand/Jotai. Place business logic in components. Use any routing library other than React Router.

## Python

- You MUST NOT follow PEP 8 — use a consistent style that prioritizes readability as the developer sees fit
- You MUST use type hints on all function signatures and return types
- You MUST use docstrings on all service functions and route handlers
- You MUST use kebab-case for file names (e.g. `product-service.py`, `auth-route.py`)
- You MUST keep route handlers thin — delegate business logic to service layer
- You MUST use Pydantic models for request body validation on all POST/PUT endpoints

## Styling

- You MUST use CSS custom property tokens defined in `ui-context.md` — NEVER hardcode hex values
- You MUST follow the border radius scale: `6px` small UI, `8px` buttons/inputs, `10px` cards, `14px` modals
- Each component MUST style its own template via co-located `.css` or `.module.css` files — no global component styles
- Global styles (`index.css`) MUST contain only CSS variables, font imports, and resets
- You MUST NOT use inline styles in JSX — all styling goes in the component's CSS file

> ⛔ **DO NOT**: Hardcode hex values. Use inline styles. Put component-specific styles in global CSS. Use arbitrary border radius values.

## API Routes

- You MUST validate and parse request input (via Pydantic) before any logic runs
- You MUST enforce auth and store_id scoping before any mutation — no unauthenticated or cross-store access
- You MUST return consistent response shape: `{ "success": boolean, "data": ..., "message": string }` on every endpoint
- Global exception handler MUST catch all unhandled errors and return: `{ "success": false, "data": {}, "message": "Internal server error" }` with appropriate HTTP status code
- HTTP status codes: 200 (success), 201 (created), 400 (validation error), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error)
- All routes MUST be grouped by domain module — no catch-all route file

## Data and Storage

- Metadata, relationships, and business data belong in Supabase PostgreSQL
- Large generated content (invoice PDFs, product images, barcode photos) belongs in Supabase Storage
- You MUST NOT store file content (images, PDFs) directly in the database — store only the Supabase Storage URL
- Every table MUST have `store_id` — no store-agnostic data except `stores` and `users` tables
- Stock transactions are append-only — NEVER UPDATE or DELETE; corrections are new adjustment entries
- Every stock-out MUST validate available stock before committing — no negative stock allowed

> ⛔ **DO NOT**: Store files in the database. Create tables without `store_id`. Update or delete stock transactions. Allow negative stock.

## File Organization

You MUST follow this exact file organization:

- `frontend/src/components/` — Reusable UI components grouped in `shared/` (buttons, inputs, cards, modals, tables, badges) and feature-specific subdirectories
- `frontend/src/pages/` — Page-level components grouped by domain (auth, dashboard, products, inventory, billing, khata, suppliers, analytics, settings)
- `frontend/src/hooks/` — Custom React hooks (`useAuth`, `useProducts`, `useInventory`, etc.)
- `frontend/src/services/` — API call functions (one file per domain: `auth.ts`, `products.ts`, `inventory.ts`, etc.)
- `frontend/src/context/` — React Context providers (AuthContext, StoreContext, etc.)
- `frontend/src/utils/` — Helpers, constants, types (TypeScript interfaces)
- `frontend/src/assets/` — Static assets, images, fonts
- `backend/app/models/` — SQLAlchemy / Supabase database models
- `backend/app/routes/` — Flask route handlers grouped by domain
- `backend/app/services/` — Business logic layer — no direct DB access from routes
- `backend/app/utils/` — Decorators, validators, external service integrations (Supabase, WhatsApp, barcode lookup)
- `backend/app/schemas/` — Pydantic request validation schemas
- `backend/tests/` — Unit and integration tests

## Git

- You MUST use conventional commits format: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`, `ci:`
- Example: `feat: add product list page with search and filter`
- Example: `fix: resolve negative stock on bulk stock-out`
- Branch naming: `feat/<short-description>`, `fix/<short-description>`, `refactor/<short-description>`

## Testing

- **Backend**: You MUST use `pytest` for unit and integration tests — every service function MUST have at least one test
- **Backend**: You MUST use `pytest` with Flask test client for API integration tests — every endpoint MUST have a happy-path test and an error-case test
- **Frontend**: You MUST use Vitest + React Testing Library for component tests — every component MUST have a basic render test
- Test files sit next to the file they test, using `.test.tsx` suffix (React) or `test_` prefix (Python)
- No merge to `main` without passing tests — enforced via GitHub Actions CI

> ⛔ **DO NOT**: Skip tests. Use Jasmine/Karma/Jest. Merge without passing CI.

---

> ⛔ **REMINDER**: No code that violates these standards may be committed. Every rule in this file is mandatory and non-negotiable.
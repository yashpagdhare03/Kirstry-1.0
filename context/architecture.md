> ⛔ **MANDATORY**: This is the authoritative system architecture. Every technology, boundary, storage rule, and invariant listed here is a hard constraint. You MUST use exactly the technologies specified. You MUST NOT substitute, add, or remove any technology. You MUST NOT violate any invariant listed in this file.

# Architecture Context

## Stack

You MUST use exactly these technologies — no substitutions, no additions:

| Layer     | Technology                  | Role                                                              |
| --------- | --------------------------- | ---------------------------------------------------------------- |
| Framework | React (with Vite)           | Frontend SPA — PWA, UI rendering, routing, hooks, controlled forms |
| Backend   | Python Flask                | REST API server — business logic, routing, external API calls    |
| UI        | CSS (component-level)       | Component-level styling via co-located `.css` or `.module.css` files |
| Auth      | Supabase Auth               | Email/password and Google OAuth — session & token management      |
| Database  | Supabase PostgreSQL         | Primary relational DB — all business data, image URLs, metadata  |
| Storage   | Supabase Storage            | File storage — product images, barcode photos, invoice PDFs      |

> ⛔ **HARD CONSTRAINT**: Supabase is the all-rounder for this project. Supabase Auth handles authentication, Supabase PostgreSQL handles all database needs, and Supabase Storage handles all file storage. You MUST NOT introduce MySQL, MongoDB, Firebase, or any other database or auth provider.

## System Boundaries

- `frontend/` — React application; owns UI rendering, routing (React Router), state (hooks: `useState`, `useContext`, `useReducer`), form handling (controlled components), PWA service worker, offline cache, and all API consumption
- `backend/` — Flask application; owns REST API endpoints, business logic, database queries (Supabase PostgreSQL), external service integrations (Supabase Auth, Supabase Storage, WhatsApp, barcode lookup)
- `frontend/` and `backend/` are two separate folders/repos with no shared code — they MUST communicate exclusively via REST API over HTTP

> ⛔ **HARD CONSTRAINT**: Frontend and backend MUST NEVER share code. They communicate exclusively via REST API. No direct database access from the frontend. No UI rendering from the backend.

## Storage Model

- **Supabase PostgreSQL**: All business data — users, stores, products, stock batches, stock transactions, sales, sale items, customers, credit transactions, suppliers, purchase orders, alerts. Image URLs are stored here but actual image files MUST NOT be stored here.
- **Supabase Storage (Blob/File)**: Product images, barcode photos uploaded by shopkeeper, generated invoice PDFs. Only URLs are persisted in Supabase PostgreSQL.

> ⛔ **HARD CONSTRAINT**: Image files, PDFs, and binary content MUST NEVER be stored in the database. Only Supabase Storage URLs are stored in Supabase PostgreSQL.

## Auth and Access Model

- Every user authenticates via Supabase Auth — supports email/password and Google OAuth only
- You MUST NOT implement mobile OTP, phone authentication, or any other auth method
- A shopkeeper (owner) creates the store and is the store owner with full access
- A shopkeeper can invite staff members who also log in via Supabase Auth — staff are linked to the same store
- Owner has full CRUD on all resources (products, billing, khata, suppliers, settings, staff management)
- Staff members have operational access (inventory, billing, khata) but MUST NOT be able to manage store settings or remove other staff
- Store-level data isolation — every database query MUST be scoped to `store_id`; a user MUST only access data belonging to their own store

## Invariants

You MUST obey every invariant below. Violation of any invariant is a critical defect.

1. No sensitive data (API keys, secrets, credentials) MUST ever be hardcoded — all secrets MUST live in `.env` files on both frontend and backend
2. Passwords MUST NEVER be stored in plaintext — authentication is delegated entirely to Supabase Auth which handles hashing and secure storage
3. Every database query MUST be scoped by `store_id` — no user can read or mutate another store's data
4. All API responses MUST use consistent JSON structure — `{ success: boolean, data: ..., message: string }` — no raw strings or inconsistent formats
5. Every React component MUST be a functional component — no class components anywhere in the codebase
6. All forms MUST use controlled components (`value` + `onChange`) — no uncontrolled inputs using refs for form data
7. TypeScript strict mode MUST be enforced — `any`, `undefined`, and `null` types MUST NEVER be used
8. No business logic MUST live in React components — all logic goes through Flask API services
9. Stock transactions are append-only — NEVER update or delete a stock transaction; corrections are new adjustment entries with a reference to the original
10. Every stock-out operation MUST validate available stock before committing — no negative stock is ever allowed
11. Environment-specific configuration (API URLs, Supabase keys) MUST be injected via Vite environment variables (`.env` files) — NEVER baked into component code

---

> ⛔ **REMINDER**: No architectural change is valid unless this file is updated first. Every technology, boundary, and invariant listed here is mandatory and non-negotiable.
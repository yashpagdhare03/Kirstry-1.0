> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 21 — Auth Frontend (Login, Signup, Route Guards)

## Status
Not Started

## Objective
Implement Login page, Signup page, Store Setup wizard, AuthContext, route guards, and token management in React. The authentication screens MUST be built with a **Mobile-First Responsive Design**, providing centered touch-friendly auth cards on mobile (`<768px`) that scale elegantly on desktop screens (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 20-auth-backend.md

## Scope
Components & Pages:
1. `AuthContext.tsx` + `useAuth.ts` — React Context managing user session, tokens, store ID, and role state
2. `ProtectedRoute.tsx` — Route guard redirecting unauthenticated users to `/login` and new users to `/store-setup`
3. `LoginPage.tsx` (`/login`) — Email/password login form + Google Sign-In button (mobile-first single column card)
4. `SignupPage.tsx` (`/signup`) — Account creation form + Google Sign-In button (mobile-first single column card)
5. `StoreSetupPage.tsx` (`/store-setup`) — Initial store onboarding wizard (name, address, GSTIN)
6. `GoogleSignInButton.tsx` — Supabase OAuth sign-in trigger component

## Implementation Details
1. Configure `@supabase/supabase-js` client in frontend for client-side OAuth redirect handling.
2. In `api.ts`, intercept all outgoing requests to inject `Authorization: Bearer <token>`.
3. Handle 401 API responses by attempting silent token refresh or redirecting to `/login`.
4. Persist auth session token in `localStorage`.
5. Apply mobile-first CSS modules with responsive breakpoints (`@media (min-width: 768px)`).

## Acceptance Criteria
- [ ] Mobile-First Responsive Design: Login, Signup, and Store Setup onboarding cards fit mobile screens (<768px) with zero horizontal scroll and centered desktop layouts (>=768px)
- [ ] Login with email/password authenticates and redirects to `/`
- [ ] Google OAuth sign-in flow completes successfully
- [ ] Signup redirects new user to `/store-setup` onboarding wizard
- [ ] `ProtectedRoute` blocks unauthenticated access to app pages
- [ ] Session persists across page refreshes

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to test Mobile (375px) and Desktop (1440px) viewports
- Use `chrome-devtools-mcp` to test complete login -> store setup -> dashboard workflow
- Use `chrome-devtools-mcp` to inspect Network headers and verify `Authorization: Bearer` token present

## ⛔ Out of Scope for This Unit
Mobile OTP (explicitly removed from scope), Rate limiting & CSP (22).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

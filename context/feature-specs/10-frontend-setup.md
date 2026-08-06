> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`, `backend/README.md`.

# 10 — Frontend Project Setup & Design System

## Status
Not Started

## Objective
Scaffold the React + Vite + TypeScript project and implement the design system with CSS custom properties and shared components.

## Depends On
None — frontend can be scaffolded independently.

## Scope
- Create `frontend/` using Vite React-TS template
- Set up `frontend/src/index.css` with dark theme design tokens from `ui-context.md`
- Create shared components in `frontend/src/components/shared/`:
  `Button`, `Input`, `Card`, `Modal` (Radix UI), `Table`, `Badge`, `EmptyState`, `Skeleton`, `SearchInput`
- Create API fetch wrapper `frontend/src/services/api.ts`
- Create TypeScript interfaces in `frontend/src/utils/types/`
- Set up Vite env configuration (`.env.example`) and React Router shell in `App.tsx`

## Implementation Details
1. Run `npx -y create-vite@latest frontend --template react-ts`
2. Install packages: `react-router-dom`, `lucide-react`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-select`, `recharts`
3. Configure Vitest + React Testing Library for frontend testing
4. Build shared components using CSS module files co-located with `.tsx` files
5. Implement `api.ts` wrapper adding `Content-Type: application/json` and token headers

## Acceptance Criteria
- [ ] `npm run dev` starts dev server on port 5173
- [ ] `index.css` defines all tokens (`--bg-base`, `--bg-surface`, `--accent-primary`, etc.)
- [ ] Shared components render clean monochrome design matching `ui-context.md`
- [ ] TypeScript strict mode compiles without errors
- [ ] `npm run build` succeeds cleanly

## MCP Verification
- Use `chrome-devtools-mcp` to navigate to `localhost:5173` and capture screenshot of design tokens
- Use `chrome-devtools-mcp` to verify dark mode styling and typography

## ⛔ Out of Scope for This Unit
Page layouts (11), page components (12-19), auth context (21).

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

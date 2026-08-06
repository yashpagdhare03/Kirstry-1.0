> ⛔ **MANDATORY**: Implement ONLY what is specified in this file. Do not add features, skip steps, or modify the scope. Every item marked MUST is a hard requirement. Read all context files before starting: `context/project-overview.md`, `context/architecture.md`, `context/ui-context.md`, `context/code-standards.md`, `context/ai-workflow-rules.md`, `context/progress-tracker.md`.

# 16 — Digital Khata (Customer Credit) Pages

## Status
Not Started

## Objective
Implement customer list, customer detail view with transaction timeline, credit/payment modal forms, and outstanding balances report. The layout MUST be built with a **Mobile-First Responsive Design**, optimizing customer lists and timeline cards for easy mobile interaction (`<768px`) and scaling to multi-column desktop dashboards (`>=768px`).

## Depends On
- 10-frontend-setup.md
- 11-layout-navigation.md
- 06-khata-api.md

## Scope
Pages to create:
1. `CustomerListPage.tsx` (`/khata`) — Directory of customers with current outstanding balance (Mobile: stacked customer card list / touch-friendly rows; Desktop: data table)
2. `AddCustomerPage.tsx` (`/khata/add`) — Customer creation form (mobile-first single column)
3. `CustomerDetailPage.tsx` (`/khata/:customer_id`) — Customer stats, transaction timeline, and "Add Credit" / "Record Payment" modals (responsive touch bottom-sheets / dialogs)
4. `OutstandingPage.tsx` (`/khata/outstanding`) — Report of all customers with positive credit balances

## Implementation Details
1. Timeline view displaying credit transactions in `--state-error` and payments in `--state-success`.
2. Payment modal pre-validating that `payment_amount <= outstanding_balance`.
3. Highlight overdue credits past `due_date`.
4. Apply mobile-first CSS modules with responsive breakpoints (`@media (min-width: 768px)`).

## Acceptance Criteria
- [ ] Mobile-First Responsive Design: Khata customer directory, detail timelines, and payment modals fit mobile screens (<768px) with touch-friendly targets and scale seamlessly on desktop
- [ ] Customer list accurately displays net outstanding balances
- [ ] Customer detail displays chronological credit/payment timeline
- [ ] Add Credit modal creates credit record and updates balance
- [ ] Record Payment modal prevents entering amounts greater than total balance

## MCP Verification
- Use `chrome-devtools-mcp` `resize_page` to test Mobile (375px) and Desktop (1440px) viewports
- Use `chrome-devtools-mcp` to test adding customer -> adding credit -> recording payment
- Use `chrome-devtools-mcp` screenshot of customer detail timeline and outstanding report page across mobile and desktop breakpoints

## ⛔ Out of Scope for This Unit
Automated SMS/WhatsApp payment reminder sending.

---

> ⛔ **REMINDER**: Do not implement anything outside the scope of this file. Do not skip any acceptance criterion. Update `context/progress-tracker.md` when this unit is complete.

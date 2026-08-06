> ⛔ **MANDATORY**: You MUST read every file listed below, in the exact order shown, before writing any code, making any architectural decision, or implementing any feature. These context files are the **single source of truth** for this project. You MUST NOT deviate from, override, or contradict any instruction found in these files.

## Application Building Context

You MUST read the following files in this exact order before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture.md` — system structure, boundaries, storage model, and invariants
3. `context/ui-context.md` — theme, colors, typography, and component conventions
4. `context/code-standards.md` — implementation rules and conventions
5. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps

You MUST update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, you MUST update the relevant file before continuing.

## MCP Tools Rule

- You MUST use available MCP tools (`chrome-devtools-mcp`, `postman-mcp-server`, `supabase`, `github-mcp-server`) proactively to enhance testing, browser automation, API verification, code auditing, and database checks whenever helpful.
- If additional MCP tools are required to improve project capabilities, request the user to integrate them.

---

> ⛔ **REMINDER**: No implementation begins without reading all context files first. No context file may be contradicted or overridden.

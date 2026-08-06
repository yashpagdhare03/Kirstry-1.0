# MCP Server Configuration & Rules for Kirstry

> ⛔ **MANDATORY**: You MUST proactively use the registered MCP tools at each phase of development. Every feature spec includes explicit MCP verification steps that MUST be executed and verified before marking a unit as complete.

## 1. Supabase MCP Server (`supabase`)
- **Project Name**: `Kirstry`
- **Project Ref**: `cssmoybkdzoxbntcrzfj`
- **Region**: `ap-south-1`
- **Mandatory Usage**:
  - Run database migrations using `execute_sql` or `apply_migration`
  - Verify table structures and foreign keys using `list_tables`
  - Generate TypeScript models using `generate_typescript_types`
  - Verify stored row data during backend feature verification

## 2. Postman MCP Server (`postman-mcp-server`)
- **Account**: `ypagdhare2511`
- **Mandatory Usage**:
  - Create and maintain the "Kirstry API" Postman collection via `createCollection`
  - Execute API endpoint tests via `runCollection`
  - Store environment variables (base URL, auth tokens) via `createEnvironment`

## 3. Chrome DevTools MCP (`chrome-devtools-mcp`)
- **Target URL**: `http://localhost:5173`
- **Mandatory Usage**:
  - Verify UI layouts, design tokens, dark mode, and responsiveness using `navigate_page` and `take_screenshot`
  - Inspect browser console errors using `list_console_messages`
  - Audit network requests using `list_network_requests`
  - Run security and performance audits using `lighthouse_audit`

## 4. GitHub MCP Server (`github-mcp-server`)
- **Account**: `yashpagdhare03`
- **Mandatory Usage**:
  - Audit committed code for hardcoded secrets or credentials via `search_code`
  - Manage feature branches and pull requests via `create_branch` and `create_pull_request`

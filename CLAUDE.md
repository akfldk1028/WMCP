# WebMCP Business Projects

## Project Structure
This is a pnpm monorepo for multiple WebMCP money-making projects.

## Key Directories
- `docs/` - Learning documentation (Korean)
- `webmcp/` - Original WebMCP spec (GitHub clone)
- `packages/` - Shared libraries (core types, scanner engine, MCP bridge)
- `projects/` - Individual products (CLI, scanner, dashboard, demo, plugins)
- `workflows/` - n8n automation modules
- `scripts/` - Build/deploy utilities

## Tech Stack
- Runtime: Node.js 20+
- Package Manager: pnpm (workspaces)
- Language: TypeScript
- Framework: Next.js (web apps), Commander (CLI)
- Testing: Vitest
- Polyfill: @mcp-b/global (WebMCP before Chrome native)

## Business Priority Order
1. `mcp2web-cli` - MCP to WebMCP converter (fastest to market)
2. `wmcp-scanner` - Site compatibility auditor
3. `wmcp-demo` - Demo sites for consulting/marketing
4. `wmcp-dashboard` - Analytics SaaS (later)
5. `wmcp-wp-plugin` - WordPress plugin (later)

## Commands
- `pnpm install` - Install all dependencies
- `pnpm -r build` - Build all packages
- `pnpm --filter mcp2web-cli dev` - Run specific project

## n8n Workflows
Export JSON files in `workflows/` - import into n8n for automation.

## Memory
Persistent memory at `~/.claude/projects/D--Data-28-WMCP/memory/`

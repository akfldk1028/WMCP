# @wmcp/bizscope-mcp

BizScope AI MCP server for Claude Code — 33-section business analysis with real-time web research.

## Setup (one command)

```bash
claude mcp add bizscope -- npx -y @wmcp/bizscope-mcp
```

With API key:

```bash
claude mcp add bizscope -- npx -y @wmcp/bizscope-mcp --key YOUR_KEY
```

Or via environment variable:

```bash
export BIZSCOPE_API_KEY=your_key
claude mcp add bizscope -- npx -y @wmcp/bizscope-mcp
```

## What you get

38 MCP tools:

| Category | Count | Examples |
|----------|-------|---------|
| Company Analysis | 18 | company-overview, pest-analysis, swot-summary |
| Idea Validation | 15 | idea-overview, market-size, action-plan |
| Utilities | 5 | web-search, financial-data, stock-history |

## Usage

After setup, just ask Claude:

- "Analyze Samsung Electronics"
- "Validate my startup idea for an AI tutoring app"
- "Run a SWOT analysis on Apple"

## Links

- [BizScope AI](https://bizscope-rho.vercel.app)
- [Plugin](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/bizscope-ai)

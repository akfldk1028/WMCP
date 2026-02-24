# ShopGuard Agent Configuration

## Installation (Auto-Discovery)

### Claude Code (Marketplace)
```bash
/plugin marketplace add akfldk1028/WMCP
/plugin install shopguard-full@shopguard-marketplace
```

Skills auto-activate when users ask about shopping safety, reviews, or pricing.

### Codex (OpenAI)
```bash
git clone https://github.com/akfldk1028/WMCP.git ~/.codex/wmcp
mkdir -p ~/.agents/skills
ln -s ~/.codex/wmcp/projects/shopguard/skills ~/.agents/skills/shopguard
```

### OpenCode
```bash
git clone https://github.com/akfldk1028/WMCP.git ~/.config/opencode/wmcp
mkdir -p ~/.config/opencode/skills ~/.config/opencode/plugins
ln -s ~/.config/opencode/wmcp/projects/shopguard/skills ~/.config/opencode/skills/shopguard
ln -s ~/.config/opencode/wmcp/projects/shopguard/.opencode/plugins/shopguard.js ~/.config/opencode/plugins/shopguard.js
```

### Manual (any platform)
Add MCP server to your config:
```json
{
  "mcpServers": {
    "shopguard": {
      "command": "npx",
      "args": ["shopguard-mcp"]
    }
  }
}
```

## MCP Server

ShopGuard runs as an MCP (Model Context Protocol) server that any AI agent can connect to.

```bash
npx shopguard-mcp
```

## Tools (7)

| Tool | Description |
|------|------------|
| `extractPageData` | Page overview — platform detection, price contexts, review blocks |
| `extractReviews` | Review extraction + 7 statistical fraud signals |
| `extractPricing` | Hidden fee detection + subscription trap analysis |
| `scanDarkPatterns` | 9 dark pattern categories with evidence |
| `compareReviewSets` | Cross-platform review comparison |
| `comparePrices` | Multi-source price comparison with outlier detection |
| `detectAgentReadiness` | Structured data / agent-readiness signals |

## Resources (3)

| URI | Content |
|-----|---------|
| `shopguard://catalog/dark-patterns` | 9 dark pattern types (KO+EN) |
| `shopguard://catalog/pricing-tactics` | 8 pricing tactics |
| `shopguard://catalog/review-indicators` | 6 fake review heuristics |

## Prompts (3)

| Prompt | Workflow |
|--------|---------|
| `analyze-shopping-page` | Full page analysis (Steps 1-6) |
| `verify-reviews` | Review authenticity deep-dive |
| `price-check` | Price transparency audit |

## Skills (5)

Located in `skills/` directory. Registered in `.claude-plugin/marketplace.json`.

| Skill | Role |
|-------|------|
| `shopguard` | Root — tool catalog + core workflow |
| `shopguard-audit` | Full page 4-phase chained analysis |
| `review-verify` | 7-signal review authenticity |
| `price-check` | Hidden fee + subscription trap |
| `dark-pattern-scan` | 9 deceptive UI pattern categories |

## Plugins

| Plugin | Skills | Use Case |
|--------|--------|----------|
| `shopguard-full` | All 5 skills | Complete protection |
| `shopguard-lite` | Root + audit only | Lightweight option |

## Automation Scripts

| Script | Usage |
|--------|-------|
| `audit-url.mjs` | `node skills/scripts/audit-url.mjs <url>` — Full page audit |

## Agent Workflow

```
User: "이 상품 안전해?" / "Is this product safe?"
    ↓ Skill trigger: shopguard-audit (auto-discovered via marketplace)
    ↓
Phase 1: Capture page (WebFetch / Playwright)
Phase 2: shopguard:extractPageData → platform, reviews, prices
Phase 3: shopguard:scanDarkPatterns (MANDATORY)
       + shopguard:extractReviews (if reviews found)
       + shopguard:extractPricing (if prices found)
Phase 4: Synthesize → evidence-based report
    ↓
User receives structured report with specific evidence
```

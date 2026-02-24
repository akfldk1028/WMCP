# shopguard-mcp

AI shopping protection MCP server. Detects fake reviews, hidden fees, and dark patterns on shopping pages.

## Features

- **7 MCP Tools** for structured evidence extraction
- **3 Resources** — catalogs for dark patterns, pricing tactics, review indicators
- **3 Prompts** — guided workflows for page analysis, review verification, price checking
- Works with Claude Desktop, Cursor, and any MCP-compatible client

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shopguard": {
      "command": "npx",
      "args": ["shopguard-mcp"],
      "env": {
        "SHOPGUARD_TIER": "pro"
      }
    }
  }
}
```

### Direct

```bash
npx shopguard-mcp
```

## Tools

| Tool | Tier | Description |
|------|------|-------------|
| `extractPageData` | Free | Extract meta, prices, reviews, CTAs from HTML |
| `extractReviews` | Pro | Extract reviews + 7 statistical signals with evidence |
| `extractPricing` | Pro | Extract price components, hidden fees, subscription traps |
| `scanDarkPatterns` | Free | Detect 9 types of dark patterns with evidence |
| `compareReviewSets` | Pro | Compare reviews across two sources |
| `comparePrices` | Pro | Compare fee-inclusive prices across sources |
| `detectAgentReadiness` | Free | Detect Schema.org, OpenGraph, agent manifests |

### Tier Gating

Set `SHOPGUARD_TIER=pro` to unlock all 7 tools. Default is `free` (3 tools).

## Review Signals (7)

1. **Date clustering** — reviews bunched in short time windows
2. **Rating anomaly** — average deviates from expected distribution
3. **Phrase repetition** — identical phrases across reviews
4. **Length uniformity** — suspiciously similar review lengths
5. **Incentive keywords** — "free product", "discount code", etc.
6. **Rating surge** — sudden spike in review volume
7. **AI generation** — patterns suggesting LLM-generated text

## Dark Patterns (9)

Urgency, social proof, confirm-shaming, misdirection, preselection, forced continuity, obstruction, hidden costs, privacy zuckering.

## Programmatic Usage

```typescript
import { extractReviewSignals } from 'shopguard-mcp/signals';
import { extractPageData } from 'shopguard-mcp/extractors';

const signals = extractReviewSignals(reviews, 'en');
const pageData = extractPageData(html);
```

## License

MIT

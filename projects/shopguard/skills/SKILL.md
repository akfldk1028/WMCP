---
name: shopguard
description: >
  AI shopping protection skill — detects fake reviews, hidden fees, and dark patterns
  on e-commerce pages. Activate when users ask about product safety, review authenticity,
  pricing transparency, or checkout fairness.
version: 0.4.0
homepage: https://github.com/akfldk1028/WMCP
metadata:
  mcp_server: shopguard
  install:
    - id: npx
      kind: npx
      package: shopguard-mcp
      label: "Run via npx (no install)"
    - id: npm
      kind: npm
      package: shopguard-mcp
      label: "Install globally"
---

# ShopGuard — AI Shopping Protection

ShopGuard protects consumers from deceptive e-commerce practices. It provides evidence-based analysis of shopping pages through 7 specialized MCP tools, 3 domain knowledge catalogs, and multi-step agentic workflows.

## When to Activate

Activate this skill when the user:
- Asks "is this product safe to buy?" or "are these reviews real?"
- Wants to check a shopping page for scams, dark patterns, or hidden fees
- Mentions product reviews, pricing transparency, or checkout safety
- Shares a shopping URL (Amazon, Coupang, eBay, AliExpress, etc.)
- Says "analyze this page" or "check this store" in a shopping context

**Trigger keywords**: shopping, product, review, price, checkout, dark pattern, scam, fake review, hidden fee, trust, safety, e-commerce, 리뷰, 가격, 다크패턴, 쇼핑

## Prerequisites

### Claude Code (Recommended)
Add to your MCP config (`~/.claude/claude_desktop_config.json` or project `.mcp.json`):

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

### Cursor / Windsurf
Add the same MCP config to your editor's settings.

### Manual
```bash
npx shopguard-mcp
```

## Available Tools

All tools are accessed via the `shopguard` MCP server prefix.

| Tool | Purpose | Input |
|------|---------|-------|
| `shopguard:extractPageData` | Page overview — platform, prices, reviews, elements | HTML, URL |
| `shopguard:extractReviews` | Review extraction + 7 statistical fraud signals | HTML or review blocks |
| `shopguard:extractPricing` | Hidden fee detection + subscription trap analysis | HTML |
| `shopguard:scanDarkPatterns` | 9 dark pattern types with evidence | Text + HTML |
| `shopguard:compareReviewSets` | Cross-platform review comparison | Two review sets |
| `shopguard:comparePrices` | Multi-source price comparison with outlier detection | Price sources |
| `shopguard:detectAgentReadiness` | Structured data / agent-readiness signals | HTML |

## Available Resources

Read these catalogs for domain knowledge before analysis:

- `shopguard://catalog/dark-patterns` — 9 dark pattern types with definitions and examples (KO+EN)
- `shopguard://catalog/pricing-tactics` — 8 pricing tactics with detection methods
- `shopguard://catalog/review-indicators` — 6 fake review heuristics with thresholds

## Core Workflow

When a user asks you to analyze a shopping page:

### Step 1: Page Overview
Call `shopguard:extractPageData` with the page HTML. This identifies the platform, finds price contexts, review blocks, and interactive elements.

### Step 2: Dark Pattern Scan

<HARD-GATE>
ALWAYS run dark pattern scan. This step is non-negotiable — never skip it,
even if the page looks legitimate or the user only asked about reviews.
</HARD-GATE>

Call `shopguard:scanDarkPatterns` — urgency, fake social proof, confirm-shaming, preselection, obstruction.

### Step 3: Price Analysis (if prices found)
Call `shopguard:extractPricing` if Step 1 found price contexts. Look for hidden fees, subscription traps, drip pricing.

### Step 4: Review Analysis (if reviews found)
Call `shopguard:extractReviews` if Step 1 found review blocks. The tool returns 7 statistical signals:
- Date clustering, rating anomaly, phrase repetition
- Length uniformity, incentive keywords, rating surge
- AI-generated content detection

### Step 5: Synthesize

<HARD-GATE>
ALWAYS present evidence with specific quotes from the page.
NEVER assign trust grades without supporting evidence.
NEVER say "this product is safe" — say "no concerning signals were detected."
</HARD-GATE>

Combine all evidence. Cross-reference findings (fake urgency + hidden fees = high concern).

## Guidelines

1. **Present evidence, not verdicts** — quote specific page elements, let users decide
2. **Always run dark pattern scan** — even if the page looks legitimate
3. **Cross-reference signals** — individual signals are weak; combinations are strong
4. **Consider context** — some fees are standard for certain platforms (e.g., 배송비 in Korean e-commerce)
5. **Note limitations** — you cannot detect dynamic pricing from a single visit
6. **Respect sample size** — signals from 3 reviews are weaker than from 50
7. **Incentivized ≠ fake** — disclosed sponsorship is a positive transparency signal

## Sub-Skills

For focused analysis, see:
- `shopguard-audit` — Full shopping page audit workflow
- `review-verify` — Deep review authenticity analysis
- `price-check` — Price transparency and hidden fee detection
- `dark-pattern-scan` — Dark pattern evidence collection

## Integration

Works alongside:
- Browser automation skills (Playwright, Puppeteer) for capturing dynamic shopping pages
- Web fetch skills for retrieving static page HTML
- File system skills for saving evidence reports

---

## Skill Metadata

**Created**: 2026-02-24
**Last Updated**: 2026-02-24
**Author**: ClickAround (akfldk1028)
**Version**: 0.4.0

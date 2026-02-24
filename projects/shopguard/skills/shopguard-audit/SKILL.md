---
name: shopguard-audit
description: >
  Full shopping page audit — runs all ShopGuard MCP tools in sequence to produce
  a comprehensive safety assessment. Use when analyzing a complete product page.
version: 0.4.0
---

# ShopGuard Audit — Full Page Analysis

Complete shopping page analysis workflow that chains all ShopGuard MCP tools in the optimal sequence. Produces a comprehensive evidence report covering reviews, pricing, and dark patterns.

## When to Activate

- User shares a shopping URL and asks for a full analysis
- User says "audit this page", "is this safe?", "check this product"
- User wants a comprehensive assessment before making a purchase

## Workflow

### Phase 1: Capture (if needed)

If the user provides a URL but not HTML:
1. Use browser automation (Playwright/Puppeteer) or `WebFetch` to capture the page
2. Wait for dynamic content to load (many shopping sites use client-side rendering)
3. Capture both the rendered HTML and visible text

### Phase 2: Overview

```
Call: shopguard:extractPageData({ html, url })
```

Read the response to determine what's on the page:
- If `reviewBlocks` count > 0 → queue review analysis
- If `priceContexts` count > 0 → queue price analysis
- Note the detected `platform` for context-aware assessment

### Phase 3: Evidence Collection

<HARD-GATE>
Dark pattern scan is MANDATORY. Never skip this step, regardless of what
the user asked for. Run it even if reviews look clean and prices seem fair.
</HARD-GATE>

**Always:**
```
Call: shopguard:scanDarkPatterns({ content: visibleText, html })
```

**If reviews found:**
```
Call: shopguard:extractReviews({ html, locale: "ko" or "en" })
```

**If prices found:**
```
Call: shopguard:extractPricing({ html })
```

### Phase 4: Synthesis

<HARD-GATE>
Present ALL findings before making any recommendation.
Never auto-proceed with purchases or suggest "this is safe" without evidence.
</HARD-GATE>

Combine all evidence into a structured report. See `references/evidence-format.md` for the template.

## Safety Gates

1. **Preview before action** — Show the analysis report; never auto-proceed with purchases
2. **Disclose uncertainty** — If evidence is weak or sample is small, say so explicitly
3. **No false reassurance** — Absence of evidence is not evidence of absence

## Anti-Patterns

- Do NOT assign letter grades (A-F) unless the user specifically asks
- Do NOT say "this product is safe" — say "no concerning signals were detected"
- Do NOT ignore dark patterns just because reviews look good
- Do NOT present a single flagged review signal as definitive proof of fraud

## Error Recovery

- If `shopguard:extractPageData` fails → page HTML may be malformed; try with `WebFetch` to re-capture
- If `shopguard:extractReviews` returns empty → reviews may be client-rendered; try browser automation
- If all tools return clean → explicitly state "no signals detected" with limitations caveat

## References

- `references/evidence-format.md` — structured report template
- `shopguard://catalog/dark-patterns` for dark pattern type definitions
- `shopguard://catalog/pricing-tactics` for pricing tactic detection methods
- `shopguard://catalog/review-indicators` for fake review heuristic thresholds

---

## Skill Metadata

**Created**: 2026-02-24
**Last Updated**: 2026-02-24
**Author**: ClickAround (akfldk1028)
**Version**: 0.4.0

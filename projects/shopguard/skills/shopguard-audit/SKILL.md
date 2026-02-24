---
name: shopguard-audit
description: >
  Full shopping page audit — runs all ShopGuard tools in sequence to produce
  a comprehensive safety assessment. Use when analyzing a complete product page.
version: 0.4.0
---

# ShopGuard Audit — Full Page Analysis

Complete shopping page analysis workflow that chains all ShopGuard tools in the optimal sequence. Produces a comprehensive evidence report covering reviews, pricing, and dark patterns.

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
Call: extractPageData({ html, url })
```

Read the response to determine what's on the page:
- If `reviewBlocks` count > 0 → queue review analysis
- If `priceContexts` count > 0 → queue price analysis
- Note the detected `platform` for context-aware assessment

### Phase 3: Evidence Collection (parallel when possible)

Run these tools based on Phase 2 findings:

**Always:**
```
Call: scanDarkPatterns({ content: visibleText, html })
```

**If reviews found:**
```
Call: extractReviews({ html, locale: "ko" or "en" })
```

**If prices found:**
```
Call: extractPricing({ html })
```

### Phase 4: Synthesis

Combine all evidence into a structured report:

```
## Page: [product name] on [platform]

### Dark Patterns
[List each finding with evidence quote]

### Pricing
[Hidden fees, traps, transparency assessment]

### Reviews
[Statistical signals, flagged indicators]

### Cross-References
[Combinations that amplify concern]

### Recommendations
[Specific, actionable advice for the user]

### Limitations
[What could NOT be determined from this single analysis]
```

## Safety Gates

1. **Preview before action** — Show the analysis report; never auto-proceed with purchases
2. **Disclose uncertainty** — If evidence is weak or sample is small, say so explicitly
3. **No false reassurance** — Absence of evidence is not evidence of absence

## Anti-Patterns

- Do NOT assign letter grades (A-F) unless the user specifically asks
- Do NOT say "this product is safe" — say "no concerning signals were detected"
- Do NOT ignore dark patterns just because reviews look good
- Do NOT present a single flagged review signal as definitive proof of fraud

## References

- `shopguard://catalog/dark-patterns` for dark pattern type definitions
- `shopguard://catalog/pricing-tactics` for pricing tactic detection methods
- `shopguard://catalog/review-indicators` for fake review heuristic thresholds

---

## Skill Metadata

**Created**: 2026-02-24
**Last Updated**: 2026-02-24
**Author**: ClickAround (akfldk1028)
**Version**: 0.4.0

---
name: price-check
description: >
  Price transparency analysis — detects hidden fees, subscription traps,
  and drip pricing. Activate when users ask about pricing fairness, hidden
  charges, or want to compare prices across stores.
version: 0.4.0
---

# Price Check — Transparency Analysis

Detects deceptive pricing tactics including hidden fees revealed only at checkout, subscription traps disguised as free trials, and drip pricing that incrementally increases the total.

## When to Activate

- User asks "are there hidden fees?" or "what's the real price?"
- User wants to compare prices across multiple stores
- User mentions subscription traps, auto-renewal, or free trial concerns
- User is about to checkout and wants to verify pricing

## Workflow

### Step 1: Extract Pricing
```
Call: shopguard:extractPricing({ html })
```

Returns:
- `components` — all detected price elements with context
- `feeMatches` — hidden fee patterns with surrounding text (100 char window)
- `trapMatches` — subscription/continuity trap patterns

### Step 2: Analyze Fee Matches
For each fee match:
- Read the `context` field — is the fee clearly disclosed or buried?
- Check `nearbyPrice` — what amount is associated?
- Determine if the fee is **standard** for this platform (e.g., 배송비 in Korean e-commerce)

### Step 3: Analyze Trap Matches
For each trap:
- Identify type: `introductory-price-hike`, `free-trial-auto-charge`, `auto-renewal`
- Check how clearly the conversion terms are disclosed
- Note if cancellation process is mentioned

### Step 4: Multi-Source Comparison (if available)
```
Call: shopguard:comparePrices({ sources: [...] })
```

Returns: cheapest/most expensive, spread percentage, statistical outliers.

### Step 5: Report

<HARD-GATE>
ALWAYS calculate and present the estimated TOTAL price including all detected fees.
Compare this with the advertised price to show the real cost difference.
</HARD-GATE>

- List all fees with amounts and disclosure quality
- Calculate estimated total vs. advertised price
- Flag traps with specific evidence
- Recommend what to watch for at checkout

## Common Pricing Tactics

Read `shopguard://catalog/pricing-tactics` for the full catalog. Key ones:

- **Hidden fees**: Service/handling/platform fees not in advertised price
- **Drip pricing**: Price increases through checkout funnel
- **Subscription traps**: Free trial → auto-charge with unclear terms
- **Bait-and-switch**: Advertised item unavailable, redirect to pricier option

## Guidelines

1. Some fees are legitimate — the issue is **transparency**, not existence
2. Regional norms vary (배송비, sales tax, VAT handling differs by country)
3. Drip pricing requires seeing multiple checkout stages — note if you only see one
4. "Starting from" prices are not inherently deceptive but warrant investigation

---

## Skill Metadata

**Created**: 2026-02-24
**Last Updated**: 2026-02-24
**Author**: ClickAround (akfldk1028)
**Version**: 0.4.0

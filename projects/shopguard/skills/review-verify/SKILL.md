---
name: review-verify
description: >
  Deep review authenticity analysis using 7 statistical signals.
  Activate when users ask about fake reviews, review manipulation, or
  want to verify if product reviews are genuine.
version: 0.4.0
---

# Review Verify — Authenticity Analysis

Multi-signal review verification that goes beyond simple sentiment analysis. Uses 7 statistical heuristics to detect review manipulation campaigns, AI-generated content, and incentivized reviews.

## When to Activate

- User asks "are these reviews real?" or "can I trust these reviews?"
- User mentions fake reviews, paid reviews, review bombing
- User wants to compare reviews across platforms
- User notices suspicious review patterns

## Statistical Signals

The `extractReviews` tool returns 7 signals, each with evidence:

| Signal | What It Detects | Strong When |
|--------|----------------|-------------|
| `dateCluster` | Reviews posted on the same day | >40% on one date |
| `ratingAnomaly` | Unnatural rating distribution | >90% five-star |
| `phraseRepetition` | Shared exact phrases across reviews | >10% shared 3-grams |
| `lengthUniformity` | Suspiciously similar review lengths | CV < 0.15 |
| `incentiveKeywords` | Sponsored/gifted review disclosure | >15% with keywords |
| `ratingSurge` | Sudden spikes of positive reviews | >15% surge weeks |
| `aiGeneration` | AI-generated text patterns | Low burstiness + low TTR |

## Workflow

### Step 1: Extract
```
Call: extractReviews({ html, locale })
```

### Step 2: Assess Signal Strength
For each flagged signal, check:
- **Evidence string** — what specifically was detected
- **Sample size** — is n=5 or n=500? This matters enormously
- **Combination strength** — individual signals are weak; 3+ signals together are strong

### Step 3: Cross-Platform (optional)
If reviews from two sources are available:
```
Call: compareReviewSets({ sourceA, sourceB, locale })
```
Look for: rating gaps, duplicate texts, sentiment mismatches.

### Step 4: Report
Present findings per-signal with evidence quotes. Use hedging language:
- "This pattern is consistent with..." (not "this proves...")
- "X out of Y reviews show..." (not "the reviews are fake")

## Signal Combinations

Strong fraud indicators (3+ signals):
- Date clustering + phrase repetition + length uniformity = likely coordinated campaign
- Rating anomaly + rating surge + AI generation = likely paid reviews

Weak signals alone:
- Incentive keywords alone = could be legitimate disclosure
- Single date cluster = could be product launch day

## Guidelines

1. Never call reviews "fake" — say "signals consistent with manipulation"
2. Always state sample size when reporting
3. Incentivized reviews that disclose sponsorship are actually a positive signal
4. Consider platform norms (Korean platforms have different review culture than US)
5. AI-generated detection has false positives — non-native English writers may trigger it

---

## Skill Metadata

**Created**: 2026-02-24
**Last Updated**: 2026-02-24
**Author**: ClickAround (akfldk1028)
**Version**: 0.4.0

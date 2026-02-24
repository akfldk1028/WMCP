---
name: dark-pattern-scan
description: >
  Dark pattern detection — identifies 9 types of deceptive UI patterns including
  fake urgency, confirm-shaming, and forced continuity. Activate when users ask
  about manipulative design, consent tricks, or checkout pressure tactics.
version: 0.4.0
---

# Dark Pattern Scan — Deceptive UI Detection

Detects 9 categories of dark patterns in e-commerce pages. Each detection includes the specific HTML/text evidence so users can verify the finding themselves.

## When to Activate

- User asks about dark patterns, manipulative design, or deceptive UX
- User feels pressured by a checkout flow
- User notices suspicious urgency timers, pre-checked boxes, or shaming language
- User wants to audit a page for consumer protection compliance

## Dark Pattern Types

| Type | Risk | What to Look For |
|------|------|-----------------|
| `fake-urgency` | medium | Countdown timers, "only X left", limited time offers |
| `fake-social-proof` | medium | "Y people viewing", fake purchase notifications |
| `confirm-shaming` | high | "No thanks, I hate saving money" style decline buttons |
| `misdirection` | medium | Giant "Accept" vs tiny "Manage preferences" |
| `preselection` | medium | Pre-checked newsletter, premium shipping defaults |
| `forced-continuity` | high | Free trial → auto-charge without clear notice |
| `obstruction` | critical | Cancellation requires phone call, written letter |
| `hidden-costs` | high | Fees revealed only at checkout |
| `privacy-zuckering` | high | Confusing consent flows that trick data sharing |

## Workflow

### Step 1: Scan
```
Call: shopguard:scanDarkPatterns({ content: pageVisibleText, html: pageHtml })
```

The `content` parameter captures urgency language and shaming text.
The `html` parameter enables checkbox analysis and DOM structure detection.

### Step 2: Contextualize
For each match:
- Read the evidence quote — is it genuinely manipulative or a legitimate feature?
- Consider the platform norm — countdown timers on flash sale sites are expected
- Check severity — `critical` patterns (obstruction) deserve more attention than `medium`

### Step 3: Cross-Reference
Dark patterns are more concerning in combination:
- Fake urgency + hidden costs = pressure to buy before seeing real price
- Preselection + misdirection = user likely doesn't notice the default
- Confirm-shaming + forced continuity = emotional manipulation into subscription

### Step 4: Report

<HARD-GATE>
ALWAYS quote the specific evidence for every dark pattern finding.
Generic statements like "the page uses urgency tactics" without evidence are NOT acceptable.
Every finding MUST include the exact text or described UI element from the page.
</HARD-GATE>

Present each finding with:
- The dark pattern type and risk level
- The exact evidence (quoted text or described UI element)
- Context (is this standard for the platform or genuinely deceptive?)
- What the user should do (uncheck, read fine print, compare alternatives)

## Guidelines

1. Not every urgency indicator is a dark pattern — legitimate sales have real deadlines
2. Pre-checked boxes for required terms are different from opt-in marketing pre-checks
3. Consider jurisdiction — EU GDPR has specific rules about consent patterns
4. Always quote the specific evidence
5. Obstruction is the most serious pattern — difficulty cancelling is always a red flag

## Resource

Read `shopguard://catalog/dark-patterns` for full definitions with Korean and English examples.

---

## Skill Metadata

**Created**: 2026-02-24
**Last Updated**: 2026-02-24
**Author**: ClickAround (akfldk1028)
**Version**: 0.4.0

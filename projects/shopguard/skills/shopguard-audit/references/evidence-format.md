# Evidence Report Format

When synthesizing ShopGuard tool outputs, use this structured format:

## Template

```markdown
# ShopGuard Analysis: [Product Name]
**Platform**: [detected platform]
**URL**: [page URL]
**Date**: [analysis date]

## Dark Patterns (X found)

### [pattern-type] (risk: [level])
> "[exact evidence quote from page]"

**Impact**: [what this means for the consumer]

## Pricing (X issues)

### Hidden Fees
| Fee | Amount | Disclosure |
|-----|--------|-----------|
| [type] | [amount] | visible / checkout-only / fine-print |

### Subscription Traps
- [trap description with evidence]

## Reviews (X signals flagged)

### Signal Summary
| Signal | Status | Evidence |
|--------|--------|---------|
| Date clustering | flagged/clear | [brief evidence] |
| Rating anomaly | flagged/clear | [brief evidence] |
| ... | ... | ... |

### Notable Findings
- [specific finding with quoted evidence]

## Cross-References
- [combinations that amplify concern]

## Recommendations
1. [specific, actionable advice]
2. [what to check at checkout]
3. [alternative actions]

## Limitations
- [what could not be determined]
- [signals that need more data]
```

## Evidence Quality Levels

- **Strong**: Multiple corroborating signals, large sample size, clear evidence
- **Moderate**: 1-2 signals, medium sample, some ambiguity
- **Weak**: Single signal, small sample, could be legitimate
- **Insufficient**: Not enough data to assess

Always state the evidence quality level in your report.

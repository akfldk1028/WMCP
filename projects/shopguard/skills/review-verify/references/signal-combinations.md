# Review Signal Combination Guide

## Strong Fraud Indicators (3+ signals)

### Campaign Pattern
- Date clustering + phrase repetition + length uniformity
- Interpretation: Coordinated review campaign using templates
- Confidence: High when n > 20

### Paid Review Pattern
- Rating anomaly (>90% 5-star) + rating surge + AI generation
- Interpretation: Purchased reviews, possibly AI-generated
- Confidence: High when surge period is narrow (1-2 weeks)

### Bot Pattern
- Length uniformity (CV < 0.15) + AI generation + no verified purchases
- Interpretation: Automated/bot-generated reviews
- Confidence: Medium-high

## Moderate Indicators (2 signals)

### Incentive Pattern
- Incentive keywords + rating anomaly
- Interpretation: Sponsored reviews inflating ratings
- Note: Disclosed sponsorship is actually transparent — focus on undisclosed

### Timing Pattern
- Date clustering + rating surge
- Interpretation: Possible product launch or marketing push
- Note: Could be legitimate (product launch, sale event)

## Weak Indicators (1 signal)

Single signals should be reported but with appropriate hedging:
- Date clustering alone → could be product launch
- Incentive keywords alone → could be legitimate disclosure
- AI detection alone → non-native writers trigger false positives
- Length uniformity alone → some product categories naturally produce similar-length reviews

## Sample Size Guidelines

| Reviews | Reliability |
|---------|-------------|
| < 5 | Insufficient — do not draw conclusions |
| 5-20 | Low — note limitations prominently |
| 20-50 | Moderate — signals become meaningful |
| 50-200 | Good — most signals are reliable |
| 200+ | Strong — statistical analysis is robust |

import type { PriceComponent, PriceIssue, PriceIssueType, PriceAnalysis } from './types.js';

/**
 * Patterns for detecting price-related elements in HTML.
 */
const PRICE_REGEX = /(?:\$|€|£|¥|₩|USD|EUR|GBP)\s*(\d{1,3}(?:[,.]?\d{3})*(?:[.,]\d{1,2})?)/g;

/**
 * Fee keywords that indicate hidden or additional charges.
 */
const FEE_KEYWORDS: Array<{ pattern: RegExp; label: string; severity: number }> = [
  { pattern: /service\s+fee/i, label: 'Service Fee', severity: 70 },
  { pattern: /processing\s+fee/i, label: 'Processing Fee', severity: 65 },
  { pattern: /handling\s+(?:fee|charge)/i, label: 'Handling Fee', severity: 60 },
  { pattern: /convenience\s+fee/i, label: 'Convenience Fee', severity: 75 },
  { pattern: /platform\s+fee/i, label: 'Platform Fee', severity: 65 },
  { pattern: /booking\s+fee/i, label: 'Booking Fee', severity: 60 },
  { pattern: /resort\s+fee/i, label: 'Resort Fee', severity: 80 },
  { pattern: /cleaning\s+fee/i, label: 'Cleaning Fee', severity: 50 },
  { pattern: /(?:admin|administration)\s+fee/i, label: 'Admin Fee', severity: 55 },
  { pattern: /delivery\s+(?:fee|charge|surcharge)/i, label: 'Delivery Fee', severity: 40 },
  { pattern: /(?:mandatory|required)\s+(?:tip|gratuity)/i, label: 'Mandatory Gratuity', severity: 85 },
  { pattern: /surcharge/i, label: 'Surcharge', severity: 60 },
];

/**
 * Detect hidden fees in page content.
 */
export function detectHiddenFees(html: string): PriceIssue[] {
  const issues: PriceIssue[] = [];

  for (const feeRule of FEE_KEYWORDS) {
    const match = feeRule.pattern.exec(html);
    if (!match) continue;

    // Look for a price near the fee mention
    const context = html.substring(
      Math.max(0, match.index - 100),
      Math.min(html.length, match.index + match[0].length + 100),
    );

    const priceMatch = PRICE_REGEX.exec(context);
    PRICE_REGEX.lastIndex = 0; // Reset global regex

    const estimatedCost = priceMatch
      ? Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100)
      : 0;

    issues.push({
      type: 'hidden-fee',
      severity: feeRule.severity,
      description: `${feeRule.label} detected - may not be included in the advertised price`,
      evidence: match[0],
      estimatedExtraCostCents: estimatedCost,
    });
  }

  return issues;
}

/**
 * Detect drip pricing pattern (price increases through funnel).
 */
export function detectDripPricing(
  initialPriceCents: number,
  finalPriceCents: number,
): PriceIssue | null {
  if (finalPriceCents <= initialPriceCents) return null;

  const increase = finalPriceCents - initialPriceCents;
  const percentIncrease = (increase / initialPriceCents) * 100;

  if (percentIncrease < 5) return null; // Ignore small differences (tax, etc.)

  return {
    type: 'drip-pricing',
    severity: Math.min(100, Math.round(percentIncrease * 2)),
    description: `Price increased ${percentIncrease.toFixed(1)}% from advertised to checkout`,
    evidence: `Advertised: ${(initialPriceCents / 100).toFixed(2)}, Final: ${(finalPriceCents / 100).toFixed(2)}`,
    estimatedExtraCostCents: increase,
  };
}

/**
 * Detect subscription trap patterns.
 */
export function detectSubscriptionTraps(html: string): PriceIssue[] {
  const issues: PriceIssue[] = [];

  const patterns: Array<{ regex: RegExp; description: string; severity: number }> = [
    {
      regex: /(?:first|intro(?:ductory)?)\s+(?:\d+\s+)?(?:month|year)s?\s+(?:at|for)\s+(?:\$|€|£)\s*[\d.]+\s*[,;.]\s*(?:then|after\s+(?:that|which))\s+(?:\$|€|£)\s*[\d.]+/i,
      description: 'Introductory price increases significantly after trial period',
      severity: 75,
    },
    {
      regex: /cancel\s+(?:at\s+)?any\s+time.*?(?:billed?\s+(?:annually|yearly)|annual\s+(?:billing|plan))/i,
      description: '"Cancel anytime" but billed annually - cancellation may not refund remaining period',
      severity: 60,
    },
  ];

  for (const rule of patterns) {
    const match = rule.regex.exec(html);
    if (match) {
      issues.push({
        type: 'subscription-trap',
        severity: rule.severity,
        description: rule.description,
        evidence: match[0].slice(0, 200),
        estimatedExtraCostCents: 0,
      });
    }
  }

  return issues;
}

/**
 * Extract all visible prices from page content.
 */
export function extractPrices(html: string): PriceComponent[] {
  const components: PriceComponent[] = [];
  const priceRegex = /(?:\$|€|£|¥|₩)\s*(\d{1,3}(?:[,.]?\d{3})*(?:[.,]\d{1,2})?)/g;
  let match: RegExpExecArray | null;

  while ((match = priceRegex.exec(html)) !== null) {
    const symbol = match[0].charAt(0);
    const amount = parseFloat(match[1].replace(',', ''));
    const currency = { '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₩': 'KRW' }[symbol] ?? 'USD';

    components.push({
      label: 'detected-price',
      amountCents: Math.round(amount * 100),
      currency,
      wasVisible: true,
      addedAtCheckout: false,
    });
  }

  return components;
}

/**
 * Calculate trust score based on detected issues.
 */
export function calculateTrustScore(issues: PriceIssue[]): number {
  let score = 100;

  for (const issue of issues) {
    score -= Math.round(issue.severity * 0.3);
  }

  return Math.max(0, Math.min(100, score));
}

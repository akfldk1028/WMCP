import type { PriceComponent, PriceIssue } from '../core/types.js';

/**
 * Price regex supporting KRW (원), USD ($), EUR, GBP, JPY.
 * Enhanced from price-shield with better KRW support.
 */
const PRICE_REGEX =
  /(?:\$|€|£|¥|₩|USD|EUR|GBP|KRW)\s*(\d{1,3}(?:[,.]?\d{3})*(?:[.,]\d{1,2})?)|(\d{1,3}(?:[,.]?\d{3})*)\s*(?:원|円)/g;

/** Fee keywords that indicate hidden or additional charges */
const FEE_KEYWORDS: Array<{ pattern: RegExp; label: string; severity: number }> = [
  // English fees
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
  // Korean fees
  { pattern: /배송비/i, label: '배송비', severity: 35 },
  { pattern: /설치비/i, label: '설치비', severity: 55 },
  { pattern: /수수료/i, label: '수수료', severity: 65 },
  { pattern: /추가\s*(?:요금|비용|금액)/i, label: '추가 요금', severity: 70 },
  { pattern: /별도\s*(?:요금|비용|청구)/i, label: '별도 요금', severity: 70 },
  { pattern: /옵션\s*(?:요금|비용)/i, label: '옵션 비용', severity: 45 },
  { pattern: /도서[\s]*산간[\s]*(?:추가|별도)/i, label: '도서산간 추가비', severity: 40 },
];

/**
 * Detect hidden fees in page content.
 * Ported from price-shield with enhanced KRW support.
 */
export function detectHiddenFees(html: string): PriceIssue[] {
  const issues: PriceIssue[] = [];

  for (const feeRule of FEE_KEYWORDS) {
    const match = feeRule.pattern.exec(html);
    if (!match) continue;

    // Look for a price near the fee mention
    const start = Math.max(0, match.index - 100);
    const end = Math.min(html.length, match.index + match[0].length + 100);
    const context = html.substring(start, end);

    const priceRegex = new RegExp(PRICE_REGEX.source, 'g');
    const priceMatch = priceRegex.exec(context);

    const priceStr = priceMatch?.[1] ?? priceMatch?.[2] ?? '0';
    const estimatedCost = Math.round(
      parseFloat(priceStr.replace(/,/g, '')) * 100,
    );

    issues.push({
      type: 'hidden-fee',
      severity: feeRule.severity,
      description: `${feeRule.label} detected — may not be included in advertised price`,
      evidence: match[0],
      estimatedExtraCostCents: estimatedCost,
    });
  }

  return issues;
}

/**
 * Detect drip pricing (price increases through purchase funnel).
 */
export function detectDripPricing(
  initialPriceCents: number,
  finalPriceCents: number,
): PriceIssue | null {
  if (finalPriceCents <= initialPriceCents) return null;

  const increase = finalPriceCents - initialPriceCents;
  const percentIncrease = (increase / initialPriceCents) * 100;

  if (percentIncrease < 5) return null;

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

  const patterns: Array<{
    regex: RegExp;
    description: string;
    severity: number;
  }> = [
    {
      regex:
        /(?:first|intro(?:ductory)?)\s+(?:\d+\s+)?(?:month|year)s?\s+(?:at|for)\s+(?:\$|€|£)\s*[\d.]+\s*[,;.]\s*(?:then|after\s+(?:that|which))\s+(?:\$|€|£)\s*[\d.]+/i,
      description:
        'Introductory price increases significantly after trial period',
      severity: 75,
    },
    {
      regex:
        /cancel\s+(?:at\s+)?any\s+time.{0,200}(?:billed?\s+(?:annually|yearly)|annual\s+(?:billing|plan))/i,
      description:
        '"Cancel anytime" but billed annually — cancellation may not refund remaining period',
      severity: 60,
    },
    // Korean subscription traps
    {
      regex: /무료\s*(?:체험|이용).{0,100}(?:자동\s*(?:결제|갱신|연장))/i,
      description: '무료 체험 후 자동 결제 전환',
      severity: 75,
    },
    {
      regex: /(?:해지|취소).{0,100}(?:전화|고객\s*센터|상담원)/i,
      description: '해지/취소를 위해 전화 필요 — 의도적 어렵게 만듦',
      severity: 70,
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
  const priceRegex = new RegExp(PRICE_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = priceRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const amountStr = (match[1] ?? match[2] ?? '0').replace(/,/g, '');
    const amount = parseFloat(amountStr);

    // Determine currency
    let currency = 'USD';
    if (/[₩]|KRW|원/.test(fullMatch)) currency = 'KRW';
    else if (/€|EUR/.test(fullMatch)) currency = 'EUR';
    else if (/£|GBP/.test(fullMatch)) currency = 'GBP';
    else if (/[¥]|円/.test(fullMatch)) currency = 'JPY';

    // For KRW/JPY, amounts are already in base units (no cents)
    const amountCents =
      currency === 'KRW' || currency === 'JPY'
        ? Math.round(amount)
        : Math.round(amount * 100);

    components.push({
      label: 'detected-price',
      amountCents,
      currency,
      wasVisible: true,
      addedAtCheckout: false,
    });
  }

  return components;
}

/**
 * Calculate price trust score based on detected issues.
 */
export function calculatePriceTrustScore(issues: PriceIssue[]): number {
  let score = 100;

  for (const issue of issues) {
    score -= Math.round(issue.severity * 0.3);
  }

  return Math.max(0, Math.min(100, score));
}

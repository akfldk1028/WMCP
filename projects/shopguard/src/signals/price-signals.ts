import type { FeeMatch, TrapMatch } from '../core/types.js';
import { createPriceRegex } from '../core/regex.js';

const FEE_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /service\s+fee/i, label: 'Service Fee' },
  { pattern: /processing\s+fee/i, label: 'Processing Fee' },
  { pattern: /handling\s+(?:fee|charge)/i, label: 'Handling Fee' },
  { pattern: /convenience\s+fee/i, label: 'Convenience Fee' },
  { pattern: /platform\s+fee/i, label: 'Platform Fee' },
  { pattern: /booking\s+fee/i, label: 'Booking Fee' },
  { pattern: /resort\s+fee/i, label: 'Resort Fee' },
  { pattern: /cleaning\s+fee/i, label: 'Cleaning Fee' },
  { pattern: /(?:admin|administration)\s+fee/i, label: 'Admin Fee' },
  { pattern: /delivery\s+(?:fee|charge|surcharge)/i, label: 'Delivery Fee' },
  { pattern: /(?:mandatory|required)\s+(?:tip|gratuity)/i, label: 'Mandatory Gratuity' },
  { pattern: /surcharge/i, label: 'Surcharge' },
  { pattern: /배송비/i, label: '배송비' },
  { pattern: /설치비/i, label: '설치비' },
  { pattern: /수수료/i, label: '수수료' },
  { pattern: /추가\s*(?:요금|비용|금액)/i, label: '추가 요금' },
  { pattern: /별도\s*(?:요금|비용|청구)/i, label: '별도 요금' },
  { pattern: /옵션\s*(?:요금|비용)/i, label: '옵션 비용' },
  { pattern: /도서[\s]*산간[\s]*(?:추가|별도)/i, label: '도서산간 추가비' },
];

const TRAP_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  {
    type: 'introductory-price-hike',
    regex: /(?:first|intro(?:ductory)?)\s+(?:\d+\s+)?(?:month|year)s?\s+(?:at|for)\s+(?:\$|€|£)\s*[\d.]+\s*[,;.]\s*(?:then|after\s+(?:that|which))\s+(?:\$|€|£)\s*[\d.]+/i,
  },
  {
    type: 'cancel-anytime-annual-billing',
    regex: /cancel\s+(?:at\s+)?any\s+time[^<]{0,200}(?:billed?\s+(?:annually|yearly)|annual\s+(?:billing|plan))/i,
  },
  {
    type: 'free-trial-auto-charge',
    regex: /무료\s*(?:체험|이용)[^<]{0,100}(?:자동\s*(?:결제|갱신|연장))/i,
  },
  {
    type: 'cancel-requires-phone',
    regex: /(?:해지|취소)[^<]{0,100}(?:전화|고객\s*센터|상담원)/i,
  },
  {
    type: 'forced-continuity-en',
    regex: /free\s+trial\s+(?:will\s+)?(?:automatically\s+)?(?:convert|become|turn\s+into)/i,
  },
  {
    type: 'credit-card-for-trial',
    regex: /credit\s+card\s+required\s+(?:for\s+)?(?:free\s+)?trial/i,
  },
];

/** Extract fee matches with surrounding context */
export function extractFeeMatches(html: string): FeeMatch[] {
  const matches: FeeMatch[] = [];

  for (const rule of FEE_KEYWORDS) {
    const match = rule.pattern.exec(html);
    if (!match) continue;

    const start = Math.max(0, match.index - 100);
    const end = Math.min(html.length, match.index + match[0].length + 100);
    const context = html.substring(start, end);

    const priceRegex = createPriceRegex();
    const priceMatch = priceRegex.exec(context);
    const nearbyPrice = priceMatch ? priceMatch[0] : undefined;

    matches.push({
      label: rule.label,
      evidence: match[0],
      context,
      nearbyPrice,
    });
  }

  return matches;
}

/** Extract subscription/pricing trap matches with context */
export function extractTrapMatches(html: string): TrapMatch[] {
  const matches: TrapMatch[] = [];

  for (const rule of TRAP_PATTERNS) {
    const match = rule.regex.exec(html);
    if (!match) continue;

    const start = Math.max(0, match.index - 50);
    const end = Math.min(html.length, match.index + match[0].length + 50);

    matches.push({
      type: rule.type,
      evidence: match[0].slice(0, 200),
      context: html.substring(start, end),
    });
  }

  return matches;
}

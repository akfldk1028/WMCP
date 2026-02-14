/**
 * Keyword database for detecting incentivized/sponsored reviews.
 * Organized by locale (ko/en).
 */

/** Korean keywords indicating sponsored/incentivized reviews */
export const KO_INCENTIVE_PATTERNS: RegExp[] = [
  // Sponsored / experience group
  /체험단/,
  /협찬/,
  /제공[\s]*받/,
  /무료[\s]*제공/,
  /무상[\s]*제공/,
  /광고[\s]*포함/,
  /소정의[\s]*(?:원고료|대가|수고비)/,
  /원고료/,
  /경제적[\s]*대가/,
  // Experience / trial
  /서포터즈/,
  /리뷰어/,
  /얼리[\s]*리뷰/,
  /시험[\s]*사용/,
  /샘플[\s]*제공/,
  /제품[\s]*(?:을[\s]*)?(?:지원|제공)[\s]*받/,
  // Disclosure patterns
  /업체[\s]*(?:로부터|에서)[\s]*(?:제공|지원)/,
  /대가[\s]*(?:를[\s]*)?(?:받고|지급)/,
  /(?:내돈내산|내[\s]*돈[\s]*내[\s]*산)[\s]*(?:아닙|아닌)/,
];

/** English keywords indicating incentivized/sponsored reviews */
export const EN_INCENTIVE_PATTERNS: RegExp[] = [
  /received?\s+(?:this\s+)?(?:product\s+)?(?:for\s+)?free/i,
  /(?:free|complimentary)\s+(?:product|sample|item)\s+(?:in\s+exchange|for\s+(?:review|testing))/i,
  /(?:gifted|sponsored|provided)\s+(?:by|from|for\s+review)/i,
  /in\s+exchange\s+for\s+(?:an?\s+)?(?:honest\s+)?review/i,
  /(?:discount(?:ed)?|reduced)\s+(?:price|rate|product)\s+(?:in\s+exchange|for\s+review)/i,
  /(?:paid|compensated)\s+(?:to\s+)?(?:review|test|try)/i,
  /(?:brand\s+)?ambassador/i,
  /(?:influencer|affiliate)\s+(?:program|partnership)/i,
  /\bI\s+was\s+(?:sent|given)\s+this/i,
  /\b(?:PR|press)\s+(?:sample|package)\b/i,
];

/** Korean filler / generic praise phrases (low-value reviews) */
export const KO_GENERIC_PHRASES: string[] = [
  '좋아요',
  '추천합니다',
  '만족합니다',
  '괜찮아요',
  '잘 쓰고 있습니다',
  '배송 빠르고',
  '가성비 좋습니다',
  '재구매 의사',
  '별 다섯개',
];

/** English generic filler phrases */
export const EN_GENERIC_PHRASES: string[] = [
  'highly recommend',
  'great product',
  'love it',
  'works great',
  'five stars',
  'best purchase',
  'would buy again',
  'amazing quality',
  'perfect',
];

/**
 * Check if a review text contains incentive keywords.
 * Returns matched patterns.
 */
export function findIncentiveKeywords(
  text: string,
  locale: 'ko' | 'en',
): string[] {
  const patterns = locale === 'ko' ? KO_INCENTIVE_PATTERNS : EN_INCENTIVE_PATTERNS;
  const matches: string[] = [];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      matches.push(match[0]);
    }
  }

  return matches;
}

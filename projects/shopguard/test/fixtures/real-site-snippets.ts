/**
 * Real text snippets from major shopping sites for integration testing.
 * Each snippet should trigger at least one dark pattern detection.
 */

export const AMAZON_SNIPPETS = [
  'Only 5 left in stock - order soon.',
  '1K+ bought in past month',
  '50K+ ratings',
  "#1 Best Seller in Electronics",
  'Limited time deal',
  'Deal of the Day',
  'Lightning Deal',
  'Ends in 12h 34m',
  'Import fees deposit included',
  'Shipping calculated at checkout',
  'Sponsored product',
] as const;

export const EBAY_SNIPPETS = [
  '23 watchers',
  '142 sold',
  'Almost gone',
  'Was $49.99 now $29.99',
  'From $9.99',
  'Plus shipping',
] as const;

export const WALMART_SNIPPETS = [
  'Popular pick',
  'Best seller',
  'Prices start at $5',
  'Taxes not included',
  'Promoted result',
] as const;

export const COUPANG_SNIPPETS = [
  '오늘만 한정 특가',
  '품절 임박',
  '3시간 남음',
  '1만건 판매',
  '누적 리뷰 5000',
  '300명이 이 상품을 봤습니다',
  '배송비 별도',
  '광고 상품',
] as const;

/** Map of site name → snippets for iteration */
export const ALL_SITE_SNIPPETS = {
  amazon: AMAZON_SNIPPETS,
  ebay: EBAY_SNIPPETS,
  walmart: WALMART_SNIPPETS,
  coupang: COUPANG_SNIPPETS,
} as const;

/** Expected pattern types per snippet (for detailed assertions) */
export const EXPECTED_DETECTIONS: Array<{ text: string; site: string; expectedType: string }> = [
  // Amazon
  { text: 'Only 5 left in stock - order soon.', site: 'amazon', expectedType: 'fake-urgency' },
  { text: '1K+ bought in past month', site: 'amazon', expectedType: 'fake-social-proof' },
  { text: '50K+ ratings', site: 'amazon', expectedType: 'fake-social-proof' },
  { text: '#1 Best Seller in Electronics', site: 'amazon', expectedType: 'fake-social-proof' },
  { text: 'Limited time deal', site: 'amazon', expectedType: 'fake-urgency' },
  { text: 'Import fees deposit included', site: 'amazon', expectedType: 'hidden-costs' },
  { text: 'Sponsored product', site: 'amazon', expectedType: 'disguised-ads' },
  // eBay
  { text: '23 watchers', site: 'ebay', expectedType: 'fake-social-proof' },
  { text: 'Almost gone', site: 'ebay', expectedType: 'fake-social-proof' },
  { text: 'From $9.99', site: 'ebay', expectedType: 'bait-and-switch' },
  // Walmart
  { text: 'Popular pick', site: 'walmart', expectedType: 'fake-social-proof' },
  { text: 'Best seller', site: 'walmart', expectedType: 'fake-social-proof' },
  { text: 'Taxes not included', site: 'walmart', expectedType: 'drip-pricing' },
  // Coupang
  { text: '오늘만 한정 특가', site: 'coupang', expectedType: 'fake-urgency' },
  { text: '품절 임박', site: 'coupang', expectedType: 'fake-urgency' },
  { text: '3시간 남음', site: 'coupang', expectedType: 'fake-urgency' },
  { text: '1만건 판매', site: 'coupang', expectedType: 'fake-social-proof' },
  { text: '배송비 별도', site: 'coupang', expectedType: 'drip-pricing' },
  { text: '광고 상품', site: 'coupang', expectedType: 'disguised-ads' },
];

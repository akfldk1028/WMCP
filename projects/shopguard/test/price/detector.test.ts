import { describe, it, expect } from 'vitest';
import {
  detectHiddenFees,
  detectDripPricing,
  detectSubscriptionTraps,
  extractPrices,
  calculatePriceTrustScore,
} from '../../src/price/detector.js';
import { analyzePrices, comparePrices } from '../../src/price/comparator.js';

describe('detectHiddenFees', () => {
  it('detects English hidden fees', () => {
    const html = '<p>Subtotal: $49.99</p><p class="fine-print">Service Fee: $4.99</p>';
    const issues = detectHiddenFees(html);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].type).toBe('hidden-fee');
    expect(issues[0].description).toContain('Service Fee');
  });

  it('detects Korean hidden fees', () => {
    const html = '<p>상품가: ₩29,900</p><p>배송비: ₩3,000</p><p>설치비 별도 ₩50,000</p>';
    const issues = detectHiddenFees(html);
    expect(issues.some((i) => i.description.includes('배송비'))).toBe(true);
    expect(issues.some((i) => i.description.includes('설치비'))).toBe(true);
  });

  it('detects surcharges', () => {
    const html = '<p>Price: $100</p><p>Weekend surcharge may apply</p>';
    const issues = detectHiddenFees(html);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('returns empty for clean page', () => {
    const html = '<p>Price: $49.99</p><p>Free shipping included!</p>';
    const issues = detectHiddenFees(html);
    expect(issues).toHaveLength(0);
  });
});

describe('detectDripPricing', () => {
  it('detects significant price increase', () => {
    const issue = detectDripPricing(5000, 7500); // $50 → $75
    expect(issue).not.toBeNull();
    expect(issue!.type).toBe('drip-pricing');
    expect(issue!.estimatedExtraCostCents).toBe(2500);
  });

  it('ignores small differences (tax)', () => {
    const issue = detectDripPricing(5000, 5200); // 4% increase
    expect(issue).toBeNull();
  });

  it('returns null when price decreases', () => {
    const issue = detectDripPricing(5000, 4500);
    expect(issue).toBeNull();
  });
});

describe('detectSubscriptionTraps', () => {
  it('detects English subscription traps', () => {
    const html =
      'First 3 months at $4.99, then $19.99/month after that. Cancel at any time.';
    const issues = detectSubscriptionTraps(html);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].type).toBe('subscription-trap');
  });

  it('detects Korean subscription traps', () => {
    const html = '무료 체험 기간 종료 후 자동 결제됩니다. 해지는 고객센터로 전화해주세요.';
    const issues = detectSubscriptionTraps(html);
    expect(issues.length).toBeGreaterThanOrEqual(1);
  });
});

describe('extractPrices', () => {
  it('extracts USD prices', () => {
    const components = extractPrices('Price: $49.99 and $12.50');
    expect(components.length).toBe(2);
    expect(components[0].amountCents).toBe(4999);
    expect(components[0].currency).toBe('USD');
  });

  it('extracts KRW prices', () => {
    const components = extractPrices('가격: ₩29,900 할인가: ₩19,900');
    expect(components.length).toBe(2);
    expect(components[0].currency).toBe('KRW');
    expect(components[0].amountCents).toBe(29900);
  });

  it('extracts 원 suffix prices', () => {
    const components = extractPrices('29,900원');
    expect(components.length).toBe(1);
    expect(components[0].currency).toBe('KRW');
  });
});

describe('calculatePriceTrustScore', () => {
  it('returns 100 for no issues', () => {
    expect(calculatePriceTrustScore([])).toBe(100);
  });

  it('decreases with more/higher severity issues', () => {
    const issues = [
      { type: 'hidden-fee' as const, severity: 70, description: '', evidence: '', estimatedExtraCostCents: 0 },
      { type: 'hidden-fee' as const, severity: 60, description: '', evidence: '', estimatedExtraCostCents: 0 },
    ];
    const score = calculatePriceTrustScore(issues);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
  });
});

describe('analyzePrices', () => {
  it('produces full analysis with grade', () => {
    const html = '<p>Price: $99.99</p><p>Service Fee: $9.99</p><p>Processing Fee: $4.99</p>';
    const result = analyzePrices(html);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.grade).toBeDefined();
    expect(result.trustScore).toBeLessThan(100);
  });

  it('returns A grade for clean pricing', () => {
    const html = '<p>Price: $49.99</p><p>Free shipping</p>';
    const result = analyzePrices(html);
    expect(result.issues).toHaveLength(0);
    expect(result.grade).toBe('A');
  });
});

describe('comparePrices', () => {
  it('compares prices across sources', () => {
    const result = comparePrices([
      { name: 'Store A', priceCents: 5000, currency: 'USD' },
      { name: 'Store B', priceCents: 6000, currency: 'USD' },
      { name: 'Store C', priceCents: 4500, currency: 'USD' },
    ]);
    expect(result).not.toBeNull();
    expect(result!.cheapest.name).toBe('Store C');
    expect(result!.mostExpensive.name).toBe('Store B');
    expect(result!.spreadPercent).toBeGreaterThan(0);
  });

  it('returns null for single source', () => {
    const result = comparePrices([
      { name: 'Store A', priceCents: 5000, currency: 'USD' },
    ]);
    expect(result).toBeNull();
  });
});

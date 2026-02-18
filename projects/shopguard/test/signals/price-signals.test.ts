import { describe, it, expect } from 'vitest';
import { extractFeeMatches, extractTrapMatches } from '../../src/signals/price-signals.js';

describe('extractFeeMatches', () => {
  it('detects English fees with context', () => {
    const html = '<p>Subtotal: $49.99</p><p class="fine-print">Service Fee: $4.99</p>';
    const matches = extractFeeMatches(html);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].label).toBe('Service Fee');
    expect(matches[0].evidence).toContain('Service');
    expect(matches[0].context.length).toBeGreaterThan(0);
  });

  it('detects Korean fees', () => {
    const html = '<p>상품가: ₩29,900</p><p>배송비: ₩3,000</p><p>설치비 별도 ₩50,000</p>';
    const matches = extractFeeMatches(html);
    expect(matches.some((m) => m.label === '배송비')).toBe(true);
    expect(matches.some((m) => m.label === '설치비')).toBe(true);
  });

  it('includes nearby price', () => {
    const html = '<p>Service fee: $5.99 will be added to your order</p>';
    const matches = extractFeeMatches(html);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].nearbyPrice).toBeDefined();
  });

  it('returns empty for clean HTML', () => {
    const matches = extractFeeMatches('<p>Free shipping on all orders!</p>');
    expect(matches).toHaveLength(0);
  });
});

describe('extractTrapMatches', () => {
  it('detects English subscription traps', () => {
    const html = 'First 3 months at $4.99, then $19.99/month after that.';
    const matches = extractTrapMatches(html);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].type).toBe('introductory-price-hike');
    expect(matches[0].context.length).toBeGreaterThan(0);
  });

  it('detects Korean auto-charge traps', () => {
    const html = '무료 체험 기간 종료 후 자동 결제됩니다';
    const matches = extractTrapMatches(html);
    expect(matches.some((m) => m.type === 'free-trial-auto-charge')).toBe(true);
  });

  it('detects cancel-requires-phone', () => {
    const html = '해지를 원하시면 고객센터로 전화해주세요';
    const matches = extractTrapMatches(html);
    expect(matches.some((m) => m.type === 'cancel-requires-phone')).toBe(true);
  });

  it('returns empty for clean HTML', () => {
    const matches = extractTrapMatches('<p>Welcome to our store</p>');
    expect(matches).toHaveLength(0);
  });
});

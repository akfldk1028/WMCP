import { describe, it, expect } from 'vitest';
import { extractPriceComponents } from '../../src/extractors/price-extractor.js';

describe('extractPriceComponents', () => {
  it('extracts USD prices from price elements', () => {
    const html = '<div class="price">$49.99</div><div class="price">$12.50</div>';
    const components = extractPriceComponents(html);
    expect(components.length).toBeGreaterThanOrEqual(2);
    expect(components.some((c) => c.amountCents === 4999)).toBe(true);
    expect(components[0].currency).toBe('USD');
  });

  it('extracts KRW prices', () => {
    const html = '<span class="price">₩29,900</span>';
    const components = extractPriceComponents(html);
    expect(components.length).toBeGreaterThanOrEqual(1);
    expect(components[0].currency).toBe('KRW');
    expect(components[0].amountCents).toBe(29900);
  });

  it('extracts 원 suffix prices', () => {
    const html = '<div class="가격">29,900원</div>';
    const components = extractPriceComponents(html);
    expect(components.length).toBeGreaterThanOrEqual(1);
    expect(components[0].currency).toBe('KRW');
  });

  it('returns empty for no-price HTML', () => {
    const components = extractPriceComponents('<p>Hello world</p>');
    expect(components).toHaveLength(0);
  });

  it('deduplicates same price text', () => {
    const html = '<div class="price">$49.99</div><p>Price is $49.99</p>';
    const components = extractPriceComponents(html);
    // Should not have duplicate entries for the same price text
    const amounts = components.map((c) => c.amountCents);
    expect(amounts.filter((a) => a === 4999).length).toBe(1);
  });
});

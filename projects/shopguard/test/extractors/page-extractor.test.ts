import { describe, it, expect } from 'vitest';
import { extractPageData } from '../../src/extractors/page-extractor.js';

const SAMPLE_HTML = `
<html>
<head>
  <title>Amazing Widget - Best Price!</title>
  <meta name="og:title" content="Amazing Widget">
  <meta name="og:price:amount" content="29.99">
</head>
<body>
  <h1>Amazing Widget</h1>
  <div class="price">$29.99</div>
  <div class="review">
    <p>Great product! Would buy again.</p>
  </div>
  <div class="review">
    <p>Not bad for the price.</p>
  </div>
  <form>
    <button type="submit">Add to Cart</button>
    <input type="checkbox" name="newsletter" checked>
  </form>
</body>
</html>
`;

describe('extractPageData', () => {
  it('extracts title', () => {
    const result = extractPageData(SAMPLE_HTML);
    expect(result.title).toBe('Amazing Widget - Best Price!');
  });

  it('extracts meta tags', () => {
    const result = extractPageData(SAMPLE_HTML);
    expect(result.meta['og:title']).toBe('Amazing Widget');
  });

  it('extracts price contexts', () => {
    const result = extractPageData(SAMPLE_HTML);
    expect(result.priceContexts.length).toBeGreaterThan(0);
    expect(result.priceContexts.some((p) => p.includes('29.99'))).toBe(true);
  });

  it('extracts review blocks', () => {
    const result = extractPageData(SAMPLE_HTML);
    expect(result.reviewBlocks.length).toBeGreaterThan(0);
  });

  it('counts forms', () => {
    const result = extractPageData(SAMPLE_HTML);
    expect(result.formCount).toBe(1);
  });

  it('extracts interactive elements', () => {
    const result = extractPageData(SAMPLE_HTML);
    expect(result.interactiveElements.length).toBeGreaterThan(0);
    expect(result.interactiveElements.some((e) => e.tag === 'button')).toBe(true);
  });

  it('detects platform from URL', () => {
    const result = extractPageData('<html><body>test</body></html>', 'https://www.coupang.com/vp/products/123');
    expect(result.platform).toBe('coupang');
  });

  it('detects no agent readiness by default', () => {
    const result = extractPageData(SAMPLE_HTML);
    expect(result.agentReadinessDetected).toBe(false);
    expect(result.agentReadinessSignals).toHaveLength(0);
  });

  it('detects agent readiness signals', () => {
    const html = '<html><head><script type="application/ld+json">{"@type":"Product"}</script><meta property="og:title" content="Test"></head><body></body></html>';
    const result = extractPageData(html);
    expect(result.agentReadinessDetected).toBe(true);
    expect(result.agentReadinessSignals).toContain('schema.org-jsonld');
    expect(result.agentReadinessSignals).toContain('opengraph');
  });

  it('passes url through', () => {
    const result = extractPageData(SAMPLE_HTML, 'https://example.com');
    expect(result.url).toBe('https://example.com');
  });
});

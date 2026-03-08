import { describe, it, expect } from 'vitest';
import {
  detectDarkPatterns,
  detectPreselectedCheckboxes,
  detectCookieBannerMisdirection,
  analyzeDarkPatterns,
} from '../../src/darkpattern/detector.js';

describe('detectDarkPatterns', () => {
  it('detects fake urgency', () => {
    const matches = detectDarkPatterns('Only 3 left in stock! Hurry!');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].type).toBe('fake-urgency');
  });

  it('detects Korean fake urgency', () => {
    const matches = detectDarkPatterns('단 5개 남음! 한정 수량 특가 세일');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects fake social proof', () => {
    const matches = detectDarkPatterns('47 people are viewing this right now');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects Korean social proof', () => {
    const matches = detectDarkPatterns('현재 23명이 보고 있습니다');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects confirm shaming', () => {
    const matches = detectDarkPatterns(
      'No thanks, I don\'t want to save money',
    );
    expect(matches.some((m) => m.type === 'confirm-shaming')).toBe(true);
  });

  it('detects forced continuity', () => {
    const matches = detectDarkPatterns(
      'Free trial will automatically convert to a paid subscription',
    );
    expect(matches.some((m) => m.type === 'forced-continuity')).toBe(true);
  });

  it('detects Korean forced continuity', () => {
    const matches = detectDarkPatterns(
      '무료 체험 종료 후 자동 결제로 전환됩니다',
    );
    expect(matches.some((m) => m.type === 'forced-continuity')).toBe(true);
  });

  it('detects obstruction', () => {
    const matches = detectDarkPatterns(
      'Call us to cancel your subscription',
    );
    expect(matches.some((m) => m.type === 'obstruction')).toBe(true);
  });

  it('detects Korean obstruction', () => {
    const matches = detectDarkPatterns(
      '해지를 원하시면 고객센터로 전화해주세요',
    );
    expect(matches.some((m) => m.type === 'obstruction')).toBe(true);
  });

  it('detects hidden costs', () => {
    const matches = detectDarkPatterns('Additional fees may apply');
    expect(matches.some((m) => m.type === 'hidden-costs')).toBe(true);
  });

  it('returns empty for clean content', () => {
    const matches = detectDarkPatterns('This is a great product at a fair price.');
    expect(matches).toHaveLength(0);
  });
});

describe('detectPreselectedCheckboxes', () => {
  it('detects pre-checked checkboxes', () => {
    const html =
      '<input type="checkbox" name="newsletter" checked> Subscribe to newsletter';
    const matches = detectPreselectedCheckboxes(html);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].type).toBe('preselection');
    expect(matches[0].evidence).toContain('newsletter');
  });

  it('ignores remember-me checkboxes', () => {
    const html = '<input type="checkbox" name="remember_me" checked>';
    const matches = detectPreselectedCheckboxes(html);
    expect(matches).toHaveLength(0);
  });

  it('ignores unchecked checkboxes', () => {
    const html = '<input type="checkbox" name="marketing">';
    const matches = detectPreselectedCheckboxes(html);
    expect(matches).toHaveLength(0);
  });
});

describe('detectCookieBannerMisdirection', () => {
  it('detects accept-all without reject-all', () => {
    const html =
      '<div class="cookie banner"><button>Accept All</button><a>Manage preferences</a></div>';
    const matches = detectCookieBannerMisdirection(html);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].type).toBe('misdirection');
  });

  it('returns empty when both accept and reject exist', () => {
    const html =
      '<div class="cookie banner"><button>Accept All</button><button>Reject All</button></div>';
    const matches = detectCookieBannerMisdirection(html);
    expect(matches).toHaveLength(0);
  });

  it('returns empty for non-cookie content', () => {
    const html = '<div>Some regular page content</div>';
    const matches = detectCookieBannerMisdirection(html);
    expect(matches).toHaveLength(0);
  });
});

describe('analyzeDarkPatterns', () => {
  it('produces full analysis with grade', () => {
    const content =
      'Only 2 left! Hurry! 47 people are viewing this. ' +
      'No thanks, I don\'t want to save money';
    const result = analyzeDarkPatterns(content);

    expect(result.patterns.length).toBeGreaterThan(0);
    expect(result.riskScore).toBeDefined();
    expect(result.grade).toBeDefined();
  });

  it('returns A grade for clean content', () => {
    const result = analyzeDarkPatterns('Welcome to our store. Browse our products.');
    expect(result.patterns).toHaveLength(0);
    expect(result.grade).toBe('A');
  });

  it('includes HTML analysis when provided', () => {
    const content = 'Accept all cookies';
    const html =
      '<div class="cookie banner"><button>Accept All</button></div>' +
      '<input type="checkbox" name="marketing" checked>';
    const result = analyzeDarkPatterns(content, html);
    expect(result.patterns.length).toBeGreaterThan(0);
  });
});

// ── New pattern tests (expanded rules) ──

describe('detectDarkPatterns — expanded patterns', () => {
  it('detects "limited time deal"', () => {
    const matches = detectDarkPatterns('Limited time deal');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects "deal of the day"', () => {
    const matches = detectDarkPatterns('Deal of the Day');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects "selling fast"', () => {
    const matches = detectDarkPatterns('Selling fast - buy now');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects "1K+ bought in past month"', () => {
    const matches = detectDarkPatterns('1K+ bought in past month');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects "50K+ ratings"', () => {
    const matches = detectDarkPatterns('50K+ ratings');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects "best seller"', () => {
    const matches = detectDarkPatterns('Best seller in category');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects "continue without saving"', () => {
    const matches = detectDarkPatterns('Continue without saving');
    expect(matches.some((m) => m.type === 'confirm-shaming')).toBe(true);
  });

  it('detects "shipping calculated at checkout"', () => {
    const matches = detectDarkPatterns('Shipping calculated at checkout');
    expect(matches.some((m) => m.type === 'hidden-costs')).toBe(true);
  });

  it('detects Korean 오늘만 한정', () => {
    const matches = detectDarkPatterns('오늘만 한정 특가');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects Korean 배송비 별도', () => {
    const matches = detectDarkPatterns('배송비 별도');
    expect(matches.some((m) => m.type === 'hidden-costs')).toBe(true);
  });
});

// ── New category tests ──

describe('detectDarkPatterns — new categories', () => {
  it('detects bait-and-switch', () => {
    const matches = detectDarkPatterns('From $9.99');
    expect(matches.some((m) => m.type === 'bait-and-switch')).toBe(true);
  });

  it('detects drip-pricing', () => {
    const matches = detectDarkPatterns('Taxes not included');
    expect(matches.some((m) => m.type === 'drip-pricing')).toBe(true);
  });

  it('detects nagging', () => {
    const matches = detectDarkPatterns('Subscribe to our newsletter');
    expect(matches.some((m) => m.type === 'nagging')).toBe(true);
  });

  it('detects trick-question', () => {
    const matches = detectDarkPatterns('Uncheck to opt out of emails');
    expect(matches.some((m) => m.type === 'trick-question')).toBe(true);
  });

  it('detects disguised-ads', () => {
    const matches = detectDarkPatterns('Sponsored product listing');
    expect(matches.some((m) => m.type === 'disguised-ads')).toBe(true);
  });

  it('detects Korean drip-pricing', () => {
    const matches = detectDarkPatterns('배송비 미포함 가격입니다');
    expect(matches.some((m) => m.type === 'drip-pricing')).toBe(true);
  });

  it('detects Korean disguised-ads', () => {
    const matches = detectDarkPatterns('광고 상품입니다');
    expect(matches.some((m) => m.type === 'disguised-ads')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { extractDarkPatternEvidence } from '../../src/signals/darkpattern-signals.js';

describe('extractDarkPatternEvidence', () => {
  it('detects fake urgency with context', () => {
    const content = 'Only 3 left in stock! Hurry before they sell out!';
    const matches = extractDarkPatternEvidence(content);
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
    const urgency = matches.find((m) => m.type === 'fake-urgency')!;
    expect(urgency.context.length).toBeGreaterThan(0);
  });

  it('detects Korean fake urgency', () => {
    const matches = extractDarkPatternEvidence('단 5개 남음! 한정 수량 특가 세일');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects fake social proof', () => {
    const matches = extractDarkPatternEvidence('47 people are viewing this right now');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects confirm shaming', () => {
    const matches = extractDarkPatternEvidence("No thanks, I don't want to save money");
    expect(matches.some((m) => m.type === 'confirm-shaming')).toBe(true);
  });

  it('detects forced continuity', () => {
    const matches = extractDarkPatternEvidence(
      'Free trial will automatically convert to a paid subscription',
    );
    expect(matches.some((m) => m.type === 'forced-continuity')).toBe(true);
  });

  it('detects obstruction', () => {
    const matches = extractDarkPatternEvidence('Call us to cancel your subscription');
    expect(matches.some((m) => m.type === 'obstruction')).toBe(true);
  });

  it('detects hidden costs', () => {
    const matches = extractDarkPatternEvidence('Additional fees may apply');
    expect(matches.some((m) => m.type === 'hidden-costs')).toBe(true);
  });

  it('detects privacy zuckering', () => {
    const matches = extractDarkPatternEvidence(
      'By signing up you agree to share your data with our privacy partners',
    );
    expect(matches.some((m) => m.type === 'privacy-zuckering')).toBe(true);
  });

  it('returns empty for clean content', () => {
    const matches = extractDarkPatternEvidence('This is a great product at a fair price.');
    expect(matches).toHaveLength(0);
  });

  // HTML-specific tests
  it('detects pre-checked checkboxes', () => {
    const html = '<input type="checkbox" name="newsletter" checked> Subscribe';
    const matches = extractDarkPatternEvidence('Subscribe', html);
    expect(matches.some((m) => m.type === 'preselection')).toBe(true);
    expect(matches.find((m) => m.type === 'preselection')!.elementType).toBe('input[checkbox]');
  });

  it('ignores remember-me checkboxes', () => {
    const html = '<input type="checkbox" name="remember_me" checked>';
    const matches = extractDarkPatternEvidence('', html);
    expect(matches.filter((m) => m.type === 'preselection')).toHaveLength(0);
  });

  it('detects cookie banner misdirection', () => {
    const html = '<div class="cookie banner"><button>Accept All</button><a>Manage preferences</a></div>';
    const matches = extractDarkPatternEvidence('Accept All', html);
    expect(matches.some((m) => m.type === 'misdirection')).toBe(true);
  });

  // ── New pattern tests (Phase 1 expansions) ──

  it('detects Amazon "limited time deal"', () => {
    const matches = extractDarkPatternEvidence('Limited time deal - save 20%');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects Amazon "1K+ bought in past month"', () => {
    const matches = extractDarkPatternEvidence('1K+ bought in past month');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects "50K+ ratings"', () => {
    const matches = extractDarkPatternEvidence('50K+ ratings');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects Amazon best seller badge', () => {
    const matches = extractDarkPatternEvidence('#1 Best Seller in Electronics');
    expect(matches.some((m) => m.type === 'fake-social-proof')).toBe(true);
  });

  it('detects "continue without saving"', () => {
    const matches = extractDarkPatternEvidence('Continue without saving');
    expect(matches.some((m) => m.type === 'confirm-shaming')).toBe(true);
  });

  it('detects "shipping calculated at checkout"', () => {
    const matches = extractDarkPatternEvidence('Shipping calculated at checkout');
    expect(matches.some((m) => m.type === 'hidden-costs')).toBe(true);
  });

  it('detects import fees deposit', () => {
    const matches = extractDarkPatternEvidence('Import fees deposit included');
    expect(matches.some((m) => m.type === 'hidden-costs')).toBe(true);
  });

  it('detects Korean 오늘만 한정', () => {
    const matches = extractDarkPatternEvidence('오늘만 한정 특가');
    expect(matches.some((m) => m.type === 'fake-urgency')).toBe(true);
  });

  it('detects Korean 배송비 별도', () => {
    const matches = extractDarkPatternEvidence('배송비 별도');
    expect(matches.some((m) => m.type === 'hidden-costs')).toBe(true);
  });

  // ── New type tests (Phase 2) ──

  it('detects bait-and-switch "From $9.99"', () => {
    const matches = extractDarkPatternEvidence('From $9.99');
    expect(matches.some((m) => m.type === 'bait-and-switch')).toBe(true);
  });

  it('detects drip-pricing "Taxes not included"', () => {
    const matches = extractDarkPatternEvidence('Taxes not included');
    expect(matches.some((m) => m.type === 'drip-pricing')).toBe(true);
  });

  it('detects nagging "Subscribe to our newsletter"', () => {
    const matches = extractDarkPatternEvidence('Subscribe to our newsletter');
    expect(matches.some((m) => m.type === 'nagging')).toBe(true);
  });

  it('detects trick-question "Uncheck to opt out"', () => {
    const matches = extractDarkPatternEvidence('Uncheck to opt out of marketing emails');
    expect(matches.some((m) => m.type === 'trick-question')).toBe(true);
  });

  it('detects disguised-ads "Sponsored product"', () => {
    const matches = extractDarkPatternEvidence('Sponsored product');
    expect(matches.some((m) => m.type === 'disguised-ads')).toBe(true);
  });
});

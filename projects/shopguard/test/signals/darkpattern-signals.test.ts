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
});

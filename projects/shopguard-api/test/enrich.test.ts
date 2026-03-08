import { describe, it, expect } from 'vitest';
import { enrichDarkPatterns } from '../src/lib/enrich';

const ALL_TYPES = [
  'fake-urgency',
  'fake-social-proof',
  'confirm-shaming',
  'misdirection',
  'preselection',
  'forced-continuity',
  'obstruction',
  'hidden-costs',
  'privacy-zuckering',
  'bait-and-switch',
  'drip-pricing',
  'nagging',
  'trick-question',
  'disguised-ads',
] as const;

function makeRaw(type: string) {
  return { type, evidence: 'test evidence', context: 'test context' };
}

describe('enrichDarkPatterns', () => {
  it('enriches all 14 types with EN locale', () => {
    const input = ALL_TYPES.map(makeRaw);
    const result = enrichDarkPatterns(input, 'en');

    expect(result).toHaveLength(14);
    for (const r of result) {
      expect(r.risk).toBeTruthy();
      expect(r.description).toBeTruthy();
      expect(r.tip).toBeTruthy();
      // EN descriptions should not contain Korean
      expect(r.description).not.toMatch(/[\uAC00-\uD7AF]/);
    }
  });

  it('enriches all 14 types with KO locale', () => {
    const input = ALL_TYPES.map(makeRaw);
    const result = enrichDarkPatterns(input, 'ko');

    expect(result).toHaveLength(14);
    for (const r of result) {
      expect(r.risk).toBeTruthy();
      expect(r.description).toBeTruthy();
      expect(r.tip).toBeTruthy();
      // KO descriptions should contain Korean
      expect(r.description).toMatch(/[\uAC00-\uD7AF]/);
    }
  });

  it('defaults to EN when locale is undefined', () => {
    const input = [makeRaw('fake-urgency')];
    const result = enrichDarkPatterns(input);

    expect(result[0].description).not.toMatch(/[\uAC00-\uD7AF]/);
  });

  it('uses FALLBACK for unknown types', () => {
    const input = [makeRaw('unknown-type')];

    const en = enrichDarkPatterns(input, 'en');
    expect(en[0].risk).toBe('medium');
    expect(en[0].description).toContain('notable design pattern');

    const ko = enrichDarkPatterns(input, 'ko');
    expect(ko[0].description).toMatch(/[\uAC00-\uD7AF]/);
  });

  it('preserves original fields', () => {
    const input = [{ type: 'nagging', evidence: 'ev', context: 'ctx', elementType: 'popup' }];
    const result = enrichDarkPatterns(input, 'en');

    expect(result[0].evidence).toBe('ev');
    expect(result[0].context).toBe('ctx');
    expect(result[0].elementType).toBe('popup');
  });

  it('returns correct risk levels per type', () => {
    const expected: Record<string, string> = {
      'fake-urgency': 'medium',
      'confirm-shaming': 'high',
      'obstruction': 'critical',
      'nagging': 'low',
    };

    for (const [type, risk] of Object.entries(expected)) {
      const result = enrichDarkPatterns([makeRaw(type)], 'en');
      expect(result[0].risk).toBe(risk);
    }
  });

  it('handles empty input', () => {
    expect(enrichDarkPatterns([], 'en')).toEqual([]);
  });
});

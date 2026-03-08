import { describe, it, expect } from 'vitest';
import { extractDarkPatternEvidence } from '../../src/signals/darkpattern-signals.js';
import { detectDarkPatterns } from '../../src/darkpattern/detector.js';

/**
 * Verify that darkpattern-signals.ts and detector.ts detect the same types
 * for the same inputs. They use slightly different structures (signals has
 * locale-split rules, detector has combined rules) but should agree on types.
 */
describe('detector ↔ signals sync check', () => {
  const TEST_PHRASES = [
    // fake-urgency
    'Only 5 left in stock',
    'Limited time deal',
    'Deal of the Day',
    'Selling fast',
    '단 5개 남음',
    '오늘만 한정',
    // fake-social-proof
    '1K+ bought in past month',
    '50K+ ratings',
    'Best seller',
    'Popular pick',
    '1만건 판매',
    // confirm-shaming
    "No thanks, I don't want to save money",
    'Continue without saving',
    "I'd rather pay full price",
    // hidden-costs
    'Shipping calculated at checkout',
    'Import fees deposit',
    '배송비 별도',
    // misdirection
    'Recommended for you',
    'Most popular plan',
    // new types
    'From $9.99',
    'Taxes not included',
    'Subscribe to our newsletter',
    'Uncheck to opt out',
    'Sponsored product',
  ];

  for (const phrase of TEST_PHRASES) {
    it(`both detect same type for: "${phrase.slice(0, 40)}"`, () => {
      const signalMatches = extractDarkPatternEvidence(phrase);
      const detectorMatches = detectDarkPatterns(phrase);

      const signalTypes = new Set(signalMatches.map((m) => m.type));
      const detectorTypes = new Set(detectorMatches.map((m) => m.type));

      // At least one detector should find something
      const anyDetected = signalTypes.size > 0 || detectorTypes.size > 0;
      expect(anyDetected).toBe(true);

      // The types found should overlap (signals → detector)
      for (const t of signalTypes) {
        expect(detectorTypes.has(t)).toBe(true);
      }

      // Bidirectional: detector → signals
      for (const t of detectorTypes) {
        expect(signalTypes.has(t)).toBe(true);
      }
    });
  }
});

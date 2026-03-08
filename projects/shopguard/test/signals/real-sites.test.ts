import { describe, it, expect } from 'vitest';
import { extractDarkPatternEvidence } from '../../src/signals/darkpattern-signals.js';
import { EXPECTED_DETECTIONS, ALL_SITE_SNIPPETS } from '../fixtures/real-site-snippets.js';

describe('Real site dark pattern detection (signals)', () => {
  for (const det of EXPECTED_DETECTIONS) {
    it(`[${det.site}] detects ${det.expectedType} in: "${det.text.slice(0, 50)}"`, () => {
      const matches = extractDarkPatternEvidence(det.text);
      const types = matches.map((m) => m.type);
      expect(types).toContain(det.expectedType);
    });
  }

  describe('each site has at least 3 detectable patterns', () => {
    for (const [site, snippets] of Object.entries(ALL_SITE_SNIPPETS)) {
      it(`${site} snippets produce >= 3 pattern matches`, () => {
        const combined = snippets.join('\n');
        const matches = extractDarkPatternEvidence(combined);
        expect(matches.length).toBeGreaterThanOrEqual(3);
      });
    }
  });
});

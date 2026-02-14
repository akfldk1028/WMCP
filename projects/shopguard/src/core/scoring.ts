import type { TrustGrade, TrustScore } from './types.js';

/** Convert a 0-100 score to letter grade */
export function scoreToGrade(score: number): TrustGrade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  if (score >= 20) return 'E';
  return 'F';
}

/** Clamp a number to 0-100 range */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

const GRADE_SUMMARIES: Record<TrustGrade, string> = {
  A: 'Highly trustworthy — no significant issues detected',
  B: 'Generally trustworthy — minor concerns found',
  C: 'Mixed signals — some suspicious patterns detected',
  D: 'Caution advised — multiple warning signs',
  E: 'High risk — significant manipulation detected',
  F: 'Avoid — strong evidence of deception',
};

/**
 * Calculate combined trust score from all analysis dimensions.
 * Weights: reviews 50%, price 30%, dark patterns 20%
 */
export function calculateTrustScore(
  reviewScore: number,
  priceScore: number,
  darkPatternScore: number,
): TrustScore {
  const r = clamp(reviewScore);
  const p = clamp(priceScore);
  const d = clamp(darkPatternScore);

  const overall = Math.round(r * 0.5 + p * 0.3 + d * 0.2);
  const grade = scoreToGrade(overall);

  return {
    overall,
    grade,
    reviewScore: r,
    priceScore: p,
    darkPatternScore: d,
    summary: GRADE_SUMMARIES[grade],
  };
}

/**
 * Convert a suspicion score (0=clean, 100=suspicious) to a trust score (0=bad, 100=good).
 */
export function suspicionToTrust(suspicion: number): number {
  return clamp(100 - suspicion);
}

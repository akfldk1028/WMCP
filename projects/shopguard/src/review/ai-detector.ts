import type { AIDetectionResult } from '../core/types.js';
import { clamp } from '../core/scoring.js';

/**
 * Split text into sentences (handles both Korean and English).
 */
function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation
  const raw = text.split(/(?<=[.!?。！？])\s+|(?<=다[.!?])\s*/);
  return raw.filter((s) => s.trim().length > 0);
}

/**
 * Split text into words/tokens.
 * For Korean, split on whitespace (each 어절 is a token).
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/**
 * Burstiness: variance of sentence lengths.
 * Natural text has high variance (mix of short/long sentences).
 * AI text tends toward uniform sentence lengths → low burstiness.
 *
 * Returns 0-1 where higher = more natural (bursty).
 */
export function measureBurstiness(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return 0.5; // insufficient data

  const lengths = sentences.map((s) => tokenize(s).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return 0.5;

  const variance =
    lengths.reduce((sum, len) => sum + (len - mean) ** 2, 0) / lengths.length;
  const cv = Math.sqrt(variance) / mean; // coefficient of variation

  // CV > 0.6 is natural, < 0.3 is AI-like
  return Math.min(1, cv / 0.6);
}

/**
 * Type-Token Ratio: unique words / total words.
 * Higher TTR = richer vocabulary = more likely human.
 * AI text tends to reuse vocabulary more.
 *
 * Returns 0-1 where higher = richer vocabulary.
 */
export function measureTTR(text: string): number {
  const tokens = tokenize(text);
  if (tokens.length < 5) return 0.5; // insufficient data

  const unique = new Set(tokens);
  const rawTTR = unique.size / tokens.length;

  // Normalize: TTR naturally decreases with length (Herdan's law)
  // For short texts (~50 words), TTR ~0.7 is normal
  // For longer texts (~200 words), TTR ~0.5 is normal
  const expectedTTR = 0.8 - 0.15 * Math.log10(tokens.length);
  return Math.min(1, rawTTR / Math.max(expectedTTR, 0.3));
}

/**
 * Exclamation density: ratio of exclamatory expressions.
 * Natural reviews tend to have some emotional markers.
 * AI text is often more neutral and measured.
 *
 * Returns density as a ratio (0-1).
 */
export function measureExclamationDensity(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;

  let exclamatory = 0;
  for (const s of sentences) {
    if (/[!！]/.test(s)) exclamatory++;
    // Korean emotional endings
    if (/[ㅋㅎㅠㅜ]{2,}/.test(s)) exclamatory++;
    if (/(?:대박|짱|최고|굳|꿀)/.test(s)) exclamatory++;
  }

  return exclamatory / sentences.length;
}

/**
 * Detect likelihood that a text was AI-generated.
 *
 * Combines:
 * - Burstiness (sentence length variance) — low = AI
 * - TTR (vocabulary diversity) — low relative to length = AI
 * - Exclamation density — very low (robotic) or very high (fake) = suspicious
 *
 * Returns AIDetectionResult with score 0-100 (higher = more likely AI).
 */
export function detectAIGenerated(text: string): AIDetectionResult {
  const details: string[] = [];

  // Burstiness
  const burstiness = measureBurstiness(text);
  let bScore = 0;
  if (burstiness < 0.3) {
    bScore = 80;
    details.push('Very uniform sentence lengths (low burstiness)');
  } else if (burstiness < 0.5) {
    bScore = 40;
    details.push('Somewhat uniform sentence lengths');
  }

  // TTR
  const ttr = measureTTR(text);
  let tScore = 0;
  if (ttr < 0.5) {
    tScore = 70;
    details.push('Low vocabulary diversity');
  } else if (ttr < 0.7) {
    tScore = 30;
    details.push('Moderate vocabulary diversity');
  }

  // Exclamation density
  const excDensity = measureExclamationDensity(text);
  let eScore = 0;
  if (excDensity < 0.05) {
    eScore = 40;
    details.push('Very low emotional expression');
  } else if (excDensity > 0.7) {
    eScore = 30;
    details.push('Unusually high emotional expression');
  }

  // Weighted combination
  const rawScore = bScore * 0.45 + tScore * 0.35 + eScore * 0.2;
  const score = clamp(Math.round(rawScore));

  if (details.length === 0) {
    details.push('Text appears natural');
  }

  return {
    score,
    burstiness,
    ttr,
    exclamationDensity: excDensity,
    details,
  };
}

/**
 * Batch-detect AI generation across multiple review texts.
 * Returns average AI score for the set.
 */
export function detectAIGeneratedBatch(texts: string[]): {
  averageScore: number;
  individualScores: number[];
} {
  if (texts.length === 0) return { averageScore: 0, individualScores: [] };

  const scores = texts.map((t) => detectAIGenerated(t).score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return { averageScore: avg, individualScores: scores };
}

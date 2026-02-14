import type {
  Review,
  ReviewAnalysis,
  ReviewFlag,
  HeuristicScores,
  Locale,
} from '../core/types.js';
import { clamp, scoreToGrade, suspicionToTrust } from '../core/scoring.js';
import { findIncentiveKeywords } from './patterns.js';
import { detectAIGeneratedBatch } from './ai-detector.js';

// ── Heuristic 1: Date Clustering ──

/**
 * Detect unnatural clustering of review dates.
 * If many reviews arrive on the same day or within a narrow window,
 * it suggests coordinated fake review campaigns.
 *
 * Returns suspicion score 0-100.
 */
export function analyzeDateClustering(reviews: Review[]): number {
  if (reviews.length < 5) return 0;

  const dates = reviews
    .map((r) => new Date(r.date).getTime())
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b);

  if (dates.length < 5) return 0;

  // Count reviews per day
  const dayCounts = new Map<string, number>();
  for (const ts of dates) {
    const day = new Date(ts).toISOString().slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }

  // Find the max reviews in a single day
  const maxPerDay = Math.max(...dayCounts.values());

  // Concentration: what fraction of all reviews is on the busiest day
  const concentration = maxPerDay / dates.length;

  if (concentration >= 0.8) return 95;
  if (concentration >= 0.6) return 75;
  if (concentration >= 0.4) return 55;
  if (concentration >= 0.25) return 30;
  return 0;
}

// ── Heuristic 2: Rating Distribution ──

/**
 * Analyze rating distribution for abnormal patterns.
 * Normal products have a bell-curve or slight J-curve.
 * Fake reviews skew heavily toward 5-star.
 *
 * Returns suspicion score 0-100.
 */
export function analyzeRatingDistribution(reviews: Review[]): number {
  if (reviews.length < 5) return 0;

  const counts = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
  for (const r of reviews) {
    const idx = Math.max(0, Math.min(4, Math.round(r.rating) - 1));
    counts[idx]++;
  }

  const total = reviews.length;
  const fiveStarRate = counts[4] / total;
  const oneStarRate = counts[0] / total;

  // Extremely high 5-star rate
  if (fiveStarRate > 0.9) return 90;
  if (fiveStarRate > 0.8) return 70;
  if (fiveStarRate > 0.7) return 45;

  // J-curve: lots of 5-star AND 1-star but nothing in between
  const middleRate = (counts[1] + counts[2] + counts[3]) / total;
  if (fiveStarRate > 0.5 && oneStarRate > 0.2 && middleRate < 0.15) {
    return 60; // Polarized = mixed real + fake
  }

  return 0;
}

// ── Heuristic 3: Phrase Repetition ──

/**
 * Detect repeated phrases across reviews using N-gram overlap.
 * Fake review farms often use templated text with minor variations.
 *
 * Returns suspicion score 0-100.
 */
export function analyzePhraseRepetition(reviews: Review[]): number {
  if (reviews.length < 3) return 0;

  const ngramSize = 3;
  const allNgrams: Map<string, Set<number>> = new Map();

  for (let i = 0; i < reviews.length; i++) {
    const words = reviews[i].text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter((w) => w.length > 0);

    for (let j = 0; j <= words.length - ngramSize; j++) {
      const ngram = words.slice(j, j + ngramSize).join(' ');
      if (!allNgrams.has(ngram)) {
        allNgrams.set(ngram, new Set());
      }
      allNgrams.get(ngram)!.add(i);
    }
  }

  // Count ngrams that appear in multiple reviews
  let sharedNgrams = 0;
  let totalNgrams = 0;
  for (const [, reviewIds] of allNgrams) {
    totalNgrams++;
    if (reviewIds.size >= 2) {
      sharedNgrams++;
    }
  }

  if (totalNgrams === 0) return 0;
  const repetitionRate = sharedNgrams / totalNgrams;

  if (repetitionRate > 0.3) return 90;
  if (repetitionRate > 0.2) return 70;
  if (repetitionRate > 0.1) return 45;
  if (repetitionRate > 0.05) return 20;
  return 0;
}

// ── Heuristic 4: Length Uniformity ──

/**
 * Detect suspiciously uniform review lengths.
 * AI-generated or templated reviews tend to have similar word counts.
 * Natural reviews vary widely (some one-liners, some paragraphs).
 *
 * Returns suspicion score 0-100.
 */
export function analyzeLengthUniformity(reviews: Review[]): number {
  if (reviews.length < 5) return 0;

  const lengths = reviews.map(
    (r) => r.text.split(/\s+/).filter((w) => w.length > 0).length,
  );

  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return 0;

  const variance =
    lengths.reduce((sum, len) => sum + (len - mean) ** 2, 0) / lengths.length;
  const cv = Math.sqrt(variance) / mean; // coefficient of variation

  // CV < 0.2 is suspiciously uniform
  if (cv < 0.15) return 85;
  if (cv < 0.25) return 55;
  if (cv < 0.35) return 25;
  return 0;
}

// ── Heuristic 5: Incentive Keywords ──

/**
 * Detect reviews containing incentivized/sponsored disclosure keywords.
 * While disclosure is good, a high rate suggests artificial review inflation.
 *
 * Returns suspicion score 0-100.
 */
export function analyzeIncentiveKeywords(
  reviews: Review[],
  locale: Locale,
): number {
  if (reviews.length === 0) return 0;

  let incentivized = 0;
  for (const r of reviews) {
    const matches = findIncentiveKeywords(r.text, locale);
    if (matches.length > 0) incentivized++;
  }

  const rate = incentivized / reviews.length;

  if (rate > 0.5) return 90;
  if (rate > 0.3) return 65;
  if (rate > 0.15) return 40;
  if (rate > 0.05) return 15;
  return 0;
}

// ── Heuristic 6: Rating Surge ──

/**
 * Detect sudden spikes of 5-star reviews within short time windows.
 * Genuine products rarely see sudden bursts of perfect scores.
 *
 * Returns suspicion score 0-100.
 */
export function analyzeRatingSurge(reviews: Review[]): number {
  if (reviews.length < 10) return 0;

  // Group by week
  const weeklyHigh: Map<string, { total: number; fiveStar: number }> =
    new Map();

  for (const r of reviews) {
    const d = new Date(r.date);
    if (isNaN(d.getTime())) continue;

    // Get ISO week key
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);

    if (!weeklyHigh.has(key)) {
      weeklyHigh.set(key, { total: 0, fiveStar: 0 });
    }
    const week = weeklyHigh.get(key)!;
    week.total++;
    if (r.rating >= 4.5) week.fiveStar++;
  }

  if (weeklyHigh.size < 2) return 0;

  // Calculate baseline weekly average
  const weeks = [...weeklyHigh.values()];
  const avgTotal =
    weeks.reduce((s, w) => s + w.total, 0) / weeks.length;
  const avgFiveStar =
    weeks.reduce((s, w) => s + w.fiveStar, 0) / weeks.length;

  // Find weeks with abnormal 5-star surges
  let surgeWeeks = 0;
  for (const week of weeks) {
    if (
      week.fiveStar > avgFiveStar * 3 &&
      week.total > avgTotal * 2 &&
      week.fiveStar / week.total > 0.85
    ) {
      surgeWeeks++;
    }
  }

  const surgeRate = surgeWeeks / weeks.length;
  if (surgeRate > 0.3) return 90;
  if (surgeRate > 0.15) return 65;
  if (surgeRate > 0.05) return 35;
  return 0;
}

// ── Main Analyzer ──

export interface AnalyzeOptions {
  locale?: Locale;
  /** Threshold for flagging individual reviews (0-100) */
  flagThreshold?: number;
}

/**
 * Analyze a set of product reviews for authenticity.
 *
 * Runs 6 heuristics + AI detection to produce a trust grade (A-F).
 * No ML models needed — pure statistical/pattern analysis.
 */
export function analyzeReviews(
  reviews: Review[],
  options: AnalyzeOptions = {},
): ReviewAnalysis {
  const { locale = 'ko', flagThreshold = 50 } = options;

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      suspiciousCount: 0,
      suspicionRate: 0,
      heuristics: {
        dateCluster: 0,
        ratingDistribution: 0,
        phraseRepetition: 0,
        lengthUniformity: 0,
        incentiveKeyword: 0,
        ratingSurge: 0,
      },
      aiScore: 0,
      overallScore: 100,
      grade: 'A',
      flags: [],
      details: ['No reviews to analyze'],
    };
  }

  // Run 6 heuristics
  const heuristics: HeuristicScores = {
    dateCluster: analyzeDateClustering(reviews),
    ratingDistribution: analyzeRatingDistribution(reviews),
    phraseRepetition: analyzePhraseRepetition(reviews),
    lengthUniformity: analyzeLengthUniformity(reviews),
    incentiveKeyword: analyzeIncentiveKeywords(reviews, locale),
    ratingSurge: analyzeRatingSurge(reviews),
  };

  // AI detection
  const aiResult = detectAIGeneratedBatch(reviews.map((r) => r.text));
  const aiScore = aiResult.averageScore;

  // Weighted suspicion from heuristics
  const heuristicSuspicion =
    heuristics.dateCluster * 0.2 +
    heuristics.ratingDistribution * 0.2 +
    heuristics.phraseRepetition * 0.15 +
    heuristics.lengthUniformity * 0.1 +
    heuristics.incentiveKeyword * 0.15 +
    heuristics.ratingSurge * 0.2;

  // Combine heuristic suspicion (70%) + AI score (30%)
  const totalSuspicion = clamp(
    Math.round(heuristicSuspicion * 0.7 + aiScore * 0.3),
  );
  const overallScore = suspicionToTrust(totalSuspicion);
  const grade = scoreToGrade(overallScore);

  // Flag individual reviews
  const flags: ReviewFlag[] = [];
  for (let i = 0; i < reviews.length; i++) {
    const reviewFlags: string[] = [];
    let reviewSuspicion = 0;

    // Check incentive keywords
    const incentiveMatches = findIncentiveKeywords(reviews[i].text, locale);
    if (incentiveMatches.length > 0) {
      reviewFlags.push(`Incentive keywords: ${incentiveMatches.join(', ')}`);
      reviewSuspicion += 30;
    }

    // Check AI score for this review
    if (aiResult.individualScores[i] > 60) {
      reviewFlags.push('Likely AI-generated text');
      reviewSuspicion += aiResult.individualScores[i] * 0.5;
    }

    // Check if this review is very short (possible fake)
    const wordCount = reviews[i].text.split(/\s+/).length;
    if (wordCount < 5 && reviews[i].rating === 5) {
      reviewFlags.push('Very short 5-star review');
      reviewSuspicion += 20;
    }

    const score = clamp(Math.round(reviewSuspicion));
    if (score >= flagThreshold) {
      flags.push({ reviewIndex: i, flags: reviewFlags, suspicionScore: score });
    }
  }

  // Build detail messages
  const details: string[] = [];
  if (heuristics.dateCluster > 50)
    details.push(`Date clustering detected (score: ${heuristics.dateCluster})`);
  if (heuristics.ratingDistribution > 50)
    details.push(
      `Abnormal rating distribution (score: ${heuristics.ratingDistribution})`,
    );
  if (heuristics.phraseRepetition > 50)
    details.push(
      `High phrase repetition across reviews (score: ${heuristics.phraseRepetition})`,
    );
  if (heuristics.lengthUniformity > 50)
    details.push(
      `Suspiciously uniform review lengths (score: ${heuristics.lengthUniformity})`,
    );
  if (heuristics.incentiveKeyword > 50)
    details.push(
      `High rate of incentivized reviews (score: ${heuristics.incentiveKeyword})`,
    );
  if (heuristics.ratingSurge > 50)
    details.push(
      `5-star rating surge detected (score: ${heuristics.ratingSurge})`,
    );
  if (aiScore > 50)
    details.push(`Potential AI-generated reviews (score: ${aiScore})`);

  if (details.length === 0) {
    details.push('No significant issues detected');
  }

  return {
    totalReviews: reviews.length,
    suspiciousCount: flags.length,
    suspicionRate: flags.length / reviews.length,
    heuristics,
    aiScore,
    overallScore,
    grade,
    flags,
    details,
  };
}

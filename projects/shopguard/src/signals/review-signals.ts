import type { Review, Locale, SignalEvidence } from '../core/types.js';
import { findIncentiveKeywords } from './patterns.js';
import { detectAIGeneratedBatch } from './ai-signals.js';

// ── Heuristic 1: Date Clustering → SignalEvidence ──

export function detectDateClustering(reviews: Review[]): SignalEvidence {
  if (reviews.length < 5) return { score: 0, evidence: [] };

  const dates = reviews
    .map((r) => new Date(r.date).getTime())
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b);

  if (dates.length < 5) return { score: 0, evidence: [] };

  const dayCounts = new Map<string, number>();
  for (const ts of dates) {
    const day = new Date(ts).toISOString().slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }

  const maxPerDay = Math.max(...dayCounts.values());
  const concentration = maxPerDay / dates.length;
  const peakDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  let score = 0;
  if (concentration >= 0.8) score = 95;
  else if (concentration >= 0.6) score = 75;
  else if (concentration >= 0.4) score = 55;
  else if (concentration >= 0.25) score = 30;

  const evidence: string[] = [];
  if (score > 0) {
    evidence.push(
      `${peakDay[1]}/${dates.length} reviews on ${peakDay[0]} (${(concentration * 100).toFixed(0)}% concentration)`,
    );
    const uniqueDays = dayCounts.size;
    evidence.push(`${dates.length} reviews spread across ${uniqueDays} unique days`);
  }

  return { score, evidence, rawData: { peakDay: peakDay[0], peakCount: peakDay[1], totalDays: dayCounts.size } };
}

// ── Heuristic 2: Rating Distribution → SignalEvidence ──

export function detectRatingAnomaly(reviews: Review[]): SignalEvidence {
  if (reviews.length < 5) return { score: 0, evidence: [] };

  const counts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const idx = Math.max(0, Math.min(4, Math.round(r.rating) - 1));
    counts[idx]++;
  }

  const total = reviews.length;
  const fiveStarRate = counts[4] / total;
  const oneStarRate = counts[0] / total;
  const middleRate = (counts[1] + counts[2] + counts[3]) / total;

  let score = 0;
  const evidence: string[] = [];

  if (fiveStarRate > 0.9) {
    score = 90;
    evidence.push(`${(fiveStarRate * 100).toFixed(0)}% are 5-star (${counts[4]}/${total})`);
  } else if (fiveStarRate > 0.8) {
    score = 70;
    evidence.push(`${(fiveStarRate * 100).toFixed(0)}% are 5-star (${counts[4]}/${total})`);
  } else if (fiveStarRate > 0.7) {
    score = 45;
    evidence.push(`${(fiveStarRate * 100).toFixed(0)}% are 5-star`);
  }

  if (fiveStarRate > 0.5 && oneStarRate > 0.2 && middleRate < 0.15) {
    if (score < 60) score = 60;
    evidence.push(
      `J-curve: ${(fiveStarRate * 100).toFixed(0)}% five-star + ${(oneStarRate * 100).toFixed(0)}% one-star, only ${(middleRate * 100).toFixed(0)}% middle`,
    );
  }

  if (evidence.length > 0) {
    evidence.push(`Distribution: ★1=${counts[0]} ★2=${counts[1]} ★3=${counts[2]} ★4=${counts[3]} ★5=${counts[4]}`);
  }

  return { score, evidence, rawData: { counts, fiveStarRate, oneStarRate, middleRate } };
}

// ── Heuristic 3: Phrase Repetition → SignalEvidence ──

export function detectPhraseRepetition(reviews: Review[]): SignalEvidence {
  if (reviews.length < 3) return { score: 0, evidence: [] };

  const ngramSize = 3;
  const allNgrams = new Map<string, Set<number>>();

  for (let i = 0; i < reviews.length; i++) {
    const words = reviews[i].text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter((w) => w.length > 0);

    for (let j = 0; j <= words.length - ngramSize; j++) {
      const ngram = words.slice(j, j + ngramSize).join(' ');
      if (!allNgrams.has(ngram)) allNgrams.set(ngram, new Set());
      allNgrams.get(ngram)!.add(i);
    }
  }

  let sharedNgrams = 0;
  let totalNgrams = 0;
  const topRepeated: Array<{ ngram: string; count: number }> = [];

  for (const [ngram, reviewIds] of allNgrams) {
    totalNgrams++;
    if (reviewIds.size >= 2) {
      sharedNgrams++;
      if (topRepeated.length < 5 || reviewIds.size > topRepeated[topRepeated.length - 1].count) {
        topRepeated.push({ ngram, count: reviewIds.size });
        topRepeated.sort((a, b) => b.count - a.count);
        if (topRepeated.length > 5) topRepeated.pop();
      }
    }
  }

  if (totalNgrams === 0) return { score: 0, evidence: [] };
  const repetitionRate = sharedNgrams / totalNgrams;

  let score = 0;
  if (repetitionRate > 0.3) score = 90;
  else if (repetitionRate > 0.2) score = 70;
  else if (repetitionRate > 0.1) score = 45;
  else if (repetitionRate > 0.05) score = 20;

  const evidence: string[] = [];
  if (score > 0) {
    evidence.push(
      `${sharedNgrams}/${totalNgrams} 3-grams appear in multiple reviews (${(repetitionRate * 100).toFixed(1)}%)`,
    );
    for (const r of topRepeated.slice(0, 3)) {
      evidence.push(`"${r.ngram}" appears in ${r.count} reviews`);
    }
  }

  return { score, evidence, rawData: { repetitionRate, sharedNgrams, totalNgrams } };
}

// ── Heuristic 4: Length Uniformity → SignalEvidence ──

export function detectLengthUniformity(reviews: Review[]): SignalEvidence {
  if (reviews.length < 5) return { score: 0, evidence: [] };

  const lengths = reviews.map(
    (r) => r.text.split(/\s+/).filter((w) => w.length > 0).length,
  );

  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return { score: 0, evidence: [] };

  const variance =
    lengths.reduce((sum, len) => sum + (len - mean) ** 2, 0) / lengths.length;
  const cv = Math.sqrt(variance) / mean;

  let score = 0;
  if (cv < 0.15) score = 85;
  else if (cv < 0.25) score = 55;
  else if (cv < 0.35) score = 25;

  const evidence: string[] = [];
  if (score > 0) {
    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    evidence.push(
      `Word counts range ${min}-${max} (mean=${mean.toFixed(1)}, CV=${cv.toFixed(2)})`,
    );
    evidence.push(`Low coefficient of variation suggests templated reviews`);
  }

  return { score, evidence, rawData: { mean, cv, min: Math.min(...lengths), max: Math.max(...lengths) } };
}

// ── Heuristic 5: Incentive Keywords → SignalEvidence ──

export function detectIncentiveKeywords(reviews: Review[], locale: Locale): SignalEvidence {
  if (reviews.length === 0) return { score: 0, evidence: [] };

  let incentivized = 0;
  const allMatches: Array<{ index: number; keywords: string[] }> = [];

  for (let i = 0; i < reviews.length; i++) {
    const matches = findIncentiveKeywords(reviews[i].text, locale);
    if (matches.length > 0) {
      incentivized++;
      allMatches.push({ index: i, keywords: matches });
    }
  }

  const rate = incentivized / reviews.length;

  let score = 0;
  if (rate > 0.5) score = 90;
  else if (rate > 0.3) score = 65;
  else if (rate > 0.15) score = 40;
  else if (rate > 0.05) score = 15;

  const evidence: string[] = [];
  if (score > 0) {
    evidence.push(`${incentivized}/${reviews.length} reviews contain incentive keywords (${(rate * 100).toFixed(0)}%)`);
    for (const m of allMatches.slice(0, 3)) {
      evidence.push(`Review #${m.index}: "${m.keywords.join('", "')}"`);
    }
  }

  return { score, evidence, rawData: { incentivized, rate, matches: allMatches } };
}

// ── Heuristic 6: Rating Surge → SignalEvidence ──

export function detectRatingSurge(reviews: Review[]): SignalEvidence {
  if (reviews.length < 10) return { score: 0, evidence: [] };

  const weeklyHigh = new Map<string, { total: number; fiveStar: number }>();

  for (const r of reviews) {
    const d = new Date(r.date);
    if (isNaN(d.getTime())) continue;

    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);

    if (!weeklyHigh.has(key)) weeklyHigh.set(key, { total: 0, fiveStar: 0 });
    const week = weeklyHigh.get(key)!;
    week.total++;
    if (r.rating >= 4.5) week.fiveStar++;
  }

  if (weeklyHigh.size < 2) return { score: 0, evidence: [] };

  const weeks = [...weeklyHigh.entries()];
  const avgTotal = weeks.reduce((s, [, w]) => s + w.total, 0) / weeks.length;
  const avgFiveStar = weeks.reduce((s, [, w]) => s + w.fiveStar, 0) / weeks.length;

  const surgeWeeks: string[] = [];
  for (const [key, week] of weeks) {
    if (
      week.fiveStar > avgFiveStar * 3 &&
      week.total > avgTotal * 2 &&
      week.fiveStar / week.total > 0.85
    ) {
      surgeWeeks.push(key);
    }
  }

  const surgeRate = surgeWeeks.length / weeks.length;
  let score = 0;
  if (surgeRate > 0.3) score = 90;
  else if (surgeRate > 0.15) score = 65;
  else if (surgeRate > 0.05) score = 35;

  const evidence: string[] = [];
  if (score > 0) {
    evidence.push(
      `${surgeWeeks.length}/${weeks.length} weeks show 5-star surges (avg ${avgTotal.toFixed(1)} reviews/week, avg ${avgFiveStar.toFixed(1)} five-star/week)`,
    );
    for (const w of surgeWeeks.slice(0, 3)) {
      const data = weeklyHigh.get(w)!;
      evidence.push(`Week of ${w}: ${data.fiveStar}/${data.total} five-star reviews`);
    }
  }

  return { score, evidence, rawData: { surgeWeeks, surgeRate, avgTotal, avgFiveStar } };
}

// ── AI Detection → SignalEvidence ──

export function detectAIGeneration(reviews: Review[]): SignalEvidence {
  if (reviews.length === 0) return { score: 0, evidence: [] };

  const result = detectAIGeneratedBatch(reviews.map((r) => r.text));
  const evidence: string[] = [];

  if (result.averageScore > 50) {
    evidence.push(`Average AI-generation score: ${result.averageScore}/100`);
    const highScores = result.individualScores
      .map((s, i) => ({ index: i, score: s }))
      .filter((x) => x.score > 60)
      .sort((a, b) => b.score - a.score);
    for (const h of highScores.slice(0, 3)) {
      evidence.push(`Review #${h.index} scores ${h.score}/100 for AI-generation`);
    }
  }

  return { score: result.averageScore, evidence, rawData: result };
}

// ── Aggregate: all 6 heuristics + AI ──

export function analyzeReviewSignals(
  reviews: Review[],
  locale: Locale = 'ko',
): Record<string, SignalEvidence> {
  return {
    dateCluster: detectDateClustering(reviews),
    ratingAnomaly: detectRatingAnomaly(reviews),
    phraseRepetition: detectPhraseRepetition(reviews),
    lengthUniformity: detectLengthUniformity(reviews),
    incentiveKeywords: detectIncentiveKeywords(reviews, locale),
    ratingSurge: detectRatingSurge(reviews),
    aiGeneration: detectAIGeneration(reviews),
  };
}

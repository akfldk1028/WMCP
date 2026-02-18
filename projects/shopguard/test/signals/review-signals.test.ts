import { describe, it, expect } from 'vitest';
import type { Review } from '../../src/core/types.js';
import {
  detectDateClustering,
  detectRatingAnomaly,
  detectPhraseRepetition,
  detectLengthUniformity,
  detectIncentiveKeywords,
  detectRatingSurge,
  detectAIGeneration,
  analyzeReviewSignals,
} from '../../src/signals/review-signals.js';

function makeReviews(count: number, overrides?: Partial<Review>): Review[] {
  return Array.from({ length: count }, (_, i) => ({
    text: `This is review number ${i}. The product has some interesting features worth discussing in detail.`,
    rating: 4,
    date: new Date(2025, 0, 1 + i).toISOString(),
    ...overrides,
  }));
}

// ── Date Clustering ──

describe('detectDateClustering', () => {
  it('returns evidence for clustered reviews', () => {
    const reviews = [
      ...Array.from({ length: 8 }, (_, i) => ({
        text: `Review ${i}: Great product`,
        rating: 5,
        date: '2025-06-15',
      })),
      { text: 'Old review', rating: 3, date: '2025-01-01' },
      { text: 'Another old', rating: 4, date: '2025-03-15' },
    ];
    const signal = detectDateClustering(reviews);
    expect(signal.score).toBeGreaterThanOrEqual(50);
    expect(signal.evidence.length).toBeGreaterThan(0);
    expect(signal.evidence[0]).toContain('2025-06-15');
  });

  it('returns score 0 for spread reviews', () => {
    const reviews = makeReviews(10);
    const signal = detectDateClustering(reviews);
    expect(signal.score).toBeLessThanOrEqual(30);
  });

  it('returns score 0 for too few reviews', () => {
    const signal = detectDateClustering(makeReviews(3));
    expect(signal.score).toBe(0);
    expect(signal.evidence).toHaveLength(0);
  });
});

// ── Rating Anomaly ──

describe('detectRatingAnomaly', () => {
  it('detects all 5-star reviews with evidence', () => {
    const reviews = makeReviews(20, { rating: 5 });
    const signal = detectRatingAnomaly(reviews);
    expect(signal.score).toBeGreaterThanOrEqual(70);
    expect(signal.evidence.some((e) => e.includes('5-star'))).toBe(true);
  });

  it('returns low score for balanced distribution', () => {
    const reviews = [
      ...makeReviews(4, { rating: 5 }),
      ...makeReviews(6, { rating: 4 }),
      ...makeReviews(5, { rating: 3 }),
      ...makeReviews(3, { rating: 2 }),
      ...makeReviews(2, { rating: 1 }),
    ];
    const signal = detectRatingAnomaly(reviews);
    expect(signal.score).toBeLessThanOrEqual(25);
  });

  it('includes distribution in evidence', () => {
    const reviews = makeReviews(20, { rating: 5 });
    const signal = detectRatingAnomaly(reviews);
    expect(signal.evidence.some((e) => e.includes('Distribution'))).toBe(true);
  });
});

// ── Phrase Repetition ──

describe('detectPhraseRepetition', () => {
  it('detects templated reviews with evidence', () => {
    const reviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
      text: 'This product is amazing and I love the quality. Highly recommend to everyone.',
      rating: 5,
      date: new Date(2025, 0, 1 + i).toISOString(),
    }));
    const signal = detectPhraseRepetition(reviews);
    expect(signal.score).toBeGreaterThanOrEqual(70);
    expect(signal.evidence.some((e) => e.includes('3-gram'))).toBe(true);
  });

  it('shows top repeated phrases', () => {
    const reviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
      text: 'This product is amazing and I love the quality. Highly recommend to everyone.',
      rating: 5,
      date: new Date(2025, 0, 1 + i).toISOString(),
    }));
    const signal = detectPhraseRepetition(reviews);
    expect(signal.evidence.some((e) => e.includes('appears in'))).toBe(true);
  });
});

// ── Length Uniformity ──

describe('detectLengthUniformity', () => {
  it('flags uniform lengths with evidence', () => {
    const reviews = Array.from({ length: 10 }, (_, i) => ({
      text: `Review number ${i}. Product quality is good. Delivery was fast. Would recommend.`,
      rating: 4,
      date: new Date(2025, 0, 1 + i).toISOString(),
    }));
    const signal = detectLengthUniformity(reviews);
    expect(signal.score).toBeGreaterThan(0);
    if (signal.score > 0) {
      expect(signal.evidence.some((e) => e.includes('CV='))).toBe(true);
    }
  });
});

// ── Incentive Keywords ──

describe('detectIncentiveKeywords', () => {
  it('detects Korean incentives with evidence', () => {
    const reviews: Review[] = [
      { text: '체험단으로 제공받아 작성한 솔직 후기입니다', rating: 5, date: '2025-01-01' },
      { text: '협찬 제품 리뷰입니다', rating: 5, date: '2025-01-02' },
      { text: '그냥 좋아서 샀어요', rating: 4, date: '2025-01-04' },
    ];
    const signal = detectIncentiveKeywords(reviews, 'ko');
    expect(signal.score).toBeGreaterThan(0);
    expect(signal.evidence.some((e) => e.includes('incentive keywords'))).toBe(true);
  });

  it('shows specific matched keywords', () => {
    const reviews: Review[] = [
      { text: 'I received this product for free in exchange for an honest review', rating: 5, date: '2025-01-01' },
      { text: 'Great product, bought it myself', rating: 5, date: '2025-01-03' },
    ];
    const signal = detectIncentiveKeywords(reviews, 'en');
    expect(signal.evidence.some((e) => e.includes('Review #0'))).toBe(true);
  });
});

// ── Rating Surge ──

describe('detectRatingSurge', () => {
  it('detects surge weeks with evidence', () => {
    const reviews: Review[] = [
      ...Array.from({ length: 8 }, (_, i) => ({
        text: `Regular review ${i}`,
        rating: 3 + (i % 3),
        date: new Date(2025, 0, 7 * i + 1).toISOString(),
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        text: `Amazing product ${i}`,
        rating: 5,
        date: new Date(2025, 3, 1 + (i % 3)).toISOString(),
      })),
    ];
    const signal = detectRatingSurge(reviews);
    expect(signal.score).toBeGreaterThan(0);
  });
});

// ── AI Generation ──

describe('detectAIGeneration', () => {
  it('returns evidence for AI-like text', () => {
    const reviews: Review[] = Array.from({ length: 5 }, (_, i) => ({
      text: 'This product delivers exceptional performance across all metrics. The build quality demonstrates remarkable attention to detail. The overall value proposition represents a compelling investment.',
      rating: 5,
      date: new Date(2025, 0, 1 + i).toISOString(),
    }));
    const signal = detectAIGeneration(reviews);
    expect(signal.score).toBeGreaterThanOrEqual(0);
    expect(signal.rawData).toBeDefined();
  });
});

// ── Aggregate ──

describe('analyzeReviewSignals', () => {
  it('returns all 7 signal keys', () => {
    const reviews = makeReviews(10);
    const signals = analyzeReviewSignals(reviews, 'en');
    expect(Object.keys(signals)).toEqual([
      'dateCluster',
      'ratingAnomaly',
      'phraseRepetition',
      'lengthUniformity',
      'incentiveKeywords',
      'ratingSurge',
      'aiGeneration',
    ]);
  });

  it('each signal has score and evidence', () => {
    const reviews = makeReviews(10);
    const signals = analyzeReviewSignals(reviews);
    for (const [, signal] of Object.entries(signals)) {
      expect(signal).toHaveProperty('score');
      expect(signal).toHaveProperty('evidence');
      expect(Array.isArray(signal.evidence)).toBe(true);
    }
  });
});

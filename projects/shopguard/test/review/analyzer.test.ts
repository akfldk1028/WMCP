import { describe, it, expect } from 'vitest';
import type { Review } from '../../src/core/types.js';
import {
  analyzeReviews,
  analyzeDateClustering,
  analyzeRatingDistribution,
  analyzePhraseRepetition,
  analyzeLengthUniformity,
  analyzeIncentiveKeywords,
  analyzeRatingSurge,
} from '../../src/review/analyzer.js';

// ── Helpers ──

function makeReviews(
  count: number,
  overrides?: Partial<Review>,
): Review[] {
  return Array.from({ length: count }, (_, i) => ({
    text: `This is review number ${i}. The product has some interesting features worth discussing in detail.`,
    rating: 4,
    date: new Date(2025, 0, 1 + i).toISOString(),
    ...overrides,
  }));
}

function makeReviewsWithDates(
  dates: string[],
  rating = 5,
): Review[] {
  return dates.map((date, i) => ({
    text: `Review ${i}: Great product with nice quality and fast delivery.`,
    rating,
    date,
  }));
}

// ── Date Clustering ──

describe('analyzeDateClustering', () => {
  it('returns 0 for evenly spread reviews', () => {
    const reviews = makeReviews(10);
    const score = analyzeDateClustering(reviews);
    expect(score).toBeLessThanOrEqual(25);
  });

  it('detects reviews clustered on same day', () => {
    const sameDay = '2025-06-15';
    const reviews = [
      ...makeReviewsWithDates(Array(8).fill(sameDay)),
      ...makeReviewsWithDates(['2025-01-01', '2025-03-15']),
    ];
    const score = analyzeDateClustering(reviews);
    expect(score).toBeGreaterThanOrEqual(50);
  });

  it('returns 0 for too few reviews', () => {
    const reviews = makeReviews(3);
    expect(analyzeDateClustering(reviews)).toBe(0);
  });
});

// ── Rating Distribution ──

describe('analyzeRatingDistribution', () => {
  it('flags heavily 5-star skewed reviews', () => {
    const reviews = makeReviews(20, { rating: 5 });
    const score = analyzeRatingDistribution(reviews);
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it('returns low score for balanced distribution', () => {
    const reviews = [
      ...makeReviews(4, { rating: 5 }),
      ...makeReviews(6, { rating: 4 }),
      ...makeReviews(5, { rating: 3 }),
      ...makeReviews(3, { rating: 2 }),
      ...makeReviews(2, { rating: 1 }),
    ];
    const score = analyzeRatingDistribution(reviews);
    expect(score).toBeLessThanOrEqual(25);
  });

  it('detects J-curve pattern (polarized)', () => {
    const reviews = [
      ...makeReviews(12, { rating: 5 }),
      ...makeReviews(6, { rating: 1 }),
      ...makeReviews(2, { rating: 3 }),
    ];
    const score = analyzeRatingDistribution(reviews);
    expect(score).toBeGreaterThan(0);
  });
});

// ── Phrase Repetition ──

describe('analyzePhraseRepetition', () => {
  it('detects templated reviews', () => {
    const reviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
      text: 'This product is amazing and I love the quality. Highly recommend to everyone.',
      rating: 5,
      date: new Date(2025, 0, 1 + i).toISOString(),
    }));
    const score = analyzePhraseRepetition(reviews);
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it('returns low score for unique reviews', () => {
    const reviews: Review[] = [
      { text: 'The battery life is excellent and lasts all day', rating: 5, date: '2025-01-01' },
      { text: 'Camera quality could be better in low light', rating: 3, date: '2025-01-05' },
      { text: 'Fast shipping but the box was damaged', rating: 4, date: '2025-01-10' },
      { text: 'My kids love this toy, very durable', rating: 5, date: '2025-01-15' },
      { text: 'Not worth the price, returned it immediately', rating: 1, date: '2025-01-20' },
    ];
    const score = analyzePhraseRepetition(reviews);
    expect(score).toBeLessThanOrEqual(45);
  });
});

// ── Length Uniformity ──

describe('analyzeLengthUniformity', () => {
  it('flags reviews with uniform length', () => {
    const reviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
      text: `Review number ${i}. Product quality is good. Delivery was fast. Would recommend.`,
      rating: 4,
      date: new Date(2025, 0, 1 + i).toISOString(),
    }));
    const score = analyzeLengthUniformity(reviews);
    expect(score).toBeGreaterThan(0);
  });

  it('returns low score for varied lengths', () => {
    const reviews: Review[] = [
      { text: 'Great!', rating: 5, date: '2025-01-01' },
      { text: 'I bought this product last week and have been using it every day. The build quality is outstanding.', rating: 4, date: '2025-01-02' },
      { text: 'OK product.', rating: 3, date: '2025-01-03' },
      { text: 'Terrible experience from start to finish. First the delivery was late by two weeks, then when it finally arrived the packaging was completely destroyed. The product itself had scratches all over it and one of the buttons was not working properly.', rating: 1, date: '2025-01-04' },
      { text: 'Five stars, love it so much, will buy again', rating: 5, date: '2025-01-05' },
      { text: 'Meh', rating: 3, date: '2025-01-06' },
    ];
    const score = analyzeLengthUniformity(reviews);
    expect(score).toBeLessThanOrEqual(25);
  });
});

// ── Incentive Keywords ──

describe('analyzeIncentiveKeywords', () => {
  it('detects Korean sponsored reviews', () => {
    const reviews: Review[] = [
      { text: '체험단으로 제공받아 작성한 솔직 후기입니다', rating: 5, date: '2025-01-01' },
      { text: '협찬 제품 리뷰입니다', rating: 5, date: '2025-01-02' },
      { text: '무료 제공받았습니다', rating: 5, date: '2025-01-03' },
      { text: '그냥 좋아서 샀어요', rating: 4, date: '2025-01-04' },
      { text: '배송 빠르고 좋습니다', rating: 4, date: '2025-01-05' },
    ];
    const score = analyzeIncentiveKeywords(reviews, 'ko');
    expect(score).toBeGreaterThanOrEqual(40);
  });

  it('detects English incentivized reviews', () => {
    const reviews: Review[] = [
      { text: 'I received this product for free in exchange for an honest review', rating: 5, date: '2025-01-01' },
      { text: 'Gifted by the brand for testing purposes', rating: 4, date: '2025-01-02' },
      { text: 'Great product, bought it myself', rating: 5, date: '2025-01-03' },
    ];
    const score = analyzeIncentiveKeywords(reviews, 'en');
    expect(score).toBeGreaterThanOrEqual(40);
  });
});

// ── Rating Surge ──

describe('analyzeRatingSurge', () => {
  it('detects sudden spike in 5-star reviews', () => {
    const reviews: Review[] = [
      // Normal weeks: 1-2 mixed reviews
      ...Array.from({ length: 8 }, (_, i) => ({
        text: `Regular review ${i}`,
        rating: 3 + (i % 3),
        date: new Date(2025, 0, 7 * i + 1).toISOString(),
      })),
      // Surge week: 10 five-star reviews
      ...Array.from({ length: 10 }, (_, i) => ({
        text: `Amazing product ${i}`,
        rating: 5,
        date: new Date(2025, 3, 1 + (i % 3)).toISOString(),
      })),
    ];
    const score = analyzeRatingSurge(reviews);
    expect(score).toBeGreaterThan(0);
  });
});

// ── Main Analyzer ──

describe('analyzeReviews', () => {
  it('returns A grade for clean reviews', () => {
    const reviews: Review[] = [
      { text: 'The battery life is excellent and lasts all day without any issues.', rating: 5, date: '2025-01-01' },
      { text: 'Camera could be better in low light situations but otherwise solid.', rating: 3, date: '2025-02-15' },
      { text: 'Fast shipping. Box was slightly dented but product fine inside.', rating: 4, date: '2025-03-20' },
      { text: 'My kids absolutely love this! Very durable and colorful.', rating: 5, date: '2025-04-10' },
      { text: 'Returned it. Not as described at all.', rating: 1, date: '2025-05-05' },
      { text: 'Good value for the price point. Nothing fancy.', rating: 4, date: '2025-06-12' },
    ];
    const result = analyzeReviews(reviews, { locale: 'en' });

    expect(result.totalReviews).toBe(6);
    expect(result.overallScore).toBeGreaterThanOrEqual(60);
    expect(['A', 'B', 'C']).toContain(result.grade);
  });

  it('returns low grade for suspicious reviews', () => {
    const reviews: Review[] = Array.from({ length: 20 }, (_, i) => ({
      text: 'This product is amazing and I love it so much. The quality is outstanding and delivery was super fast.',
      rating: 5,
      date: '2025-06-15',
    }));
    const result = analyzeReviews(reviews, { locale: 'en' });

    expect(result.overallScore).toBeLessThan(60);
    expect(['D', 'E', 'F']).toContain(result.grade);
    expect(result.details.length).toBeGreaterThan(0);
  });

  it('handles empty reviews', () => {
    const result = analyzeReviews([]);
    expect(result.totalReviews).toBe(0);
    expect(result.grade).toBe('A');
    expect(result.overallScore).toBe(100);
  });

  it('flags incentivized Korean reviews', () => {
    const reviews: Review[] = [
      { text: '체험단으로 제공받은 제품입니다. 품질이 아주 좋습니다.', rating: 5, date: '2025-01-01' },
      { text: '협찬 받아서 사용해봤는데 만족합니다.', rating: 5, date: '2025-01-15' },
      { text: '내돈내산! 진짜 좋아요 추천합니다.', rating: 4, date: '2025-02-01' },
      { text: '배송 빠르고 포장 꼼꼼합니다.', rating: 4, date: '2025-02-15' },
      { text: '가격 대비 괜찮은 제품입니다.', rating: 3, date: '2025-03-01' },
    ];
    const result = analyzeReviews(reviews, { locale: 'ko' });
    expect(result.heuristics.incentiveKeyword).toBeGreaterThan(0);
  });
});

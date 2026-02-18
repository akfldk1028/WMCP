import { describe, it, expect } from 'vitest';
import { extractReviews } from '../../src/extractors/review-extractor.js';

const REVIEW_HTML = `
<html><body>
  <div class="review">
    <span class="author">John</span>
    <span class="rating star-4">4 stars</span>
    <time datetime="2025-06-15">June 15, 2025</time>
    <p>Really solid product. Battery lasts all day and the build quality is impressive for the price point.</p>
  </div>
  <div class="review">
    <span class="author">김민수</span>
    <span class="rating" data-rating="5">★★★★★</span>
    <time datetime="2025-06-20">2025-06-20</time>
    <span class="verified">인증구매</span>
    <p>체험단으로 제공받은 제품입니다. 품질이 아주 좋습니다. 추천합니다.</p>
  </div>
  <div class="review">
    <p>Short.</p>
  </div>
</body></html>
`;

describe('extractReviews', () => {
  it('extracts reviews from HTML', () => {
    const reviews = extractReviews(REVIEW_HTML, 'ko');
    expect(reviews.length).toBeGreaterThanOrEqual(2);
  });

  it('extracts author names', () => {
    const reviews = extractReviews(REVIEW_HTML, 'ko');
    const john = reviews.find((r) => r.author === 'John');
    expect(john).toBeDefined();
  });

  it('extracts dates', () => {
    const reviews = extractReviews(REVIEW_HTML, 'ko');
    const withDate = reviews.filter((r) => r.date);
    expect(withDate.length).toBeGreaterThan(0);
  });

  it('calculates word counts', () => {
    const reviews = extractReviews(REVIEW_HTML, 'en');
    for (const r of reviews) {
      expect(r.wordCount).toBeGreaterThan(0);
    }
  });

  it('detects incentive keywords', () => {
    const reviews = extractReviews(REVIEW_HTML, 'ko');
    const sponsored = reviews.find((r) => r.incentiveKeywords.length > 0);
    expect(sponsored).toBeDefined();
    expect(sponsored!.incentiveKeywords.some((k) => k.includes('체험단') || k.includes('제공'))).toBe(true);
  });

  it('skips very short reviews', () => {
    const html = '<div class="review">Hi</div>';
    const reviews = extractReviews(html);
    expect(reviews).toHaveLength(0);
  });

  it('returns empty for no-review HTML', () => {
    const reviews = extractReviews('<html><body><p>No reviews</p></body></html>');
    expect(reviews).toHaveLength(0);
  });
});

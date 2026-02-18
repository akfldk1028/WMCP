import * as cheerio from 'cheerio';
import type { StructuredReview, Locale } from '../core/types.js';
import { findIncentiveKeywords } from '../signals/patterns.js';

const REVIEW_SELECTORS = [
  '[class*="review"]', '[class*="Review"]',
  '[class*="comment"]', '[class*="Comment"]',
  '[data-review]', '[itemtype*="Review"]',
  '[class*="리뷰"]', '[class*="후기"]',
  '[class*="testimonial"]',
];

const RATING_SELECTORS = [
  '[class*="rating"]', '[class*="Rating"]',
  '[class*="star"]', '[class*="Star"]',
  '[data-rating]', '[itemprop="ratingValue"]',
  '[class*="별점"]', '[class*="평점"]',
];

const DATE_SELECTORS = [
  'time', '[datetime]', '[class*="date"]', '[class*="Date"]',
  '[class*="날짜"]', '[class*="작성일"]',
];

const AUTHOR_SELECTORS = [
  '[class*="author"]', '[class*="Author"]',
  '[class*="user"]', '[class*="User"]',
  '[itemprop="author"]',
  '[class*="작성자"]', '[class*="닉네임"]',
];

function extractRatingFromElement($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): number | undefined {
  // Check data attributes
  const dataRating = $el.find('[data-rating]').first().attr('data-rating')
    ?? $el.attr('data-rating');
  if (dataRating) {
    const parsed = parseFloat(dataRating);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) return parsed;
  }

  // Check itemprop
  const itemprop = $el.find('[itemprop="ratingValue"]').first().text().trim();
  if (itemprop) {
    const parsed = parseFloat(itemprop);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) return parsed;
  }

  // Check star class patterns (e.g., "star-4", "rating-5")
  let rating: number | undefined;
  $el.find(RATING_SELECTORS.join(',')).each((_, rEl) => {
    if (rating !== undefined) return;
    const cls = $(rEl).attr('class') ?? '';
    const match = cls.match(/(?:star|rating|별점)[_-]?(\d)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val >= 1 && val <= 5) rating = val;
    }
    // Check aria-label
    const aria = $(rEl).attr('aria-label') ?? '';
    const ariaMatch = aria.match(/(\d(?:\.\d)?)\s*(?:out\s+of|\/)\s*5|(\d(?:\.\d)?)\s*(?:점|stars?)/i);
    if (ariaMatch) {
      const val = parseFloat(ariaMatch[1] ?? ariaMatch[2]);
      if (val >= 1 && val <= 5) rating = val;
    }
  });

  return rating;
}

function extractDateFromElement($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): string | undefined {
  // Check time element
  const time = $el.find('time').first();
  if (time.length) {
    const datetime = time.attr('datetime');
    if (datetime) return datetime;
    const text = time.text().trim();
    if (text) return text;
  }

  // Check [datetime] attr
  const dtEl = $el.find('[datetime]').first();
  if (dtEl.length) return dtEl.attr('datetime');

  // Check date-like selectors
  let date: string | undefined;
  $el.find(DATE_SELECTORS.join(',')).each((_, dEl) => {
    if (date) return;
    const text = $(dEl).text().trim();
    if (text && text.length < 50) date = text;
  });

  return date;
}

function extractAuthorFromElement($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): string | undefined {
  let author: string | undefined;
  $el.find(AUTHOR_SELECTORS.join(',')).each((_, aEl) => {
    if (author) return;
    const text = $(aEl).text().trim();
    if (text && text.length < 100) author = text;
  });
  return author;
}

/** Extract structured reviews from HTML */
export function extractReviews(html: string, locale: Locale = 'ko'): StructuredReview[] {
  const $ = cheerio.load(html);
  const reviews: StructuredReview[] = [];
  const seen = new Set<string>();

  for (const selector of REVIEW_SELECTORS) {
    $(selector).each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();

      // Skip too short / too long / duplicate
      if (!text || text.length < 10 || text.length > 5000) return;

      // Simple dedup by first 100 chars
      const key = text.slice(0, 100);
      if (seen.has(key)) return;
      seen.add(key);

      const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
      const rating = extractRatingFromElement($, $el);
      const date = extractDateFromElement($, $el);
      const author = extractAuthorFromElement($, $el);
      const verified = $el.find('[class*="verified"], [class*="인증"]').length > 0 || undefined;
      const incentiveKeywords = findIncentiveKeywords(text, locale);

      reviews.push({
        text: text.slice(0, 2000),
        rating,
        date,
        author,
        verified,
        wordCount,
        incentiveKeywords,
      });
    });
  }

  // Filter out parent elements that contain child reviews (prefer leaf matches)
  const filtered = reviews.filter((r, i) => {
    return !reviews.some((other, j) =>
      i !== j && other.text.length < r.text.length && r.text.includes(other.text)
    );
  });
  return filtered;
}

/**
 * System prompt and message builder for ShopGuard LLM-based page analysis.
 *
 * The LLM receives a structured snapshot of the shopping page and returns
 * a JSON object with page classification, extracted data, and suspicious
 * pattern flags.
 */

import type { PageSnapshot } from '../types.js';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT: string = `You are ShopGuard, an expert shopping-page analyst. You receive a structured snapshot of a web page and must classify it, extract commerce data, and flag suspicious patterns.

TASK
1. Classify the page type.
2. Extract product, price, and review information when applicable.
3. Identify suspicious patterns (fake urgency, hidden fees, review manipulation, dark patterns, misleading discounts, bait-and-switch, etc.).

RESPONSE FORMAT
Respond ONLY with a single JSON object. No markdown fences, no commentary, no text before or after the JSON.

JSON SCHEMA
{
  "pageType": "product" | "ad" | "sponsored-content" | "live-commerce" | "non-commercial",
  "confidence": <number 0.0-1.0>,
  "productName": <string | null>,
  "platform": <string>,
  "reviews": [
    {
      "text": <string>,
      "rating": <number 1-5>,
      "date": <string "YYYY-MM-DD" or "unknown">
    }
  ],
  "priceInfo": {
    "displayPrice": <string | null>,
    "originalPrice": <string | null>,
    "currency": <string>,
    "hiddenFees": [<string>]
  },
  "suspiciousPatterns": [
    {
      "type": <string>,
      "evidence": <string>,
      "severity": "low" | "medium" | "high" | "critical"
    }
  ],
  "agentNotes": <string>
}

RULES
- For "non-commercial" pages, return ONLY pageType, confidence, platform, and agentNotes. Omit reviews, priceInfo, productName, and suspiciousPatterns.
- If reviews are not visible on the page, return an empty array for reviews.
- If a review date is not available, use "unknown".
- Normalize all ratings to a 1-5 integer scale. If the source uses a different scale (e.g. 10-point, percentage), convert proportionally and round to the nearest integer.
- For hiddenFees, list each fee as a human-readable string (e.g. "Shipping $5.99 added at checkout"). Return an empty array if none found.
- For currency, use the ISO 4217 code (e.g. "USD", "KRW", "EUR"). If unknown, use "UNKNOWN".
- productName should be the main product title as displayed. null if not identifiable.
- platform should be the site or marketplace name (e.g. "Coupang", "Amazon", "Naver Shopping").
- agentNotes is a brief free-text summary of your overall assessment.
- Be precise with evidence strings in suspiciousPatterns: quote or describe the specific page element.
- confidence reflects how certain you are about the pageType classification.`;

// ---------------------------------------------------------------------------
// User message builder
// ---------------------------------------------------------------------------

/** Maximum character limits for each section to stay within token budget. */
const VISIBLE_TEXT_LIMIT = 4_000;
const PRICE_CONTEXT_LIMIT = 20;
const REVIEW_BLOCK_LIMIT = 30;
const INTERACTIVE_ELEMENT_LIMIT = 50;

/**
 * Build the user message from a PageSnapshot for the LLM.
 *
 * Includes url, title, meta tags, visible text, price contexts, review blocks,
 * and interactive elements. Excludes rawHtml and rawPageText which are only
 * used by the Phase 1 heuristic engine.
 */
export function buildUserMessage(snapshot: PageSnapshot): string {
  const sections: string[] = [];

  // ── Page Identity ──
  sections.push('## Page Identity');
  sections.push(`URL: ${snapshot.url}`);
  sections.push(`Title: ${snapshot.title}`);

  if (snapshot.meta) {
    if (snapshot.meta.description) {
      sections.push(`Description: ${snapshot.meta.description}`);
    }
    if (snapshot.meta.ogType) {
      sections.push(`OG Type: ${snapshot.meta.ogType}`);
    }
    if (snapshot.meta.ogSiteName) {
      sections.push(`OG Site Name: ${snapshot.meta.ogSiteName}`);
    }
  }

  // ── Visible Text ──
  if (snapshot.visibleText) {
    const trimmed = snapshot.visibleText.slice(0, VISIBLE_TEXT_LIMIT);
    const wasTruncated = snapshot.visibleText.length > VISIBLE_TEXT_LIMIT;
    sections.push('');
    sections.push('## Visible Text' + (wasTruncated ? ' (truncated)' : ''));
    sections.push(trimmed);
  }

  // ── Price Contexts ──
  if (snapshot.priceContexts && snapshot.priceContexts.length > 0) {
    const items = snapshot.priceContexts.slice(0, PRICE_CONTEXT_LIMIT);
    sections.push('');
    sections.push(`## Price Contexts (${items.length} of ${snapshot.priceContexts.length})`);
    sections.push(items.join('\n'));
  }

  // ── Review Blocks ──
  if (snapshot.reviewBlocks && snapshot.reviewBlocks.length > 0) {
    const items = snapshot.reviewBlocks.slice(0, REVIEW_BLOCK_LIMIT);
    sections.push('');
    sections.push(`## Review Blocks (${items.length} of ${snapshot.reviewBlocks.length})`);
    sections.push(items.join('\n---\n'));
  }

  // ── Interactive Elements ──
  if (snapshot.interactiveElements && snapshot.interactiveElements.length > 0) {
    const items = snapshot.interactiveElements.slice(0, INTERACTIVE_ELEMENT_LIMIT);
    sections.push('');
    sections.push(`## Interactive Elements (${items.length} of ${snapshot.interactiveElements.length})`);
    sections.push(items.join('\n'));
  }

  return sections.join('\n');
}

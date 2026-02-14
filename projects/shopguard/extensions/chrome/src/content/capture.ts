import type { PageSnapshot } from '../types.js';

const MAX_VISIBLE_TEXT = 4000;
const MAX_PRICE_CONTEXTS = 20;
const MAX_REVIEW_BLOCKS = 30;
const MAX_INTERACTIVE = 50;

/** Price pattern: currency symbols, numbers with commas/dots, currency words */
const PRICE_RE =
  /(?:[\$\u20AC\u00A3\u00A5\u20A9]|USD|EUR|KRW|JPY)\s*[\d,.]+|[\d,.]+\s*(?:\uC6D0|won|dollars?|\u5186)/gi;

/** Selectors that commonly contain review content */
const REVIEW_SELECTORS = [
  '[class*="review"]',
  '[class*="Review"]',
  '[class*="comment"]',
  '[class*="Comment"]',
  '[class*="rating"]',
  '[class*="Rating"]',
  '[itemtype*="Review"]',
  '[data-review]',
  '[data-testid*="review"]',
  '[id*="review"]',
  '[id*="Review"]',
];

/** Max size for raw HTML/text to prevent Chrome message size overflow (~50MB limit) */
const MAX_RAW_SIZE = 512_000; // 512KB — enough for Phase 1 regex engines

/**
 * Capture a universal page snapshot without site-specific selectors.
 * Collects text, meta, price contexts, review candidate blocks,
 * and interactive element text for LLM analysis.
 */
export function capturePageSnapshot(): PageSnapshot {
  const url = location.href;
  const title = document.title;

  // Meta tags
  const meta: PageSnapshot['meta'] = {};
  const descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (descEl?.content) meta.description = descEl.content;
  const ogTypeEl = document.querySelector('meta[property="og:type"]') as HTMLMetaElement | null;
  if (ogTypeEl?.content) meta.ogType = ogTypeEl.content;
  const ogSiteEl = document.querySelector('meta[property="og:site_name"]') as HTMLMetaElement | null;
  if (ogSiteEl?.content) meta.ogSiteName = ogSiteEl.content;

  // Visible text (body innerText, trimmed)
  const rawBody = document.body?.innerText ?? '';
  const visibleText = rawBody.slice(0, MAX_VISIBLE_TEXT);

  // Price contexts: find price patterns and grab surrounding text
  const priceContexts = extractPriceContexts(rawBody);

  // Review blocks: heuristic selectors for review-like DOM elements
  const reviewBlocks = extractReviewBlocks();

  // Interactive elements: buttons and prominent links
  const interactiveElements = extractInteractiveElements();

  // Raw data for Phase 1 engine (NOT sent to LLM, size-capped for Chrome message passing)
  const rawHtml = document.documentElement.outerHTML.slice(0, MAX_RAW_SIZE);
  const rawPageText = rawBody.slice(0, MAX_RAW_SIZE);

  return {
    url,
    title,
    meta,
    visibleText,
    priceContexts,
    reviewBlocks,
    interactiveElements,
    rawHtml,
    rawPageText,
  };
}

/** Extract text around price patterns for context */
function extractPriceContexts(text: string): string[] {
  const contexts: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(PRICE_RE.source, PRICE_RE.flags);

  while ((match = re.exec(text)) !== null && contexts.length < MAX_PRICE_CONTEXTS) {
    const start = Math.max(0, match.index - 60);
    const end = Math.min(text.length, match.index + match[0].length + 60);
    const ctx = text.slice(start, end).replace(/\s+/g, ' ').trim();
    if (ctx && !seen.has(ctx)) {
      seen.add(ctx);
      contexts.push(ctx);
    }
  }

  return contexts;
}

/** Collect text from review-like DOM elements */
function extractReviewBlocks(): string[] {
  const blocks: string[] = [];
  const seen = new Set<string>();

  for (const selector of REVIEW_SELECTORS) {
    try {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        if (blocks.length >= MAX_REVIEW_BLOCKS) return blocks;
        const text = (el as HTMLElement).innerText?.trim();
        if (text && text.length > 10 && text.length < 2000 && !seen.has(text)) {
          seen.add(text);
          blocks.push(text.slice(0, 500));
        }
      }
    } catch {
      // Invalid selector, skip
    }
  }

  return blocks;
}

/** Collect button/link text for interaction analysis */
function extractInteractiveElements(): string[] {
  const items: string[] = [];
  const seen = new Set<string>();

  // Buttons
  const buttons = document.querySelectorAll('button, [role="button"], input[type="submit"]');
  for (const btn of buttons) {
    if (items.length >= MAX_INTERACTIVE) break;
    const text = (btn as HTMLElement).innerText?.trim() ||
      (btn as HTMLInputElement).value?.trim() ||
      btn.getAttribute('aria-label')?.trim();
    if (text && text.length > 1 && text.length < 100 && !seen.has(text)) {
      seen.add(text);
      items.push(text);
    }
  }

  // Prominent links (CTAs, checkout, add-to-cart, etc.)
  const links = document.querySelectorAll('a[href]');
  for (const link of links) {
    if (items.length >= MAX_INTERACTIVE) break;
    const text = (link as HTMLElement).innerText?.trim();
    if (text && text.length > 2 && text.length < 100 && !seen.has(text)) {
      seen.add(text);
      items.push(text);
    }
  }

  return items;
}

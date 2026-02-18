import * as cheerio from 'cheerio';
import type { PageExtraction, InteractiveElement } from '../core/types.js';

const PLATFORM_INDICATORS: Record<string, RegExp[]> = {
  coupang: [/coupang\.com/i, /coupang/i],
  naver: [/shopping\.naver/i, /smartstore\.naver/i],
  gmarket: [/gmarket\.co/i],
  '11st': [/11st\.co/i, /11번가/i],
  amazon: [/amazon\./i],
  ebay: [/ebay\./i],
  shopify: [/cdn\.shopify/i, /shopify/i],
  woocommerce: [/woocommerce/i, /wp-content.*?woo/i],
};

function detectPlatform(html: string, url?: string): string | undefined {
  const combined = (url ?? '') + html.slice(0, 5000);
  for (const [name, patterns] of Object.entries(PLATFORM_INDICATORS)) {
    for (const p of patterns) {
      if (p.test(combined)) return name;
    }
  }
  return undefined;
}

function extractMeta($: cheerio.CheerioAPI): Record<string, string> {
  const meta: Record<string, string> = {};
  $('meta').each((_, el) => {
    const name = $(el).attr('name') ?? $(el).attr('property') ?? '';
    const content = $(el).attr('content') ?? '';
    if (name && content) meta[name] = content.slice(0, 500);
  });
  return meta;
}

function extractPriceContexts($: cheerio.CheerioAPI): string[] {
  const contexts: string[] = [];
  const selectors = [
    '[class*="price"]', '[class*="Price"]', '[class*="cost"]',
    '[id*="price"]', '[data-price]',
    '[class*="가격"]', '[class*="금액"]',
  ];

  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 500) contexts.push(text);
    });
  }

  // Instead of iterating every element, scan body text directly
  const bodyText = $('body').text();
  const priceMatches = bodyText.match(/(?:\$|€|£|¥|₩)\s*\d[\d,.]*|\d[\d,.]*\s*(?:원|円|USD|EUR|GBP|KRW)/g);
  if (priceMatches) {
    for (const m of priceMatches) {
      if (!contexts.includes(m) && m.length < 300) {
        contexts.push(m);
        if (contexts.length >= 50) break;
      }
    }
  }

  return contexts.slice(0, 50);
}

function extractReviewBlocks($: cheerio.CheerioAPI): string[] {
  const blocks: string[] = [];
  const selectors = [
    '[class*="review"]', '[class*="Review"]',
    '[class*="comment"]', '[class*="Comment"]',
    '[id*="review"]', '[data-review]',
    '[class*="리뷰"]', '[class*="후기"]',
    '[class*="testimonial"]',
  ];

  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10 && text.length < 2000) {
        blocks.push(text);
      }
    });
  }

  return blocks.slice(0, 100);
}

function extractInteractiveElements($: cheerio.CheerioAPI): InteractiveElement[] {
  const elements: InteractiveElement[] = [];

  $('button, input, select, [role="button"], a[class*="btn"], a[class*="cta"]').each((_, el) => {
    const $el = $(el);
    const tag = 'tagName' in el ? (el as { tagName: string }).tagName : 'unknown';
    const type = $el.attr('type');
    const text = $el.text().trim().slice(0, 100) || $el.attr('value') || $el.attr('aria-label');
    const name = $el.attr('name');
    const checked = $el.is('[checked]');

    elements.push({
      tag,
      type: type || undefined,
      text: text || undefined,
      name: name || undefined,
      checked: checked || undefined,
    });
  });

  return elements.slice(0, 100);
}

function detectAgentReadiness($: cheerio.CheerioAPI, html: string): { detected: boolean; signals: string[] } {
  const signals: string[] = [];

  // Structured data that agents can consume
  if ($('script[type="application/ld+json"]').length > 0) signals.push('schema.org-jsonld');
  if ($('[itemtype]').length > 0) signals.push('schema.org-microdata');
  if ($('meta[property^="og:"]').length > 0) signals.push('opengraph');

  // Well-known agent endpoints (real standards only)
  if (/\.well-known\/ai-plugin/i.test(html)) {
    signals.push('well-known-ai-plugin');
  }

  return { detected: signals.length > 0, signals };
}

/** Extract structured page data from HTML */
export function extractPageData(html: string, url?: string): PageExtraction {
  const $ = cheerio.load(html);
  const title = $('title').text().trim() || $('h1').first().text().trim() || undefined;
  const platform = detectPlatform(html, url);
  const meta = extractMeta($);
  const priceContexts = extractPriceContexts($);
  const reviewBlocks = extractReviewBlocks($);
  const interactiveElements = extractInteractiveElements($);
  const formCount = $('form').length;
  const { detected: agentReadinessDetected, signals: agentReadinessSignals } = detectAgentReadiness($, html);

  return {
    url,
    title,
    platform,
    meta,
    priceContexts,
    reviewBlocks,
    interactiveElements,
    formCount,
    agentReadinessDetected,
    agentReadinessSignals,
  };
}

import { z } from 'zod';
import * as cheerio from 'cheerio';
import type {
  PageExtraction,
  ReviewExtraction,
  PriceExtraction,
  DarkPatternExtraction,
  StructuredReview,
  Locale,
} from '../core/types.js';
import { extractPageData } from '../extractors/page-extractor.js';
import { extractReviews } from '../extractors/review-extractor.js';
import { extractPriceComponents } from '../extractors/price-extractor.js';
import { analyzeReviewSignals } from '../signals/review-signals.js';
import { extractFeeMatches, extractTrapMatches } from '../signals/price-signals.js';
import { extractDarkPatternEvidence } from '../signals/darkpattern-signals.js';
import { findIncentiveKeywords } from '../signals/patterns.js';

// ── Tool schemas ──

export const extractPageDataSchema = {
  html: z.string().max(2_000_000).describe('Full HTML of the shopping page'),
  url: z.string().optional().describe('Page URL (helps platform detection)'),
};

export const extractReviewsSchema = {
  html: z.string().max(2_000_000).optional().describe('HTML containing reviews (extracts structured reviews)'),
  reviewBlocks: z
    .array(
      z.object({
        text: z.string().max(10_000),
        rating: z.number().optional(),
        date: z.string().optional(),
        author: z.string().optional(),
        verified: z.boolean().optional(),
      }),
    )
    .max(500)
    .optional()
    .describe('Pre-extracted review blocks (alternative to HTML)'),
  locale: z.enum(['ko', 'en']).default('ko').describe('Language locale for keyword detection'),
};

export const extractPricingSchema = {
  html: z.string().max(2_000_000).describe('HTML containing pricing information'),
};

export const scanDarkPatternsSchema = {
  content: z.string().max(2_000_000).describe('Text content of the page'),
  html: z.string().max(2_000_000).optional().describe('HTML for checkbox/cookie banner analysis'),
};

export const compareReviewSetsSchema = {
  sourceA: z.array(
    z.object({
      text: z.string().max(10_000),
      rating: z.number().optional(),
      date: z.string().optional(),
      author: z.string().optional(),
      verified: z.boolean().optional(),
    }),
  ).max(500).describe('First set of reviews'),
  sourceB: z.array(
    z.object({
      text: z.string().max(10_000),
      rating: z.number().optional(),
      date: z.string().optional(),
      author: z.string().optional(),
      verified: z.boolean().optional(),
    }),
  ).max(500).describe('Second set of reviews (e.g., from a different platform)'),
  locale: z.enum(['ko', 'en']).default('ko'),
};

export const comparePricesSchema = {
  sources: z.array(
    z.object({
      name: z.string().max(200).describe('Source name (e.g., "Coupang", "Naver")'),
      priceCents: z.number().describe('Price in cents (or raw value for KRW/JPY)'),
      currency: z.string().default('USD'),
      fees: z
        .array(z.object({ label: z.string().max(200), amountCents: z.number() }))
        .max(50)
        .optional()
        .describe('Additional fees'),
    }),
  ).max(100).describe('Price sources to compare'),
};

export const detectAgentReadinessSchema = {
  html: z.string().max(2_000_000).describe('HTML to scan for agent-readiness signals'),
};

// ── Tool handlers ──

export function handleExtractPageData(args: { html: string; url?: string }): PageExtraction {
  return extractPageData(args.html, args.url);
}

export function handleExtractReviews(args: {
  html?: string;
  reviewBlocks?: Array<{
    text: string;
    rating?: number;
    date?: string;
    author?: string;
    verified?: boolean;
  }>;
  locale: Locale;
}): ReviewExtraction {
  let reviews: StructuredReview[];

  if (args.html) {
    reviews = extractReviews(args.html, args.locale);
  } else if (args.reviewBlocks) {
    reviews = args.reviewBlocks.map((r) => ({
      ...r,
      wordCount: r.text.split(/\s+/).filter((w: string) => w.length > 0).length,
      incentiveKeywords: findIncentiveKeywords(r.text, args.locale),
    }));
  } else {
    reviews = [];
  }

  // Convert to Review format for signal analysis
  // Filter out reviews that are missing both rating AND date
  const signalInput = reviews
    .filter((r) => r.rating != null || r.date != null)
    .map((r) => ({
      text: r.text,
      rating: r.rating ?? 3, // neutral default if only rating is missing
      date: r.date ?? '1970-01-01',
      author: r.author,
      verified: r.verified,
    }));

  const signals = analyzeReviewSignals(signalInput, args.locale);

  return { reviews, signals };
}

export function handleExtractPricing(args: { html: string }): PriceExtraction {
  const components = extractPriceComponents(args.html);
  const feeMatches = extractFeeMatches(args.html);
  const trapMatches = extractTrapMatches(args.html);

  return { components, feeMatches, trapMatches };
}

export function handleScanDarkPatterns(args: {
  content: string;
  html?: string;
}): DarkPatternExtraction {
  const matches = extractDarkPatternEvidence(args.content, args.html);
  return { matches };
}

export function handleCompareReviewSets(args: {
  sourceA: Array<{ text: string; rating?: number; date?: string; author?: string; verified?: boolean }>;
  sourceB: Array<{ text: string; rating?: number; date?: string; author?: string; verified?: boolean }>;
  locale: Locale;
}): {
  sourceA: { count: number; avgRating: number; signals: Record<string, unknown> };
  sourceB: { count: number; avgRating: number; signals: Record<string, unknown> };
  comparison: {
    ratingDifference: number;
    overlapTexts: string[];
    sentimentGap: string;
  };
} {
  const toReviews = (arr: typeof args.sourceA) =>
    arr.map((r) => ({
      text: r.text,
      rating: r.rating ?? 3,
      date: r.date ?? new Date().toISOString(),
      author: r.author,
      verified: r.verified,
    }));

  const reviewsA = toReviews(args.sourceA);
  const reviewsB = toReviews(args.sourceB);

  const signalsA = analyzeReviewSignals(reviewsA, args.locale);
  const signalsB = analyzeReviewSignals(reviewsB, args.locale);

  const avgA = reviewsA.length > 0
    ? reviewsA.reduce((s, r) => s + r.rating, 0) / reviewsA.length
    : 0;
  const avgB = reviewsB.length > 0
    ? reviewsB.reduce((s, r) => s + r.rating, 0) / reviewsB.length
    : 0;

  // Find duplicate/very similar texts across sources
  const overlapTexts: string[] = [];
  const normalized = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
  const setA = new Set(reviewsA.map((r) => normalized(r.text)));
  for (const r of reviewsB) {
    if (setA.has(normalized(r.text))) {
      overlapTexts.push(r.text.slice(0, 100));
    }
  }

  const ratingDiff = Math.abs(avgA - avgB);
  let sentimentGap = 'similar';
  if (ratingDiff > 1.5) sentimentGap = 'large';
  else if (ratingDiff > 0.7) sentimentGap = 'moderate';

  return {
    sourceA: { count: reviewsA.length, avgRating: Math.round(avgA * 100) / 100, signals: signalsA },
    sourceB: { count: reviewsB.length, avgRating: Math.round(avgB * 100) / 100, signals: signalsB },
    comparison: {
      ratingDifference: Math.round(ratingDiff * 100) / 100,
      overlapTexts,
      sentimentGap,
    },
  };
}

export function handleComparePrices(args: {
  sources: Array<{
    name: string;
    priceCents: number;
    currency: string;
    fees?: Array<{ label: string; amountCents: number }>;
  }>;
}): {
  sources: Array<{ name: string; basePriceCents: number; totalWithFeesCents: number; currency: string; feeBreakdown: Array<{ label: string; amountCents: number }> }>;
  cheapest: { name: string; totalCents: number } | null;
  mostExpensive: { name: string; totalCents: number } | null;
  spreadPercent: number;
  outliers: string[];
} {
  const enriched = args.sources.map((s) => {
    const feeTotal = (s.fees ?? []).reduce((sum, f) => sum + f.amountCents, 0);
    return {
      name: s.name,
      basePriceCents: s.priceCents,
      totalWithFeesCents: s.priceCents + feeTotal,
      currency: s.currency,
      feeBreakdown: s.fees ?? [],
    };
  });

  // Group by currency
  const byCurrency = new Map<string, typeof enriched>();
  for (const s of enriched) {
    if (!byCurrency.has(s.currency)) byCurrency.set(s.currency, []);
    byCurrency.get(s.currency)!.push(s);
  }

  // Use the most common currency group
  const mainGroup = [...byCurrency.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[1] ?? [];

  const sorted = [...mainGroup].sort((a, b) => a.totalWithFeesCents - b.totalWithFeesCents);
  const cheapest = sorted.length > 0 ? { name: sorted[0].name, totalCents: sorted[0].totalWithFeesCents } : null;
  const mostExpensive = sorted.length > 0 ? { name: sorted[sorted.length - 1].name, totalCents: sorted[sorted.length - 1].totalWithFeesCents } : null;

  const spread = cheapest && mostExpensive && cheapest.totalCents > 0
    ? Math.round(((mostExpensive.totalCents - cheapest.totalCents) / cheapest.totalCents) * 100)
    : 0;

  // Detect outliers (>2 std dev from mean)
  const outliers: string[] = [];
  if (mainGroup.length >= 3) {
    const totals = mainGroup.map((s) => s.totalWithFeesCents);
    const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
    const std = Math.sqrt(totals.reduce((s, t) => s + (t - mean) ** 2, 0) / totals.length);
    for (const s of mainGroup) {
      if (Math.abs(s.totalWithFeesCents - mean) > 2 * std) {
        outliers.push(`${s.name}: ${s.totalWithFeesCents} (mean=${Math.round(mean)}, ±${Math.round(std)})`);
      }
    }
  }

  return { sources: enriched, cheapest, mostExpensive, spreadPercent: spread, outliers };
}

export function handleDetectAgentReadiness(args: { html: string }): {
  agentReadiness: {
    hasStructuredData: boolean;
    signals: string[];
    note: string;
  };
} {
  const $ = cheerio.load(args.html);
  const signals: string[] = [];

  // Structured data
  if ($('script[type="application/ld+json"]').length > 0) signals.push('schema.org-jsonld');
  if ($('[itemtype]').length > 0) signals.push('schema.org-microdata');
  if ($('meta[property^="og:"]').length > 0) signals.push('opengraph');

  // Well-known agent endpoints (real standards only)
  if (/\.well-known\/ai-plugin/i.test(args.html)) {
    signals.push('well-known-ai-plugin');
  }

  return {
    agentReadiness: {
      hasStructuredData: signals.length > 0,
      signals,
      note: 'WebMCP tools are registered via JavaScript (window.navigator.modelContext) and cannot be detected from static HTML. These signals indicate structured data that AI agents can leverage.',
    },
  };
}

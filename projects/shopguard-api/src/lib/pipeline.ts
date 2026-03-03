/**
 * Server-side analysis pipeline.
 * Runs local heuristics + Claude Haiku classification.
 *
 * Cost optimizations:
 * 1. URL cache — same URL returns cached result for 24h (KV)
 * 2. Local-first — skip AI if local signals are already strong enough
 * 3. Already using Haiku (cheapest model)
 */

import { analyzeReviews } from 'shopguard-mcp/review';
import { analyzePrices } from 'shopguard-mcp/price';
import { analyzeDarkPatterns } from 'shopguard-mcp/darkpattern';
import { calculateTrustScore } from 'shopguard-mcp';
import { callClaudeHaiku } from './claude';
import { kv } from '@vercel/kv';

interface PageSnapshot {
  url: string;
  title: string;
  meta?: { description?: string; ogType?: string; ogSiteName?: string };
  visibleText?: string;
  priceContexts?: string[];
  reviewBlocks?: string[];
  interactiveElements?: string[];
  rawHtml?: string;
  rawPageText?: string;
}

interface PipelineResult {
  success: boolean;
  pageType?: string;
  analysis?: {
    review: { totalReviews: number; suspiciousCount: number; overallScore: number; grade: string; details: string[] };
    price: { trustScore: number; grade: string; issues: Array<{ type: string; severity: number; description: string }>; totalHiddenFeeCents: number };
    darkPattern: { riskScore: number; grade: string; patterns: Array<{ type: string; risk: string; explanation: string }> };
    overall: { score: number; grade: string; summary: string };
    timestamp: number;
  } | null;
  agentNotes?: string;
  suspiciousPatterns?: Array<{ type: string; evidence: string; severity: string }>;
  error?: string;
  errorCode?: string;
}

const SYSTEM_PROMPT = `You are ShopGuard, an expert shopping-page analyst. Classify the page and extract commerce data. Respond ONLY with JSON:
{
  "pageType": "product"|"ad"|"sponsored-content"|"live-commerce"|"non-commercial",
  "confidence": 0.0-1.0,
  "productName": string|null,
  "platform": string,
  "suspiciousPatterns": [{"type":string,"evidence":string,"severity":"low"|"medium"|"high"|"critical"}],
  "agentNotes": string
}`;

function buildUserMessage(snapshot: PageSnapshot): string {
  const parts = [
    `URL: ${snapshot.url}`,
    `Title: ${snapshot.title}`,
  ];
  if (snapshot.meta?.description) parts.push(`Description: ${snapshot.meta.description}`);
  if (snapshot.meta?.ogType) parts.push(`OG Type: ${snapshot.meta.ogType}`);
  if (snapshot.visibleText) parts.push(`\nVisible Text (first 2000 chars):\n${snapshot.visibleText.slice(0, 2000)}`);
  if (snapshot.priceContexts?.length) parts.push(`\nPrice Contexts:\n${snapshot.priceContexts.slice(0, 10).join('\n')}`);
  if (snapshot.reviewBlocks?.length) parts.push(`\nReview Blocks (${snapshot.reviewBlocks.length}):\n${snapshot.reviewBlocks.slice(0, 10).join('\n---\n')}`);
  return parts.join('\n');
}

function extractJson(raw: string): Record<string, unknown> | null {
  try { return JSON.parse(raw); } catch { /* fall through */ }
  const fence = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fence) try { return JSON.parse(fence[1].trim()); } catch { /* fall through */ }
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first !== -1 && last > first) try { return JSON.parse(raw.slice(first, last + 1)); } catch { /* fall through */ }
  return null;
}

const CACHE_TTL = 86_400; // 24 hours

/** Simple hash for URL-based cache key */
function urlCacheKey(url: string): string {
  // Normalize: lowercase, strip tracking params, trailing slash
  const normalized = url.toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
  }
  return `cache:${hash.toString(36)}`;
}

/** Check if local analysis is strong enough to skip AI call */
function localSignalsSufficient(
  darkPatternCount: number,
  overallScore: number,
): boolean {
  // Strong local evidence: 3+ dark patterns found OR overall score very low
  // In these cases, AI adds marginal value — page is clearly problematic
  if (darkPatternCount >= 3) return true;
  if (overallScore <= 35) return true;
  return false;
}

export async function runServerPipeline(snapshot: PageSnapshot): Promise<PipelineResult> {
  // Optimization 1: URL cache — return cached result if available
  const cacheKey = urlCacheKey(snapshot.url);
  try {
    const cached = await kv.get<PipelineResult>(cacheKey);
    if (cached) {
      return { ...cached, agentNotes: (cached.agentNotes ?? '') + ' (cached)' };
    }
  } catch {
    // KV unavailable — proceed without cache
  }

  // Step 1: Local heuristic analysis (always runs)
  const html = snapshot.rawHtml ?? '';
  const text = snapshot.rawPageText ?? snapshot.visibleText ?? '';

  const reviews = (snapshot.reviewBlocks ?? [])
    .filter((b) => b.length > 20)
    .slice(0, 30)
    .map((t) => ({ text: t, rating: 3, date: 'unknown' }));

  const reviewResult = analyzeReviews(reviews, { locale: 'ko' });
  const priceResult = analyzePrices(html);
  const darkPatternResult = analyzeDarkPatterns(text, html);

  const overall = calculateTrustScore(
    reviewResult.overallScore,
    priceResult.trustScore,
    100 - darkPatternResult.riskScore,
  );

  const localAnalysis = {
    review: {
      totalReviews: reviewResult.totalReviews,
      suspiciousCount: reviewResult.suspiciousCount,
      overallScore: reviewResult.overallScore,
      grade: reviewResult.grade,
      details: reviewResult.details,
    },
    price: {
      trustScore: priceResult.trustScore,
      grade: priceResult.grade,
      issues: priceResult.issues.map((i: { type: string; severity: number; description: string }) => ({
        type: i.type, severity: i.severity, description: i.description,
      })),
      totalHiddenFeeCents: priceResult.totalHiddenFeeCents,
    },
    darkPattern: {
      riskScore: darkPatternResult.riskScore,
      grade: darkPatternResult.grade,
      patterns: darkPatternResult.patterns.map((p: { type: string; risk: string; explanation: string }) => ({
        type: p.type, risk: p.risk, explanation: p.explanation,
      })),
    },
    overall: { score: overall.overall, grade: overall.grade, summary: overall.summary },
    timestamp: Date.now(),
  };

  // Optimization 2: Local-first — skip AI if local signals are strong enough
  const skipAi = localSignalsSufficient(
    darkPatternResult.patterns.length,
    overall.overall,
  );

  let agentNotes = 'Server analysis (local heuristics)';
  let suspiciousPatterns: Array<{ type: string; evidence: string; severity: string }> = [];
  let pageType = 'product';

  if (skipAi) {
    // Local analysis found enough evidence — no need for AI call
    agentNotes = 'Server analysis (local heuristics, AI skipped — strong local signals)';
  } else {
    // Step 2: AI classification via Claude Haiku
    try {
      const rawResponse = await callClaudeHaiku(SYSTEM_PROMPT, buildUserMessage(snapshot));
      const parsed = extractJson(rawResponse);
      if (parsed) {
        pageType = typeof parsed['pageType'] === 'string' ? parsed['pageType'] : 'product';
        agentNotes = typeof parsed['agentNotes'] === 'string' ? parsed['agentNotes'] : agentNotes;
        if (Array.isArray(parsed['suspiciousPatterns'])) {
          suspiciousPatterns = (parsed['suspiciousPatterns'] as Array<{ type: string; evidence: string; severity: string }>).filter(
            (p) => typeof p.type === 'string',
          );
        }

        if (pageType === 'non-commercial') {
          const nonCommResult: PipelineResult = { success: true, pageType, analysis: null, agentNotes, suspiciousPatterns };
          try { await kv.set(cacheKey, nonCommResult, { ex: CACHE_TTL }); } catch {}
          return nonCommResult;
        }
      }
    } catch {
      agentNotes = 'Server analysis (AI unavailable, local heuristics only)';
    }
  }

  const result: PipelineResult = { success: true, pageType, analysis: localAnalysis, agentNotes, suspiciousPatterns };

  // Optimization 1: Write to cache for 24h
  try { await kv.set(cacheKey, result, { ex: CACHE_TTL }); } catch {}

  return result;
}

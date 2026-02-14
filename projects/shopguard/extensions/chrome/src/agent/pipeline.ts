/**
 * Orchestration pipeline that connects LLM-based page extraction to the
 * Phase 1 heuristic analysis engines.
 *
 * Flow:
 *  1. Send page snapshot to Claude for classification and data extraction
 *  2. Parse and validate the LLM response
 *  3. If the page is non-commercial, return early with null analysis
 *  4. Run Phase 1 engines (reviews, prices, dark patterns) on raw page data
 *  5. Calculate combined trust score and build AnalysisResult
 */

import { analyzeReviews } from '../../../../src/review/index.js';
import { analyzePrices } from '../../../../src/price/index.js';
import { analyzeDarkPatterns } from '../../../../src/darkpattern/index.js';
import { calculateTrustScore } from '../../../../src/core/index.js';

import type {
  PageSnapshot,
  AgentExtraction,
  PipelineResult,
  AnalysisResult,
} from '../types.js';

import { callClaude, AgentError } from './client.js';
import { SYSTEM_PROMPT, buildUserMessage } from './prompts.js';
import { parseAgentResponse } from './parser.js';

export type { AgentErrorCode } from './client.js';

// ---------------------------------------------------------------------------
// Phase 1 engine runner
// ---------------------------------------------------------------------------

/**
 * Run all Phase 1 heuristic engines using the LLM extraction for reviews
 * and the raw snapshot HTML/text for price and dark pattern analysis.
 *
 * The price and dark pattern engines operate on raw HTML rather than LLM
 * output because they rely on precise DOM structure and regex patterns
 * that are best matched against the original source.
 */
function buildAnalysis(
  extraction: AgentExtraction,
  snapshot: PageSnapshot,
): AnalysisResult {
  // Reviews: use LLM-extracted reviews (structured data the heuristic engine
  // can score for clustering, repetition, etc.)
  const reviewResult = analyzeReviews(extraction.reviews, { locale: 'ko' });

  // Price: raw HTML preserves hidden fee markup, drip pricing elements, etc.
  const priceResult = analyzePrices(snapshot.rawHtml ?? '');

  // Dark patterns: needs both visible text (for urgency language) and raw HTML
  // (for pre-checked boxes, misdirection elements, etc.)
  const darkPatternResult = analyzeDarkPatterns(
    snapshot.rawPageText ?? '',
    snapshot.rawHtml ?? '',
  );

  // Combined trust score (weights: review 50%, price 30%, dark pattern 20%)
  // riskScore is 0-100 (higher=riskier), calculateTrustScore expects trust (higher=better)
  const overall = calculateTrustScore(
    reviewResult.overallScore,
    priceResult.trustScore,
    100 - darkPatternResult.riskScore,
  );

  return {
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
      issues: priceResult.issues.map((i) => ({
        type: i.type,
        severity: i.severity,
        description: i.description,
      })),
      totalHiddenFeeCents: priceResult.totalHiddenFeeCents,
    },
    darkPattern: {
      riskScore: darkPatternResult.riskScore,
      grade: darkPatternResult.grade,
      patterns: darkPatternResult.patterns.map((p) => ({
        type: p.type,
        risk: p.risk,
        explanation: p.explanation,
      })),
    },
    overall: {
      score: overall.overall,
      grade: overall.grade,
      summary: overall.summary,
    },
    timestamp: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the full agent pipeline: LLM extraction followed by Phase 1 analysis.
 *
 * @param snapshot - Structured page snapshot collected by the content script
 * @param apiKey   - Anthropic API key
 * @param model    - Model identifier (e.g. "claude-sonnet-4-20250514")
 * @returns A `PipelineResult` indicating success (with analysis) or failure
 */
export async function runAgentPipeline(
  snapshot: PageSnapshot,
  apiKey: string,
  model: string,
): Promise<PipelineResult> {
  try {
    // Step 1: Call Claude for page classification and data extraction
    const rawResponse = await callClaude(
      apiKey,
      model,
      SYSTEM_PROMPT,
      buildUserMessage(snapshot),
    );

    // Step 2: Parse and validate the LLM response
    const extraction: AgentExtraction = parseAgentResponse(rawResponse);

    // Step 3: Non-commercial pages need no further analysis
    if (extraction.pageType === 'non-commercial') {
      return {
        success: true,
        pageType: extraction.pageType,
        analysis: null,
        agentNotes: extraction.agentNotes,
        suspiciousPatterns: [],
      };
    }

    // Step 4-5: Run Phase 1 engines and build AnalysisResult
    const analysis = buildAnalysis(extraction, snapshot);

    // Step 6: Return success with full results
    return {
      success: true,
      pageType: extraction.pageType,
      analysis,
      agentNotes: extraction.agentNotes,
      suspiciousPatterns: extraction.suspiciousPatterns,
    };
  } catch (err: unknown) {
    // Step 7: Known agent errors (auth, rate_limit, overloaded, network)
    if (err instanceof AgentError) {
      return {
        success: false,
        error: err.message,
        errorCode: err.code,
      };
    }

    // Step 8: Unexpected errors
    const message =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      error: message,
      errorCode: 'unknown',
    };
  }
}

/**
 * Parses and validates the JSON response from Claude API for ShopGuard
 * page analysis. Handles raw JSON, markdown code fences, and embedded
 * JSON within arbitrary text.
 */

import type {
  AgentExtraction,
  AgentPriceInfo,
  AgentReview,
  AgentSuspiciousPattern,
  PageType,
  PatternSeverity,
} from '../types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_PAGE_TYPES: ReadonlySet<PageType> = new Set([
  'product',
  'ad',
  'sponsored-content',
  'live-commerce',
  'non-commercial',
]);

const VALID_SEVERITIES: ReadonlySet<PatternSeverity> = new Set([
  'low',
  'medium',
  'high',
  'critical',
]);

// ---------------------------------------------------------------------------
// JSON extraction strategies
// ---------------------------------------------------------------------------

/**
 * Attempt to extract a JSON object from a raw string using three
 * strategies in order:
 *  1. Direct JSON.parse
 *  2. Extract from markdown code fences (```json ... ```)
 *  3. Substring from first `{` to last `}`
 *
 * Returns the parsed object or null if all strategies fail.
 */
function extractJson(raw: string): unknown {
  // Strategy 1: direct parse
  try {
    return JSON.parse(raw);
  } catch {
    // fall through
  }

  // Strategy 2: markdown code fence
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fall through
    }
  }

  // Strategy 3: first { to last }
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {
      // fall through
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Primitive validators / coercers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ---------------------------------------------------------------------------
// Field validators
// ---------------------------------------------------------------------------

function validatePageType(value: unknown): PageType {
  if (typeof value === 'string' && VALID_PAGE_TYPES.has(value as PageType)) {
    return value as PageType;
  }
  return 'non-commercial';
}

function validateConfidence(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return clamp(value, 0, 1);
  }
  return 0.5;
}

function validateProductName(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return null;
}

function validatePlatform(value: unknown): string {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return 'unknown';
}

function validateReview(item: unknown): AgentReview | null {
  if (!isRecord(item)) {
    return null;
  }

  const text = typeof item['text'] === 'string' ? item['text'] : null;
  if (text === null) {
    return null;
  }

  const rating =
    typeof item['rating'] === 'number' && !Number.isNaN(item['rating'])
      ? clamp(Math.round(item['rating']), 1, 5)
      : 3;

  const date = typeof item['date'] === 'string' ? item['date'] : 'unknown';

  return { text, rating, date };
}

function validateReviews(value: unknown): AgentReview[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const results: AgentReview[] = [];
  for (const item of value) {
    const review = validateReview(item);
    if (review !== null) {
      results.push(review);
    }
  }
  return results;
}

function validatePriceInfo(value: unknown): AgentPriceInfo {
  const defaults: AgentPriceInfo = {
    displayPrice: null,
    originalPrice: null,
    currency: 'KRW',
    hiddenFees: [],
  };

  if (!isRecord(value)) {
    return defaults;
  }

  const displayPrice =
    typeof value['displayPrice'] === 'string' ? value['displayPrice'] : null;
  const originalPrice =
    typeof value['originalPrice'] === 'string' ? value['originalPrice'] : null;
  const currency =
    typeof value['currency'] === 'string' && value['currency'].length > 0
      ? value['currency']
      : 'KRW';

  let hiddenFees: string[] = [];
  if (Array.isArray(value['hiddenFees'])) {
    hiddenFees = value['hiddenFees'].filter(
      (fee: unknown): fee is string => typeof fee === 'string',
    );
  }

  return { displayPrice, originalPrice, currency, hiddenFees };
}

function validateSuspiciousPattern(
  item: unknown,
): AgentSuspiciousPattern | null {
  if (!isRecord(item)) {
    return null;
  }

  const type = typeof item['type'] === 'string' ? item['type'] : null;
  const evidence =
    typeof item['evidence'] === 'string' ? item['evidence'] : null;

  if (type === null || evidence === null) {
    return null;
  }

  const severity =
    typeof item['severity'] === 'string' &&
    VALID_SEVERITIES.has(item['severity'] as PatternSeverity)
      ? (item['severity'] as PatternSeverity)
      : 'medium';

  return { type, evidence, severity };
}

function validateSuspiciousPatterns(
  value: unknown,
): AgentSuspiciousPattern[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const results: AgentSuspiciousPattern[] = [];
  for (const item of value) {
    const pattern = validateSuspiciousPattern(item);
    if (pattern !== null) {
      results.push(pattern);
    }
  }
  return results;
}

function validateAgentNotes(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse and validate a raw string response from the Claude API into a
 * fully validated `AgentExtraction` object.
 *
 * Extraction strategies (tried in order):
 *  1. Direct `JSON.parse` of the entire string
 *  2. Extract JSON from markdown code fences (` ```json ... ``` `)
 *  3. Substring from the first `{` to the last `}`
 *
 * All fields are validated and coerced to their expected types with
 * sensible defaults for missing or invalid optional fields.
 *
 * @param raw - The raw string response from the Claude API
 * @returns A validated AgentExtraction object
 * @throws {Error} If no JSON object can be extracted from the input
 */
export function parseAgentResponse(raw: string): AgentExtraction {
  const parsed = extractJson(raw);

  if (parsed === null || !isRecord(parsed)) {
    throw new Error(
      `Failed to parse agent response: no valid JSON object found in response (length=${raw.length}, preview="${raw.slice(0, 120)}")`,
    );
  }

  return {
    pageType: validatePageType(parsed['pageType']),
    confidence: validateConfidence(parsed['confidence']),
    productName: validateProductName(parsed['productName']),
    platform: validatePlatform(parsed['platform']),
    reviews: validateReviews(parsed['reviews']),
    priceInfo: validatePriceInfo(parsed['priceInfo']),
    suspiciousPatterns: validateSuspiciousPatterns(
      parsed['suspiciousPatterns'],
    ),
    agentNotes: validateAgentNotes(parsed['agentNotes']),
  };
}

import type { PriceComponent, PriceAnalysis } from '../core/types.js';
import { scoreToGrade } from '../core/scoring.js';
import {
  detectHiddenFees,
  detectSubscriptionTraps,
  extractPrices,
  calculatePriceTrustScore,
} from './detector.js';

/**
 * Run full price analysis on page content.
 * Detects hidden fees, subscription traps, and calculates trust score.
 */
export function analyzePrices(html: string): PriceAnalysis {
  const components = extractPrices(html);
  const fees = detectHiddenFees(html);
  const traps = detectSubscriptionTraps(html);
  const issues = [...fees, ...traps];

  const totalHiddenFeeCents = issues.reduce(
    (sum, i) => sum + i.estimatedExtraCostCents,
    0,
  );

  const trustScore = calculatePriceTrustScore(issues);

  return {
    components,
    issues,
    trustScore,
    grade: scoreToGrade(trustScore),
    totalHiddenFeeCents,
  };
}

/**
 * Compare prices across multiple sources for the same product.
 * Returns insights about price differences.
 */
export function comparePrices(
  sources: Array<{ name: string; priceCents: number; currency: string }>,
): {
  cheapest: { name: string; priceCents: number };
  mostExpensive: { name: string; priceCents: number };
  spreadPercent: number;
  sources: typeof sources;
} | null {
  if (sources.length < 2) return null;

  // Only compare same-currency sources
  const currency = sources[0].currency;
  const sameCurrency = sources.filter((s) => s.currency === currency);
  if (sameCurrency.length < 2) return null;

  const sorted = [...sameCurrency].sort((a, b) => a.priceCents - b.priceCents);
  const cheapest = sorted[0];
  const mostExpensive = sorted[sorted.length - 1];
  const spreadPercent =
    cheapest.priceCents > 0
      ? Math.round(
          ((mostExpensive.priceCents - cheapest.priceCents) /
            cheapest.priceCents) *
            100,
        )
      : 0;

  return {
    cheapest: { name: cheapest.name, priceCents: cheapest.priceCents },
    mostExpensive: {
      name: mostExpensive.name,
      priceCents: mostExpensive.priceCents,
    },
    spreadPercent,
    sources: sameCurrency,
  };
}

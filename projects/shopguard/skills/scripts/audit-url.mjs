#!/usr/bin/env node
/**
 * ShopGuard URL Audit Script
 *
 * Usage: node skills/scripts/audit-url.mjs <url>
 *
 * Fetches a shopping page and runs the full ShopGuard analysis pipeline.
 * Outputs a structured JSON evidence report to stdout.
 */

import { analyzeReviews } from 'shopguard-mcp/review';
import { analyzePrices } from 'shopguard-mcp/price';
import { analyzeDarkPatterns } from 'shopguard-mcp/darkpattern';
import { calculateTrustScore } from 'shopguard-mcp';
import { extractPageData } from 'shopguard-mcp/extractors';
import { extractDarkPatternEvidence } from 'shopguard-mcp/signals';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node audit-url.mjs <url>');
  process.exit(1);
}

async function fetchPage(targetUrl) {
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ShopGuard/0.4.0)',
      'Accept': 'text/html',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.text();
}

async function main() {
  console.error(`Fetching: ${url}`);
  const html = await fetchPage(url);
  console.error(`HTML size: ${html.length} bytes`);

  // Phase 1: Page overview
  const page = extractPageData(html, url);
  console.error(`Platform: ${page.platform}, Reviews: ${page.reviewBlocks.length}, Prices: ${page.priceContexts.length}`);

  // Phase 2: Dark patterns (mandatory)
  const bodyText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 100000);
  const darkPatterns = extractDarkPatternEvidence(bodyText, html);

  // Phase 3: Price analysis
  const priceResult = analyzePrices(html);

  // Phase 4: Review analysis (basic — no LLM extraction)
  const reviews = page.reviewBlocks
    .filter((b) => b.length > 20)
    .slice(0, 30)
    .map((t) => ({ text: t, rating: 3, date: 'unknown' }));
  const reviewResult = analyzeReviews(reviews, { locale: 'ko' });

  // Phase 5: Trust score
  const overall = calculateTrustScore(
    reviewResult.overallScore,
    priceResult.trustScore,
    100 - (darkPatterns.length > 0 ? Math.min(darkPatterns.length * 15, 80) : 0),
  );

  // Output
  const report = {
    url,
    platform: page.platform,
    timestamp: new Date().toISOString(),
    darkPatterns: {
      count: darkPatterns.length,
      findings: darkPatterns,
    },
    pricing: {
      trustScore: priceResult.trustScore,
      grade: priceResult.grade,
      issues: priceResult.issues,
      hiddenFeeCents: priceResult.totalHiddenFeeCents,
    },
    reviews: {
      total: reviewResult.totalReviews,
      suspicious: reviewResult.suspiciousCount,
      score: reviewResult.overallScore,
      grade: reviewResult.grade,
      details: reviewResult.details,
    },
    overall: {
      score: overall.overall,
      grade: overall.grade,
      summary: overall.summary,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

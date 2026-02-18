import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  extractPageDataSchema,
  extractReviewsSchema,
  extractPricingSchema,
  scanDarkPatternsSchema,
  compareReviewSetsSchema,
  comparePricesSchema,
  detectAgentReadinessSchema,
  handleExtractPageData,
  handleExtractReviews,
  handleExtractPricing,
  handleScanDarkPatterns,
  handleCompareReviewSets,
  handleComparePrices,
  handleDetectAgentReadiness,
} from './tools.js';
import { ALL_RESOURCES } from './resources.js';
import { ALL_PROMPTS } from './prompts.js';

type Tier = 'free' | 'pro';

function getTier(): Tier {
  const env = process.env.SHOPGUARD_TIER?.toLowerCase();
  if (env === 'pro') return 'pro';
  return 'free';
}

const PRO_TOOLS = new Set(['extractReviews', 'extractPricing', 'compareReviewSets', 'comparePrices']);

function ok(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

function err(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

function proRequired(toolName: string) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        error: 'pro_required',
        tool: toolName,
        message: `The "${toolName}" tool requires ShopGuard Pro. Free tier includes: extractPageData, scanDarkPatterns, detectAgentReadiness.`,
        upgrade_url: 'https://shopguard.dev/pricing',
      }),
    }],
    isError: true as const,
  };
}

function checkTier(toolName: string): boolean {
  if (!PRO_TOOLS.has(toolName)) return true;
  return getTier() === 'pro';
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'shopguard',
    version: '0.2.0',
  });

  // ── Tools (7) ──

  server.tool(
    'extractPageData',
    'Extract structured page data (meta, prices, reviews, CTAs, agent-readiness signals) from shopping page HTML. Returns evidence for AI agent reasoning, not scores.',
    extractPageDataSchema,
    async (args) => {
      try {
        return ok(handleExtractPageData(args));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'extractReviews',
    'Extract structured reviews from HTML and compute 7 statistical signals (date clustering, rating anomaly, phrase repetition, length uniformity, incentive keywords, rating surge, AI generation) — each with evidence strings.',
    extractReviewsSchema,
    async (args) => {
      if (!checkTier('extractReviews')) return proRequired('extractReviews');
      try {
        return ok(handleExtractReviews(args));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'extractPricing',
    'Extract price components, hidden fee matches (with 100-char context), and subscription/pricing trap evidence from HTML.',
    extractPricingSchema,
    async (args) => {
      if (!checkTier('extractPricing')) return proRequired('extractPricing');
      try {
        return ok(handleExtractPricing(args));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'scanDarkPatterns',
    'Scan text and HTML for 9 dark pattern types (urgency, social proof, confirm-shaming, misdirection, preselection, forced continuity, obstruction, hidden costs, privacy zuckering) — returns evidence + context per match.',
    scanDarkPatternsSchema,
    async (args) => {
      try {
        return ok(handleScanDarkPatterns(args));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'compareReviewSets',
    'Compare reviews from two sources (e.g., different platforms) — detects rating gaps, duplicate texts, and runs signals on each set independently.',
    compareReviewSetsSchema,
    async (args) => {
      if (!checkTier('compareReviewSets')) return proRequired('compareReviewSets');
      try {
        return ok(handleCompareReviewSets(args));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'comparePrices',
    'Compare fee-inclusive prices across sources — detects outliers, calculates spread, and breaks down fee components per source.',
    comparePricesSchema,
    async (args) => {
      if (!checkTier('comparePrices')) return proRequired('comparePrices');
      try {
        return ok(handleComparePrices(args));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'detectAgentReadiness',
    'Detect structured data and agent-readiness signals in HTML (Schema.org, OpenGraph, agent manifests). Note: WebMCP tools are registered via JavaScript and cannot be detected from static HTML.',
    detectAgentReadinessSchema,
    async (args) => {
      try {
        return ok(handleDetectAgentReadiness(args));
      } catch (e) {
        return err(e);
      }
    },
  );

  // ── Resources (3) ──

  for (const resource of ALL_RESOURCES) {
    server.resource(
      resource.name,
      resource.uri,
      { description: resource.description, mimeType: resource.mimeType },
      async () => ({
        contents: [{
          uri: resource.uri,
          mimeType: resource.mimeType,
          text: resource.content,
        }],
      }),
    );
  }

  // ── Prompts (3) ──

  // analyze-shopping-page (optional url arg)
  server.prompt(
    'analyze-shopping-page',
    ALL_PROMPTS[0].description,
    { url: z.string().optional().describe('Page URL (optional, helps platform detection)') },
    (args) => ({
      messages: ALL_PROMPTS[0].getMessages({ url: args.url ?? '' }),
    }),
  );

  // verify-reviews (optional locale arg)
  server.prompt(
    'verify-reviews',
    ALL_PROMPTS[1].description,
    { locale: z.string().optional().describe('Language (ko or en)') },
    (args) => ({
      messages: ALL_PROMPTS[1].getMessages({ locale: args.locale ?? 'ko' }),
    }),
  );

  // price-check (no args)
  server.prompt(
    'price-check',
    ALL_PROMPTS[2].description,
    () => ({
      messages: ALL_PROMPTS[2].getMessages({}),
    }),
  );

  return server;
}

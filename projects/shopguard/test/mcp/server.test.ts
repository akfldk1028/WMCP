import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/mcp/server.js';

async function createTestClient() {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return client;
}

function parseResult(result: { content: unknown }) {
  const content = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content[0].text);
}

// ── Tools ──

describe('MCP Server — Tools', () => {
  let originalTier: string | undefined;

  beforeEach(() => {
    originalTier = process.env.SHOPGUARD_TIER;
    process.env.SHOPGUARD_TIER = 'pro'; // Enable all tools for testing
  });

  afterEach(() => {
    if (originalTier !== undefined) {
      process.env.SHOPGUARD_TIER = originalTier;
    } else {
      delete process.env.SHOPGUARD_TIER;
    }
  });

  it('lists 7 tools', async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(7);
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([
      'comparePrices',
      'compareReviewSets',
      'detectAgentReadiness',
      'extractPageData',
      'extractPricing',
      'extractReviews',
      'scanDarkPatterns',
    ]);
  });

  describe('extractPageData', () => {
    it('extracts structured page data from HTML', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'extractPageData',
        arguments: {
          html: '<html><head><title>Test Shop</title></head><body><div class="price">$29.99</div><div class="review">Great product!</div></body></html>',
          url: 'https://example.com',
        },
      });

      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('title', 'Test Shop');
      expect(parsed).toHaveProperty('url', 'https://example.com');
      expect(parsed).toHaveProperty('meta');
      expect(parsed).toHaveProperty('priceContexts');
      expect(parsed).toHaveProperty('reviewBlocks');
      expect(parsed).toHaveProperty('interactiveElements');
      expect(parsed).toHaveProperty('formCount');
      expect(parsed).toHaveProperty('agentReadinessDetected');
    });
  });

  describe('extractReviews', () => {
    it('extracts reviews from HTML with signals', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'extractReviews',
        arguments: {
          reviewBlocks: [
            { text: '정말 좋은 제품입니다. 추천합니다.', rating: 5, date: '2026-01-01' },
            { text: '가성비 괜찮아요. 배송도 빨라요.', rating: 4, date: '2026-01-02' },
            { text: '만족합니다. 또 구매할 의향 있어요.', rating: 5, date: '2026-01-03' },
          ],
          locale: 'ko',
        },
      });

      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('reviews');
      expect(parsed).toHaveProperty('signals');
      expect(parsed.reviews).toHaveLength(3);
      // Each review should have structured fields
      expect(parsed.reviews[0]).toHaveProperty('wordCount');
      expect(parsed.reviews[0]).toHaveProperty('incentiveKeywords');
      // Signals should have evidence
      expect(parsed.signals).toHaveProperty('dateCluster');
      expect(parsed.signals.dateCluster).toHaveProperty('score');
      expect(parsed.signals.dateCluster).toHaveProperty('evidence');
    });
  });

  describe('extractPricing', () => {
    it('extracts fees and traps from HTML', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'extractPricing',
        arguments: {
          html: '<p>Price: $29.99</p><p class="small">Service fee: $5.99</p><p>무료 체험 후 자동 결제됩니다</p>',
        },
      });

      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('components');
      expect(parsed).toHaveProperty('feeMatches');
      expect(parsed).toHaveProperty('trapMatches');
      expect(parsed.feeMatches.length).toBeGreaterThan(0);
      expect(parsed.feeMatches[0]).toHaveProperty('label');
      expect(parsed.feeMatches[0]).toHaveProperty('context');
    });
  });

  describe('scanDarkPatterns', () => {
    it('detects dark patterns with evidence and context', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'scanDarkPatterns',
        arguments: {
          content: 'Only 2 left! 15 people are viewing this. No thanks, I don\'t want to save money.',
        },
      });

      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('matches');
      expect(parsed.matches.length).toBeGreaterThan(0);
      // Each match should have evidence + context
      expect(parsed.matches[0]).toHaveProperty('type');
      expect(parsed.matches[0]).toHaveProperty('evidence');
      expect(parsed.matches[0]).toHaveProperty('context');
    });
  });

  describe('compareReviewSets', () => {
    it('compares two sources of reviews', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'compareReviewSets',
        arguments: {
          sourceA: [
            { text: 'Great product!', rating: 5, date: '2026-01-01' },
            { text: 'Love it!', rating: 5, date: '2026-01-02' },
          ],
          sourceB: [
            { text: 'It is okay.', rating: 3, date: '2026-01-01' },
            { text: 'Not great.', rating: 2, date: '2026-01-02' },
          ],
          locale: 'en',
        },
      });

      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('sourceA');
      expect(parsed).toHaveProperty('sourceB');
      expect(parsed).toHaveProperty('comparison');
      expect(parsed.comparison).toHaveProperty('ratingDifference');
      expect(parsed.comparison.ratingDifference).toBeGreaterThan(0);
    });
  });

  describe('comparePrices', () => {
    it('compares prices across sources', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'comparePrices',
        arguments: {
          sources: [
            { name: 'Store A', priceCents: 5000, currency: 'USD', fees: [{ label: 'Shipping', amountCents: 500 }] },
            { name: 'Store B', priceCents: 4500, currency: 'USD' },
            { name: 'Store C', priceCents: 6000, currency: 'USD', fees: [{ label: 'Service', amountCents: 1000 }] },
          ],
        },
      });

      const parsed = parseResult(result);
      expect(parsed).toHaveProperty('cheapest');
      expect(parsed).toHaveProperty('mostExpensive');
      expect(parsed).toHaveProperty('spreadPercent');
      expect(parsed).toHaveProperty('sources');
      expect(parsed.sources[0]).toHaveProperty('totalWithFeesCents');
    });
  });

  describe('detectAgentReadiness', () => {
    it('detects structured data signals', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'detectAgentReadiness',
        arguments: {
          html: '<html><head><script type="application/ld+json">{"@type":"Product"}</script><meta property="og:title" content="Test"></head><body></body></html>',
        },
      });

      const parsed = parseResult(result);
      expect(parsed.agentReadiness.hasStructuredData).toBe(true);
      expect(parsed.agentReadiness.signals).toContain('schema.org-jsonld');
      expect(parsed.agentReadiness.signals).toContain('opengraph');
    });

    it('returns empty signals for plain HTML', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'detectAgentReadiness',
        arguments: { html: '<html><body>Hello</body></html>' },
      });

      const parsed = parseResult(result);
      expect(parsed.agentReadiness.hasStructuredData).toBe(false);
      expect(parsed.agentReadiness.signals).toHaveLength(0);
    });
  });
});

// ── Tier Gating ──

describe('MCP Server — Tier Gating', () => {
  let originalTier: string | undefined;

  beforeEach(() => {
    originalTier = process.env.SHOPGUARD_TIER;
    delete process.env.SHOPGUARD_TIER; // Free tier
  });

  afterEach(() => {
    if (originalTier !== undefined) {
      process.env.SHOPGUARD_TIER = originalTier;
    } else {
      delete process.env.SHOPGUARD_TIER;
    }
  });

  it('allows free tools', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'extractPageData',
      arguments: { html: '<html><body>test</body></html>' },
    });
    const parsed = parseResult(result);
    expect(parsed).not.toHaveProperty('error');
  });

  it('blocks pro tools on free tier', async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'extractReviews',
      arguments: { reviewBlocks: [], locale: 'ko' },
    });
    const parsed = parseResult(result);
    expect(parsed.error).toBe('pro_required');
    expect(parsed).toHaveProperty('upgrade_url');
  });

  it('allows pro tools on pro tier', async () => {
    process.env.SHOPGUARD_TIER = 'pro';
    const client = await createTestClient();
    const result = await client.callTool({
      name: 'extractReviews',
      arguments: { reviewBlocks: [], locale: 'ko' },
    });
    const parsed = parseResult(result);
    expect(parsed).not.toHaveProperty('error');
  });
});

// ── Resources ──

describe('MCP Server — Resources', () => {
  it('lists 3 resources', async () => {
    const client = await createTestClient();
    const { resources } = await client.listResources();
    expect(resources).toHaveLength(3);
    const uris = resources.map((r) => r.uri).sort();
    expect(uris).toEqual([
      'shopguard://catalog/dark-patterns',
      'shopguard://catalog/pricing-tactics',
      'shopguard://catalog/review-indicators',
    ]);
  });

  it('reads dark pattern catalog', async () => {
    const client = await createTestClient();
    const result = await client.readResource({ uri: 'shopguard://catalog/dark-patterns' });
    expect(result.contents).toHaveLength(1);
    const parsed = JSON.parse(result.contents[0].text!);
    expect(parsed).toHaveProperty('patterns');
    expect(parsed.patterns.length).toBe(9);
  });

  it('reads pricing tactics catalog', async () => {
    const client = await createTestClient();
    const result = await client.readResource({ uri: 'shopguard://catalog/pricing-tactics' });
    const parsed = JSON.parse(result.contents[0].text!);
    expect(parsed).toHaveProperty('tactics');
    expect(parsed.tactics.length).toBe(8);
  });

  it('reads review indicators catalog', async () => {
    const client = await createTestClient();
    const result = await client.readResource({ uri: 'shopguard://catalog/review-indicators' });
    const parsed = JSON.parse(result.contents[0].text!);
    expect(parsed).toHaveProperty('indicators');
    expect(parsed.indicators.length).toBe(6);
    expect(parsed).toHaveProperty('aiDetection');
  });
});

// ── Prompts ──

describe('MCP Server — Prompts', () => {
  it('lists 3 prompts', async () => {
    const client = await createTestClient();
    const { prompts } = await client.listPrompts();
    expect(prompts).toHaveLength(3);
    const names = prompts.map((p) => p.name).sort();
    expect(names).toEqual(['analyze-shopping-page', 'price-check', 'verify-reviews']);
  });

  it('gets analyze-shopping-page prompt', async () => {
    const client = await createTestClient();
    const result = await client.getPrompt({
      name: 'analyze-shopping-page',
      arguments: { url: 'https://example.com' },
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
    const text = (result.messages[0].content as { text: string }).text;
    expect(text).toContain('extractPageData');
    expect(text).toContain('example.com');
  });

  it('gets verify-reviews prompt', async () => {
    const client = await createTestClient();
    const result = await client.getPrompt({
      name: 'verify-reviews',
      arguments: { locale: 'en' },
    });
    expect(result.messages).toHaveLength(1);
    const text = (result.messages[0].content as { text: string }).text;
    expect(text).toContain('extractReviews');
    expect(text).toContain('en');
  });

  it('gets price-check prompt', async () => {
    const client = await createTestClient();
    const result = await client.getPrompt({
      name: 'price-check',
      arguments: {},
    });
    expect(result.messages).toHaveLength(1);
    const text = (result.messages[0].content as { text: string }).text;
    expect(text).toContain('extractPricing');
  });
});

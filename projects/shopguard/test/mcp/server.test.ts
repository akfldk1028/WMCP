import { describe, it, expect } from 'vitest';
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

describe('MCP Server', () => {
  it('lists 3 tools', async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(['analyzeReviews', 'detectHiddenFees', 'scanDarkPatterns']);
  });

  describe('analyzeReviews', () => {
    it('analyzes reviews and returns grade', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'analyzeReviews',
        arguments: {
          reviews: [
            { text: '정말 좋은 제품입니다. 추천합니다.', rating: 5, date: '2026-01-01' },
            { text: '가성비 괜찮아요. 배송도 빨라요.', rating: 4, date: '2026-01-02' },
            { text: '만족합니다. 또 구매할 의향 있어요.', rating: 5, date: '2026-01-03' },
          ],
          locale: 'ko',
        },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');

      const parsed = JSON.parse(content[0].text);
      expect(parsed).toHaveProperty('totalReviews', 3);
      expect(parsed).toHaveProperty('grade');
      expect(parsed).toHaveProperty('overallScore');
    });

    it('handles empty reviews', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'analyzeReviews',
        arguments: { reviews: [], locale: 'ko' },
      });

      const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(parsed.totalReviews).toBe(0);
      expect(parsed.grade).toBe('A');
    });
  });

  describe('detectHiddenFees', () => {
    it('detects hidden fees in HTML', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'detectHiddenFees',
        arguments: {
          html: '<p>Price: $29.99</p><p class="small">Service fee: $5.99</p><p class="small">Processing fee: $3.99</p>',
        },
      });

      const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(parsed).toHaveProperty('trustScore');
      expect(parsed).toHaveProperty('grade');
      expect(parsed).toHaveProperty('issues');
    });

    it('returns clean result for simple HTML', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'detectHiddenFees',
        arguments: { html: '<p>Hello world</p>' },
      });

      const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(parsed.trustScore).toBe(100);
    });
  });

  describe('scanDarkPatterns', () => {
    it('detects dark patterns in text', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'scanDarkPatterns',
        arguments: {
          content: 'Only 2 left in stock! 15 people are viewing this right now. Order within 3 minutes!',
        },
      });

      const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(parsed).toHaveProperty('patterns');
      expect(parsed).toHaveProperty('riskScore');
      expect(parsed).toHaveProperty('grade');
      expect(parsed.patterns.length).toBeGreaterThan(0);
    });

    it('accepts optional html parameter', async () => {
      const client = await createTestClient();
      const result = await client.callTool({
        name: 'scanDarkPatterns',
        arguments: {
          content: 'Subscribe to our newsletter',
          html: '<input type="checkbox" checked> <label>Yes, sign me up for promotional emails</label>',
        },
      });

      const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(parsed).toHaveProperty('grade');
    });
  });
});

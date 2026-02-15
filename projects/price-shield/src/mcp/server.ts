import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { defaultRegistry, PipelineExecutor } from '../runtime/index.js';
import { registerAllNodes } from '../nodes/index.js';
import { MemoryAdapter } from '../storage/memory.js';
import { createAnalyzePagePipeline } from '../presets/analyze-page.js';
import { createTrackPricePipeline } from '../presets/track-price.js';
import { createCompareSitesPipeline } from '../presets/compare-sites.js';
import type { PipelineContext } from '../runtime/types.js';

registerAllNodes(defaultRegistry);

const storage = new MemoryAdapter();
const executor = new PipelineExecutor(defaultRegistry);

function createContext(): PipelineContext {
  return { storage, results: new Map() };
}

const server = new McpServer({
  name: 'price-shield',
  version: '0.2.0',
});

server.tool(
  'analyze',
  'Analyze a page for hidden fees, subscription traps, and pricing issues',
  {
    url: z.string().url().describe('URL of the page to analyze'),
    format: z.enum(['json', 'markdown', 'text']).default('json').describe('Output format'),
  },
  async ({ url, format }) => {
    const pipeline = createAnalyzePagePipeline(url, format);
    const ctx = createContext();
    const result = await executor.execute(pipeline, ctx);
    const report = result.outputs.get('report') as { formatted: string } | undefined;

    return {
      content: [{
        type: 'text' as const,
        text: report?.formatted ?? 'Analysis produced no output',
      }],
    };
  },
);

server.tool(
  'track',
  'Track price changes over time with drop/spike alerts',
  {
    url: z.string().url().describe('URL to track'),
    productName: z.string().default('product').describe('Product name'),
    days: z.number().default(30).describe('Days of history to analyze'),
    dropThreshold: z.number().default(10).describe('% drop to trigger alert'),
    spikeThreshold: z.number().default(15).describe('% spike to trigger alert'),
  },
  async ({ url, productName, days, dropThreshold, spikeThreshold }) => {
    const pipeline = createTrackPricePipeline(url, productName, {
      days,
      dropThreshold,
      spikeThreshold,
    });
    const ctx = createContext();
    const result = await executor.execute(pipeline, ctx);

    const drop = result.outputs.get('drop') as { message: string } | undefined;
    const spike = result.outputs.get('spike') as { message: string } | undefined;
    const extract = result.outputs.get('extract') as { count: number } | undefined;

    const text = [
      `Tracked: ${url}`,
      `Product: ${productName}`,
      `Prices found: ${extract?.count ?? 0}`,
      `Drop: ${drop?.message ?? 'N/A'}`,
      `Spike: ${spike?.message ?? 'N/A'}`,
      `Duration: ${result.durationMs}ms`,
    ].join('\n');

    return { content: [{ type: 'text' as const, text }] };
  },
);

server.tool(
  'compare',
  'Compare prices across multiple sites for the same product',
  {
    urls: z.array(z.string().url()).min(2).describe('URLs to compare'),
    productName: z.string().default('product').describe('Product name'),
  },
  async ({ urls, productName }) => {
    const pipeline = createCompareSitesPipeline(urls, productName);
    const ctx = createContext();
    const result = await executor.execute(pipeline, ctx);
    const compare = result.outputs.get('compare') as {
      comparison: {
        cheapest: { url: string; priceCents: number };
        mostExpensive: { url: string; priceCents: number };
        spreadPercent: number;
      } | null;
    } | undefined;

    let text: string;
    if (compare?.comparison) {
      const c = compare.comparison;
      text = [
        `Product: ${productName}`,
        `Cheapest: ${c.cheapest.url} — $${(c.cheapest.priceCents / 100).toFixed(2)}`,
        `Most expensive: ${c.mostExpensive.url} — $${(c.mostExpensive.priceCents / 100).toFixed(2)}`,
        `Price spread: ${c.spreadPercent}%`,
      ].join('\n');
    } else {
      text = 'Could not compare — insufficient price data';
    }

    return { content: [{ type: 'text' as const, text }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed:', err);
  process.exit(1);
});

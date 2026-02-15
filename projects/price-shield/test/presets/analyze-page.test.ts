import { describe, it, expect, beforeEach } from 'vitest';
import { NodeRegistry } from '../../src/runtime/registry.js';
import { PipelineExecutor } from '../../src/runtime/executor.js';
import { MemoryAdapter } from '../../src/storage/memory.js';
import type { PipelineContext, NodeDefinition } from '../../src/runtime/types.js';

// Mock FetchPageNode that returns test HTML instead of fetching
class MockFetchNode implements NodeDefinition {
  readonly type = 'fetch-page';
  async execute(_input: unknown, config: Record<string, unknown>) {
    return {
      url: config.url as string,
      html: `
        <div class="product">
          <span class="price">$29.99</span>
          <span class="hidden">Service Fee $4.99</span>
          <p>First month for $9.99, then $29.99/month</p>
        </div>
      `,
      userAgent: 'test',
      fetchedAt: new Date().toISOString(),
    };
  }
}

describe('analyze-page preset (mocked)', () => {
  let registry: NodeRegistry;
  let executor: PipelineExecutor;
  let ctx: PipelineContext;

  beforeEach(async () => {
    registry = new NodeRegistry();
    // Register mock fetch
    registry.register('fetch-page', () => new MockFetchNode());

    // Register real nodes (except fetch)
    const { ExtractPriceNode } = await import('../../src/nodes/extract/ExtractPriceNode.js');
    const { DetectHiddenFeesNode } = await import('../../src/nodes/analyze/DetectHiddenFeesNode.js');
    const { DetectTrapsNode } = await import('../../src/nodes/analyze/DetectTrapsNode.js');
    const { ScoreNode } = await import('../../src/nodes/output/ScoreNode.js');
    const { ReportNode } = await import('../../src/nodes/output/ReportNode.js');

    registry.register('extract-price', () => new ExtractPriceNode());
    registry.register('detect-hidden-fees', () => new DetectHiddenFeesNode());
    registry.register('detect-subscription-traps', () => new DetectTrapsNode());
    registry.register('score', () => new ScoreNode());
    registry.register('report', () => new ReportNode());

    executor = new PipelineExecutor(registry);
    ctx = { storage: new MemoryAdapter(), results: new Map() };
  });

  it('runs full analyze-page pipeline', async () => {
    const { createAnalyzePagePipeline } = await import('../../src/presets/analyze-page.js');
    const pipeline = createAnalyzePagePipeline('https://test.example.com');
    const result = await executor.execute(pipeline, ctx);

    // Should have all node outputs
    expect(result.outputs.has('fetch')).toBe(true);
    expect(result.outputs.has('extract')).toBe(true);
    expect(result.outputs.has('fees')).toBe(true);
    expect(result.outputs.has('traps')).toBe(true);
    expect(result.outputs.has('score')).toBe(true);
    expect(result.outputs.has('report')).toBe(true);

    // Extract should find prices
    const extract = result.outputs.get('extract') as { count: number };
    expect(extract.count).toBeGreaterThan(0);

    // Fees should detect the service fee
    const fees = result.outputs.get('fees') as { issues: Array<{ type: string }> };
    expect(fees.issues.some((i) => i.type === 'hidden-fee')).toBe(true);

    // Score should be less than 100 due to issues
    const score = result.outputs.get('score') as { trustScore: number };
    expect(score.trustScore).toBeLessThan(100);

    // Report should exist
    const report = result.outputs.get('report') as { formatted: string };
    expect(report.formatted).toBeTruthy();
  });

  it('generates markdown report', async () => {
    const { createAnalyzePagePipeline } = await import('../../src/presets/analyze-page.js');
    const pipeline = createAnalyzePagePipeline('https://test.example.com', 'markdown');
    const result = await executor.execute(pipeline, ctx);

    const report = result.outputs.get('report') as { formatted: string };
    expect(report.formatted).toContain('# Price Shield Report');
  });
});

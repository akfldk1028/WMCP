import { describe, it, expect, beforeEach } from 'vitest';
import { DetectSurgeNode } from '../../src/nodes/analyze/DetectSurgeNode.js';
import { MemoryAdapter } from '../../src/storage/memory.js';
import type { PipelineContext } from '../../src/runtime/types.js';
import type { PriceSnapshot } from '../../src/types.js';

describe('DetectSurgeNode', () => {
  let ctx: PipelineContext;
  const node = new DetectSurgeNode();

  beforeEach(() => {
    ctx = { storage: new MemoryAdapter(), results: new Map() };
  });

  it('detects no surge with stable prices', async () => {
    const snapshots: PriceSnapshot[] = [
      { id: '1', url: 'u', productName: 'p', priceCents: 1000, currency: 'USD', capturedAt: '2026-02-01T00:00:00Z' },
      { id: '2', url: 'u', productName: 'p', priceCents: 1020, currency: 'USD', capturedAt: '2026-02-10T00:00:00Z' },
      { id: '3', url: 'u', productName: 'p', priceCents: 1010, currency: 'USD', capturedAt: '2026-02-15T00:00:00Z' },
    ];
    const result = await node.execute({ snapshots }, {}, ctx);
    expect(result.isSurging).toBe(false);
    expect(result.issues).toHaveLength(0);
  });

  it('detects surge pricing when latest price is much higher', async () => {
    const snapshots: PriceSnapshot[] = [
      { id: '1', url: 'u', productName: 'p', priceCents: 1000, currency: 'USD', capturedAt: '2026-02-01T00:00:00Z' },
      { id: '2', url: 'u', productName: 'p', priceCents: 1000, currency: 'USD', capturedAt: '2026-02-05T00:00:00Z' },
      { id: '3', url: 'u', productName: 'p', priceCents: 1500, currency: 'USD', capturedAt: '2026-02-15T00:00:00Z' },
    ];
    const result = await node.execute({ snapshots }, { surgeThreshold: 20 }, ctx);
    expect(result.isSurging).toBe(true);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('surge-pricing');
  });

  it('returns no surge with insufficient data', async () => {
    const result = await node.execute({ snapshots: [] }, {}, ctx);
    expect(result.isSurging).toBe(false);
  });
});

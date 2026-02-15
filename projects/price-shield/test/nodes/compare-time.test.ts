import { describe, it, expect, beforeEach } from 'vitest';
import { CompareTimeNode } from '../../src/nodes/compare/CompareTimeNode.js';
import { MemoryAdapter } from '../../src/storage/memory.js';
import type { PipelineContext } from '../../src/runtime/types.js';
import type { PriceSnapshot } from '../../src/types.js';

describe('CompareTimeNode', () => {
  let ctx: PipelineContext;
  const node = new CompareTimeNode();

  beforeEach(() => {
    ctx = { storage: new MemoryAdapter(), results: new Map() };
  });

  it('returns null trend with <2 snapshots', async () => {
    const result = await node.execute({ snapshots: [] }, {}, ctx);
    expect(result.trend).toBeNull();
  });

  it('detects rising trend', async () => {
    const snapshots: PriceSnapshot[] = [
      { id: '1', url: 'u', productName: 'p', priceCents: 1000, currency: 'USD', capturedAt: '2026-01-01T00:00:00Z' },
      { id: '2', url: 'u', productName: 'p', priceCents: 1200, currency: 'USD', capturedAt: '2026-02-01T00:00:00Z' },
    ];
    const result = await node.execute({ snapshots }, {}, ctx);
    expect(result.trend?.direction).toBe('rising');
    expect(result.trend?.changePercent).toBe(20);
  });

  it('detects falling trend', async () => {
    const snapshots: PriceSnapshot[] = [
      { id: '1', url: 'u', productName: 'p', priceCents: 1200, currency: 'USD', capturedAt: '2026-01-01T00:00:00Z' },
      { id: '2', url: 'u', productName: 'p', priceCents: 1000, currency: 'USD', capturedAt: '2026-02-01T00:00:00Z' },
    ];
    const result = await node.execute({ snapshots }, {}, ctx);
    expect(result.trend?.direction).toBe('falling');
  });

  it('detects stable prices', async () => {
    const snapshots: PriceSnapshot[] = [
      { id: '1', url: 'u', productName: 'p', priceCents: 1000, currency: 'USD', capturedAt: '2026-01-01T00:00:00Z' },
      { id: '2', url: 'u', productName: 'p', priceCents: 1010, currency: 'USD', capturedAt: '2026-02-01T00:00:00Z' },
    ];
    const result = await node.execute({ snapshots }, {}, ctx);
    expect(result.trend?.direction).toBe('stable');
  });
});

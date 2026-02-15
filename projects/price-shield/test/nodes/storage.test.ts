import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSnapshotNode } from '../../src/nodes/storage/SaveSnapshotNode.js';
import { QueryHistoryNode } from '../../src/nodes/storage/QueryHistoryNode.js';
import { MemoryAdapter } from '../../src/storage/memory.js';
import type { PipelineContext } from '../../src/runtime/types.js';

describe('Storage Nodes', () => {
  let storage: MemoryAdapter;
  let ctx: PipelineContext;

  beforeEach(() => {
    storage = new MemoryAdapter();
    ctx = { storage, results: new Map() };
  });

  describe('SaveSnapshotNode', () => {
    const node = new SaveSnapshotNode();

    it('saves a snapshot and returns an id', async () => {
      const result = await node.execute(
        {
          url: 'https://example.com/product',
          prices: [{ label: 'price', amountCents: 2999, currency: 'USD', wasVisible: true, addedAtCheckout: false }],
        },
        { productName: 'Widget' },
        ctx,
      );
      expect(result.snapshotId).toBeTruthy();
      expect(storage.getAll()).toHaveLength(1);
      expect(storage.getAll()[0].priceCents).toBe(2999);
    });
  });

  describe('QueryHistoryNode', () => {
    const queryNode = new QueryHistoryNode();

    it('returns empty for no history', async () => {
      const result = await queryNode.execute({}, { url: 'https://example.com' }, ctx);
      expect(result.snapshots).toHaveLength(0);
    });

    it('returns saved snapshots', async () => {
      await storage.saveSnapshot({
        url: 'https://example.com',
        productName: 'Widget',
        priceCents: 1000,
        currency: 'USD',
        capturedAt: new Date().toISOString(),
      });
      const result = await queryNode.execute({}, { url: 'https://example.com' }, ctx);
      expect(result.snapshots).toHaveLength(1);
    });
  });
});

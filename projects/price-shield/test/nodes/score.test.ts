import { describe, it, expect } from 'vitest';
import { ScoreNode } from '../../src/nodes/output/ScoreNode.js';
import { MemoryAdapter } from '../../src/storage/memory.js';
import type { PipelineContext } from '../../src/runtime/types.js';

function ctx(): PipelineContext {
  return { storage: new MemoryAdapter(), results: new Map() };
}

describe('ScoreNode', () => {
  const node = new ScoreNode();

  it('returns perfect score for no issues', async () => {
    const result = await node.execute({ issues: [] }, {}, ctx());
    expect(result.trustScore).toBe(100);
    expect(result.grade).toBe('A');
    expect(result.issueCount).toBe(0);
  });

  it('reduces score based on issue severity', async () => {
    const result = await node.execute({
      issues: [
        { type: 'hidden-fee', severity: 70, description: 'fee', evidence: '', estimatedExtraCostCents: 500 },
      ],
    }, {}, ctx());
    expect(result.trustScore).toBeLessThan(100);
    expect(result.issueCount).toBe(1);
  });

  it('never goes below 0', async () => {
    const issues = Array.from({ length: 20 }, () => ({
      type: 'hidden-fee' as const,
      severity: 100,
      description: 'extreme',
      evidence: '',
      estimatedExtraCostCents: 0,
    }));
    const result = await node.execute({ issues }, {}, ctx());
    expect(result.trustScore).toBeGreaterThanOrEqual(0);
  });
});

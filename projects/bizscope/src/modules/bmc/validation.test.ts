import { describe, it, expect } from 'vitest';
import { validateBmc, getCompletionPercentage } from './validation';
import type { BmcData } from './types';

const makeBmc = (blocks: Record<string, { entries: string[] }>): BmcData => ({
  id: 'test', title: 'Test', blocks, status: 'draft', createdAt: Date.now(), updatedAt: Date.now(),
});

describe('validateBmc', () => {
  it('should pass when all 9 blocks have entries', () => {
    const bmc = makeBmc({
      'customer-segments': { entries: ['A'] }, 'value-proposition': { entries: ['B'] },
      'channels': { entries: ['C'] }, 'customer-relationships': { entries: ['D'] },
      'revenue-streams': { entries: ['E'] }, 'key-resources': { entries: ['F'] },
      'key-activities': { entries: ['G'] }, 'key-partners': { entries: ['H'] },
      'cost-structure': { entries: ['I'] },
    });
    const result = validateBmc(bmc);
    expect(result.valid).toBe(true);
    expect(result.missingBlocks).toHaveLength(0);
  });

  it('should fail when blocks are missing', () => {
    const bmc = makeBmc({ 'customer-segments': { entries: ['A'] }, 'value-proposition': { entries: ['B'] } });
    const result = validateBmc(bmc);
    expect(result.valid).toBe(false);
    expect(result.missingBlocks.length).toBe(7);
  });

  it('should fail when a block has empty entries', () => {
    const bmc = makeBmc({ 'customer-segments': { entries: [] }, 'value-proposition': { entries: ['B'] } });
    const result = validateBmc(bmc);
    expect(result.valid).toBe(false);
    expect(result.emptyBlocks).toContain('customer-segments');
  });
});

describe('getCompletionPercentage', () => {
  it('should return 0 for empty BMC', () => {
    expect(getCompletionPercentage(makeBmc({}))).toBe(0);
  });

  it('should return 100 for fully filled BMC', () => {
    const bmc = makeBmc({
      'customer-segments': { entries: ['A'] }, 'value-proposition': { entries: ['B'] },
      'channels': { entries: ['C'] }, 'customer-relationships': { entries: ['D'] },
      'revenue-streams': { entries: ['E'] }, 'key-resources': { entries: ['F'] },
      'key-activities': { entries: ['G'] }, 'key-partners': { entries: ['H'] },
      'cost-structure': { entries: ['I'] },
    });
    expect(getCompletionPercentage(bmc)).toBe(100);
  });

  it('should return partial percentage', () => {
    const bmc = makeBmc({ 'customer-segments': { entries: ['A'] }, 'value-proposition': { entries: ['B'] }, 'channels': { entries: ['C'] } });
    expect(getCompletionPercentage(bmc)).toBeCloseTo(33.3, 0);
  });
});

import { describe, it, expect } from 'vitest';
import { BMC_BLOCKS, type BmcBlock, type BmcBlockData, type BmcData } from './types';

describe('BMC Types', () => {
  it('should define all 9 BMC blocks', () => {
    expect(BMC_BLOCKS).toHaveLength(9);
    expect(BMC_BLOCKS).toContain('customer-segments');
    expect(BMC_BLOCKS).toContain('value-proposition');
    expect(BMC_BLOCKS).toContain('channels');
    expect(BMC_BLOCKS).toContain('customer-relationships');
    expect(BMC_BLOCKS).toContain('revenue-streams');
    expect(BMC_BLOCKS).toContain('key-resources');
    expect(BMC_BLOCKS).toContain('key-activities');
    expect(BMC_BLOCKS).toContain('key-partners');
    expect(BMC_BLOCKS).toContain('cost-structure');
  });

  it('should allow creating block data with entries', () => {
    const block: BmcBlockData = { entries: ['SaaS startups', 'Solo developers'], notes: 'Niche market focus', aiGenerated: true };
    expect(block.entries).toHaveLength(2);
    expect(block.aiGenerated).toBe(true);
  });

  it('should allow creating a full BMC data object', () => {
    const bmc: BmcData = {
      id: 'plan-123', title: 'BizScope AI',
      blocks: {
        'customer-segments': { entries: ['SaaS startups'], marketType: 'Niche' },
        'value-proposition': { entries: ['AI-powered business analysis'] },
      },
      status: 'draft', createdAt: Date.now(), updatedAt: Date.now(),
    };
    expect(bmc.blocks['customer-segments']?.entries).toHaveLength(1);
    expect(bmc.status).toBe('draft');
  });
});

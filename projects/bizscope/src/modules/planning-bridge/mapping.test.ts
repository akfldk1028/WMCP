import { describe, it, expect } from 'vitest';
import { mapPlanningToAnalysis, MAPPING_RULES } from './mapping';
import type { BmcData } from '@/modules/bmc/types';
import type { ServicePlanData } from '@/modules/service-planning/types';

describe('MAPPING_RULES', () => {
  it('should have rules for all 9 BMC blocks', () => {
    const bmcRules = MAPPING_RULES.filter((r) => r.source.module === 'bmc');
    expect(bmcRules.length).toBeGreaterThanOrEqual(9);
  });

  it('should have rules for all 8 planning stages', () => {
    const planRules = MAPPING_RULES.filter((r) => r.source.module === 'service-planning');
    expect(planRules.length).toBeGreaterThanOrEqual(8);
  });
});

describe('mapPlanningToAnalysis', () => {
  it('should map BMC customer-segments to idea-target-customer', () => {
    const bmc: BmcData = {
      id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0,
      blocks: { 'customer-segments': { entries: ['SaaS startups', 'Solo devs'] } },
    };
    const plan: ServicePlanData = {
      id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0, stages: {},
    };
    const result = mapPlanningToAnalysis(bmc, plan);
    expect(result['idea-target-customer']).toBeDefined();
    expect(result['idea-target-customer'].customerSegments).toContain('SaaS startups');
  });

  it('should map BMC value-proposition to idea-overview', () => {
    const bmc: BmcData = {
      id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0,
      blocks: { 'value-proposition': { entries: ['AI-powered analysis'] } },
    };
    const plan: ServicePlanData = {
      id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0, stages: {},
    };
    const result = mapPlanningToAnalysis(bmc, plan);
    expect(result['idea-overview']).toBeDefined();
    expect(result['idea-overview'].valueProposition).toContain('AI-powered analysis');
  });

  it('should map service planning marketing to go-to-market', () => {
    const bmc: BmcData = {
      id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0, blocks: {},
    };
    const plan: ServicePlanData = {
      id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0,
      stages: { 'marketing': { sections: { strategy: 'Content marketing + SEO' } } },
    };
    const result = mapPlanningToAnalysis(bmc, plan);
    expect(result['go-to-market']).toBeDefined();
    expect(result['go-to-market'].marketing).toBeDefined();
  });

  it('should return empty object when no data', () => {
    const bmc: BmcData = { id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0, blocks: {} };
    const plan: ServicePlanData = { id: 'test', title: 'Test', status: 'draft', createdAt: 0, updatedAt: 0, stages: {} };
    const result = mapPlanningToAnalysis(bmc, plan);
    expect(Object.keys(result).length).toBe(0);
  });
});

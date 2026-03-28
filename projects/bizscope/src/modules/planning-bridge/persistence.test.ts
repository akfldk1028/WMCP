import { describe, it, expect, vi, beforeEach } from 'vitest';
import { savePlanLocal, loadPlanLocal, listPlansLocal } from './persistence';
import type { BmcData } from '@/modules/bmc/types';
import type { ServicePlanData } from '@/modules/service-planning/types';

// Mock localStorage
const storage: Record<string, string> = {};
beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
  });
});

const mockBmc: BmcData = { id: 'bmc-1', title: 'Test', blocks: {}, status: 'draft', createdAt: 1, updatedAt: 1 };
const mockPlan: ServicePlanData = { id: 'plan-1', title: 'Test', stages: {}, status: 'draft', createdAt: 1, updatedAt: 1 };

describe('savePlanLocal', () => {
  it('should save plan to localStorage', () => {
    savePlanLocal('plan-1', mockBmc, mockPlan);
    expect(storage['bsai_plan_plan-1']).toBeTruthy();
  });
});

describe('loadPlanLocal', () => {
  it('should load a saved plan', () => {
    savePlanLocal('plan-1', mockBmc, mockPlan);
    const loaded = loadPlanLocal('plan-1');
    expect(loaded).not.toBeNull();
    expect(loaded?.bmc.id).toBe('bmc-1');
  });

  it('should return null for missing plan', () => {
    expect(loadPlanLocal('missing')).toBeNull();
  });
});

describe('listPlansLocal', () => {
  it('should list saved plan IDs', () => {
    savePlanLocal('plan-1', mockBmc, mockPlan);
    savePlanLocal('plan-2', { ...mockBmc, id: 'bmc-2' }, { ...mockPlan, id: 'plan-2' });
    const list = listPlansLocal();
    expect(list).toContain('plan-1');
    expect(list).toContain('plan-2');
  });
});

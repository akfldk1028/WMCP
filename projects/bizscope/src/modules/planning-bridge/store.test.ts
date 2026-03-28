import { describe, it, expect } from 'vitest';
import { createPlanningStore } from './store';

describe('PlanningStore', () => {
  it('should initialize with empty data', () => {
    const store = createPlanningStore();
    const state = store.getState();
    expect(state.bmc.blocks).toEqual({});
    expect(state.servicePlan.stages).toEqual({});
  });

  it('should update BMC block', () => {
    const store = createPlanningStore();
    store.getState().updateBmcBlock('customer-segments', { entries: ['Startups'] });
    expect(store.getState().bmc.blocks['customer-segments']?.entries).toEqual(['Startups']);
  });

  it('should update service plan stage', () => {
    const store = createPlanningStore();
    store.getState().updateStage('executive-summary', { sections: { objectives: 'AI tool' } });
    expect(store.getState().servicePlan.stages['executive-summary']?.sections.objectives).toBe('AI tool');
  });

  it('should set title', () => {
    const store = createPlanningStore();
    store.getState().setTitle('BizScope AI');
    expect(store.getState().bmc.title).toBe('BizScope AI');
    expect(store.getState().servicePlan.title).toBe('BizScope AI');
  });
});

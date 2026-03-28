import { describe, it, expect } from 'vitest';
import { PLAN_STAGES, type PlanStage, type StageData, type ServicePlanData } from './types';

describe('Service Planning Types', () => {
  it('should define all 8 planning stages', () => {
    expect(PLAN_STAGES).toHaveLength(8);
    expect(PLAN_STAGES).toContain('executive-summary');
    expect(PLAN_STAGES).toContain('conceptual-framework');
    expect(PLAN_STAGES).toContain('design-content');
    expect(PLAN_STAGES).toContain('technical-arch');
    expect(PLAN_STAGES).toContain('dev-roadmap');
    expect(PLAN_STAGES).toContain('marketing');
    expect(PLAN_STAGES).toContain('post-launch');
    expect(PLAN_STAGES).toContain('legal-ethical');
  });

  it('should allow creating stage data', () => {
    const stage: StageData = { sections: { objectives: 'Build AI tool', creativeStatement: 'Empowering decisions' }, notes: 'Draft', aiGenerated: true };
    expect(stage.sections.objectives).toBeTruthy();
  });

  it('should allow creating a full service plan', () => {
    const plan: ServicePlanData = {
      id: 'plan-1', title: 'BizScope AI',
      stages: { 'executive-summary': { sections: { objectives: 'AI business analysis' } } },
      status: 'draft', createdAt: Date.now(), updatedAt: Date.now(),
    };
    expect(plan.stages['executive-summary']?.sections.objectives).toBeTruthy();
  });
});

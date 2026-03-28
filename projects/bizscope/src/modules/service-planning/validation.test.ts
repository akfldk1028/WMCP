import { describe, it, expect } from 'vitest';
import { validatePlan, getPlanCompletionPercentage } from './validation';
import type { ServicePlanData } from './types';

const makePlan = (stages: Record<string, { sections: Record<string, unknown> }>): ServicePlanData => ({
  id: 'test', title: 'Test', stages, status: 'draft', createdAt: Date.now(), updatedAt: Date.now(),
});

describe('validatePlan', () => {
  it('should pass when all 8 stages have sections', () => {
    const plan = makePlan({
      'executive-summary': { sections: { a: 1 } }, 'conceptual-framework': { sections: { a: 1 } },
      'design-content': { sections: { a: 1 } }, 'technical-arch': { sections: { a: 1 } },
      'dev-roadmap': { sections: { a: 1 } }, 'marketing': { sections: { a: 1 } },
      'post-launch': { sections: { a: 1 } }, 'legal-ethical': { sections: { a: 1 } },
    });
    expect(validatePlan(plan).valid).toBe(true);
  });
  it('should fail when stages are missing', () => {
    const plan = makePlan({ 'executive-summary': { sections: { a: 1 } } });
    expect(validatePlan(plan).valid).toBe(false);
    expect(validatePlan(plan).missingStages.length).toBe(7);
  });
});

describe('getPlanCompletionPercentage', () => {
  it('should return 0 for empty', () => { expect(getPlanCompletionPercentage(makePlan({}))).toBe(0); });
  it('should return 100 for full', () => {
    const plan = makePlan({
      'executive-summary': { sections: { a: 1 } }, 'conceptual-framework': { sections: { a: 1 } },
      'design-content': { sections: { a: 1 } }, 'technical-arch': { sections: { a: 1 } },
      'dev-roadmap': { sections: { a: 1 } }, 'marketing': { sections: { a: 1 } },
      'post-launch': { sections: { a: 1 } }, 'legal-ethical': { sections: { a: 1 } },
    });
    expect(getPlanCompletionPercentage(plan)).toBe(100);
  });
});

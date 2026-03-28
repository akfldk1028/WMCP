import { PLAN_STAGES, type PlanStage, type ServicePlanData } from './types';

export interface PlanValidationResult {
  valid: boolean;
  missingStages: PlanStage[];
  emptyStages: PlanStage[];
}

export function validatePlan(plan: ServicePlanData): PlanValidationResult {
  const missingStages: PlanStage[] = [];
  const emptyStages: PlanStage[] = [];
  for (const stage of PLAN_STAGES) {
    const data = plan.stages[stage];
    if (!data) { missingStages.push(stage); }
    else if (Object.keys(data.sections).length === 0) { emptyStages.push(stage); }
  }
  return { valid: missingStages.length === 0 && emptyStages.length === 0, missingStages, emptyStages };
}

export function getPlanCompletionPercentage(plan: ServicePlanData): number {
  let filled = 0;
  for (const stage of PLAN_STAGES) {
    const data = plan.stages[stage];
    if (data && Object.keys(data.sections).length > 0) filled++;
  }
  return (filled / PLAN_STAGES.length) * 100;
}

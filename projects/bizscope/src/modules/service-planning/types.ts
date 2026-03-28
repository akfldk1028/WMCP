export const PLAN_STAGES = [
  'executive-summary', 'conceptual-framework', 'design-content', 'technical-arch',
  'dev-roadmap', 'marketing', 'post-launch', 'legal-ethical',
] as const;

export type PlanStage = (typeof PLAN_STAGES)[number];

export interface StageData {
  sections: Record<string, unknown>;
  notes?: string;
  aiGenerated?: boolean;
}

export interface ServicePlanData {
  id: string;
  title: string;
  stages: Partial<Record<PlanStage, StageData>>;
  status: 'draft' | 'complete';
  createdAt: number;
  updatedAt: number;
}

export interface PlanStageMeta {
  stage: PlanStage;
  label: string;
  labelKo: string;
  description: string;
  subsections: string[];
}

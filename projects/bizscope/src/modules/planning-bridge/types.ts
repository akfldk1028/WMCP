import type { BmcBlock, BmcData } from '@/modules/bmc/types';
import type { PlanStage, ServicePlanData } from '@/modules/service-planning/types';

/** Combined planning data (BMC + service planning) */
export interface PlanningData {
  id: string;
  title: string;
  bmc: BmcData;
  servicePlan: ServicePlanData;
  createdAt: number;
  updatedAt: number;
}

/** Mapping rule: planning data → analysis section */
export interface MappingRule {
  source: { module: 'bmc'; block: BmcBlock } | { module: 'service-planning'; stage: PlanStage };
  targetSection: string;
  targetField: string;
  transform?: (data: unknown) => unknown;
}

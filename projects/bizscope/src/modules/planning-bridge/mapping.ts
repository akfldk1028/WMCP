import type { BmcData } from '@/modules/bmc/types';
import type { ServicePlanData } from '@/modules/service-planning/types';
import type { MappingRule } from './types';

/** Mapping rules: BMC blocks + planning stages → analysis sections */
export const MAPPING_RULES: MappingRule[] = [
  // BMC → Analysis
  { source: { module: 'bmc', block: 'customer-segments' }, targetSection: 'idea-target-customer', targetField: 'customerSegments' },
  { source: { module: 'bmc', block: 'value-proposition' }, targetSection: 'idea-overview', targetField: 'valueProposition' },
  { source: { module: 'bmc', block: 'channels' }, targetSection: 'go-to-market', targetField: 'channels' },
  { source: { module: 'bmc', block: 'customer-relationships' }, targetSection: 'idea-target-customer', targetField: 'customerRelationship' },
  { source: { module: 'bmc', block: 'revenue-streams' }, targetSection: 'business-model', targetField: 'revenueModel' },
  { source: { module: 'bmc', block: 'key-resources' }, targetSection: 'idea-overview', targetField: 'keyResources' },
  { source: { module: 'bmc', block: 'key-activities' }, targetSection: 'idea-overview', targetField: 'keyActivities' },
  { source: { module: 'bmc', block: 'key-partners' }, targetSection: 'business-model', targetField: 'keyPartners' },
  { source: { module: 'bmc', block: 'cost-structure' }, targetSection: 'unit-economics', targetField: 'costStructure' },
  // Service Planning → Analysis
  { source: { module: 'service-planning', stage: 'executive-summary' }, targetSection: 'idea-overview', targetField: 'executiveSummary' },
  { source: { module: 'service-planning', stage: 'conceptual-framework' }, targetSection: 'idea-target-customer', targetField: 'conceptualFramework' },
  { source: { module: 'service-planning', stage: 'design-content' }, targetSection: 'differentiation', targetField: 'designStrategy' },
  { source: { module: 'service-planning', stage: 'technical-arch' }, targetSection: 'idea-overview', targetField: 'techArchitecture' },
  { source: { module: 'service-planning', stage: 'dev-roadmap' }, targetSection: 'action-plan', targetField: 'devRoadmap' },
  { source: { module: 'service-planning', stage: 'marketing' }, targetSection: 'go-to-market', targetField: 'marketing' },
  { source: { module: 'service-planning', stage: 'post-launch' }, targetSection: 'growth-strategy', targetField: 'postLaunch' },
  { source: { module: 'service-planning', stage: 'legal-ethical' }, targetSection: 'risk-assessment', targetField: 'legalEthical' },
];

/** Map planning data (BMC + service plan) to analysis section contexts */
export function mapPlanningToAnalysis(
  bmc: BmcData,
  plan: ServicePlanData,
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {};

  for (const rule of MAPPING_RULES) {
    let sourceData: unknown = undefined;

    if (rule.source.module === 'bmc') {
      const blockData = bmc.blocks[rule.source.block];
      if (blockData && blockData.entries.length > 0) {
        sourceData = blockData.entries;
      }
    } else {
      const stageData = plan.stages[rule.source.stage];
      if (stageData && Object.keys(stageData.sections).length > 0) {
        sourceData = stageData.sections;
      }
    }

    if (sourceData !== undefined) {
      if (!result[rule.targetSection]) {
        result[rule.targetSection] = {};
      }
      result[rule.targetSection][rule.targetField] = rule.transform
        ? rule.transform(sourceData)
        : sourceData;
    }
  }

  return result;
}

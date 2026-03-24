/**
 * Shared pipeline mappings — single source of truth for GENERATORS,
 * CONTEXT_KEYS, DEPENDENCY_MAP, and dependency checking.
 *
 * Used by: pipeline.ts, hooks/useGeneration.ts
 */

import {
  type SectionType,
  type SectionData,
  type PipelineContext,
} from './types';
import { getMessages } from '@/i18n';
import type { Locale } from '@/i18n';

// Company sections
import { generate as generateCompanyOverview } from './company-overview';
import { generate as generateBusinessModelDetail } from './business-model-detail';
import { generate as generateKPIPerformance } from './kpi-performance';
import { generate as generateFinancialAnalysis } from './financial-analysis';
import { generate as generatePEST } from './pest';
import { generate as generateFiveForceDetail } from './five-forces-detail';
import { generate as generatePESTForcesMatrix } from './pest-forces-matrix';
import { generate as generateKeyEnvVariables } from './key-env-variables';
import { generate as generateInternalCapability } from './internal-capability';
import { generate as generateSWOT } from './swot';
import { generate as generateTOWS } from './tows';
import { generate as generateStrategyCombination } from './strategy-combination';
import { generate as generateSevenS } from './seven-s';
import { generate as generatePriorityMatrix } from './priority-matrix';
import { generate as generateStrategyCurrent } from './strategy-current';
import { generate as generateCompetitor } from './competitor';
import { generate as generateReferenceCase } from './reference-case';
import { generate as generateImplications } from './implications';
// Idea sections (modular: idea/{chapter}/{section})
import {
  generateIdeaOverview, generateIdeaTargetCustomer,
  generateMarketSize, generateMarketEnvironment,
  generateCompetitorScan, generateCompetitorPositioning,
  generateDifferentiation, generateBusinessModel, generateUnitEconomics,
  generateGoToMarket, generateGrowthStrategy,
  generateFinancialProjection, generateRiskAssessment,
  generateIdeaReferenceCase, generateActionPlan,
} from './idea';

export type GenerateFn = (ctx: PipelineContext) => Promise<SectionData>;

export const GENERATORS: Record<SectionType, GenerateFn> = {
  // Company — CH01
  'company-overview': generateCompanyOverview,
  'business-model-detail': generateBusinessModelDetail,
  'kpi-performance': generateKPIPerformance,
  'financial-analysis': generateFinancialAnalysis,
  // Company — CH02
  'pest-analysis': generatePEST,
  'five-forces-detail': generateFiveForceDetail,
  'pest-forces-matrix': generatePESTForcesMatrix,
  'key-env-variables': generateKeyEnvVariables,
  'internal-capability': generateInternalCapability,
  // Company — CH03
  'swot-summary': generateSWOT,
  'tows-cross-matrix': generateTOWS,
  'strategy-combination': generateStrategyCombination,
  'seven-s-alignment': generateSevenS,
  'priority-matrix': generatePriorityMatrix,
  // Company — CH04
  'strategy-current-comparison': generateStrategyCurrent,
  'competitor-comparison': generateCompetitor,
  'reference-case': generateReferenceCase,
  'final-implications': generateImplications,
  // Idea
  'idea-overview': generateIdeaOverview,
  'idea-target-customer': generateIdeaTargetCustomer,
  'market-size': generateMarketSize,
  'market-environment': generateMarketEnvironment,
  'competitor-scan': generateCompetitorScan,
  'competitor-positioning': generateCompetitorPositioning,
  'differentiation': generateDifferentiation,
  'business-model': generateBusinessModel,
  'unit-economics': generateUnitEconomics,
  'go-to-market': generateGoToMarket,
  'growth-strategy': generateGrowthStrategy,
  'financial-projection': generateFinancialProjection,
  'risk-assessment': generateRiskAssessment,
  'idea-reference-case': generateIdeaReferenceCase,
  'action-plan': generateActionPlan,
};

export const CONTEXT_KEYS: Record<SectionType, keyof PipelineContext> = {
  // Company — CH01
  'company-overview': 'companyOverview',
  'business-model-detail': 'businessModelDetail',
  'kpi-performance': 'kpiPerformance',
  'financial-analysis': 'financialAnalysis',
  // Company — CH02
  'pest-analysis': 'pest',
  'five-forces-detail': 'fiveForceDetail',
  'pest-forces-matrix': 'pestForcesMatrix',
  'key-env-variables': 'keyEnvVariables',
  'internal-capability': 'internalCapability',
  // Company — CH03
  'swot-summary': 'swot',
  'tows-cross-matrix': 'towsCrossMatrix',
  'strategy-combination': 'strategyCombination',
  'seven-s-alignment': 'sevenS',
  'priority-matrix': 'priorityMatrix',
  // Company — CH04
  'strategy-current-comparison': 'strategyCurrentComparison',
  'competitor-comparison': 'competitor',
  'reference-case': 'referenceCase',
  'final-implications': 'implications',
  // Idea
  'idea-overview': 'ideaOverview',
  'idea-target-customer': 'ideaTargetCustomer',
  'market-size': 'marketSize',
  'market-environment': 'marketEnvironment',
  'competitor-scan': 'competitorScan',
  'competitor-positioning': 'competitorPositioning',
  'differentiation': 'differentiation',
  'business-model': 'businessModel',
  'unit-economics': 'unitEconomics',
  'go-to-market': 'goToMarket',
  'growth-strategy': 'growthStrategy',
  'financial-projection': 'financialProjection',
  'risk-assessment': 'riskAssessment',
  'idea-reference-case': 'ideaReferenceCase',
  'action-plan': 'actionPlan',
};

/**
 * Dependency graph — matches the plan's execution levels.
 *
 * Level 0: company-overview (no deps)
 * Level 1: business-model-detail, kpi-performance, financial-analysis,
 *          pest-analysis, internal-capability, competitor-comparison (← company-overview)
 * Level 2: five-forces-detail (← pest), key-env-variables (← pest)
 * Level 3: pest-forces-matrix (← pest, five-forces-detail),
 *          swot-summary (← key-env-variables, internal-capability)
 * Level 4: tows-cross-matrix (← swot), strategy-combination (← swot, tows)
 * Level 5: seven-s-alignment (← strategy-combination)
 * Level 6: priority-matrix (← strategy-combination, seven-s)
 * Level 7: strategy-current-comparison (← priority-matrix, seven-s),
 *          reference-case (← strategy-combination)
 * Level 8: final-implications (← priority-matrix, strategy-current, competitor, reference-case)
 */
export const DEPENDENCY_MAP: Partial<Record<SectionType, SectionType[]>> = {
  // Company
  'business-model-detail': ['company-overview'],
  'kpi-performance': ['company-overview'],
  'financial-analysis': ['company-overview'],
  'pest-analysis': ['company-overview'],
  'internal-capability': ['company-overview'],
  'competitor-comparison': ['company-overview'],
  'five-forces-detail': ['pest-analysis'],
  'key-env-variables': ['pest-analysis'],
  'pest-forces-matrix': ['pest-analysis', 'five-forces-detail'],
  'swot-summary': ['key-env-variables', 'internal-capability'],
  'tows-cross-matrix': ['swot-summary'],
  'strategy-combination': ['swot-summary', 'tows-cross-matrix'],
  'seven-s-alignment': ['strategy-combination'],
  'priority-matrix': ['strategy-combination', 'seven-s-alignment'],
  'strategy-current-comparison': ['priority-matrix', 'seven-s-alignment'],
  'reference-case': ['strategy-combination'],
  'final-implications': ['priority-matrix', 'strategy-current-comparison', 'competitor-comparison', 'reference-case'],
  // Idea
  'idea-target-customer': ['idea-overview'],
  'market-size': ['idea-overview'],
  'market-environment': ['market-size'],
  'competitor-positioning': ['competitor-scan'],
  'differentiation': ['competitor-scan'],
  'business-model': ['idea-overview', 'market-size'],
  'unit-economics': ['business-model'],
  'go-to-market': ['business-model'],
  'growth-strategy': ['go-to-market'],
  'financial-projection': ['unit-economics'],
  'risk-assessment': ['competitor-scan', 'business-model'],
  'idea-reference-case': ['growth-strategy'],
  'action-plan': ['business-model', 'risk-assessment'],
};

/**
 * Build idea context lines for prompts — handles both simple and document modes.
 * NOTE: Korean labels are intentional here — they are part of the LLM prompt context,
 * not user-facing UI. All prompts.ts files use Korean instructions for best AI output quality.
 * Future: accept locale param to support English-language report generation.
 */
export function buildIdeaLines(idea: { name: string; description: string; document?: string; targetMarket?: string }): string[] {
  const lines = [`아이디어: ${idea.name}`];
  if (idea.document) {
    lines.push('', '=== 기획서 (요약) ===', idea.document.slice(0, 8000), '===');
  } else {
    lines.push(`설명: ${idea.description}`);
  }
  if (idea.targetMarket) {
    lines.push(`타겟 시장: ${idea.targetMarket}`);
  }
  return lines;
}

/** Check if all required upstream deps are present in context. */
export function checkDependencies(
  sectionType: SectionType,
  ctx: PipelineContext,
  locale?: Locale | string | null,
): string | null {
  const deps = DEPENDENCY_MAP[sectionType];
  if (!deps) return null;

  const missing = deps.filter((dep) => {
    const key = CONTEXT_KEYS[dep];
    return ctx[key] == null;
  });

  if (missing.length === 0) return null;

  const msgs = getMessages(locale);
  const titles = msgs.sections.titles;
  const labels = missing.map((d) => titles[d] ?? d).join(', ');
  return msgs.ui.pipeline.dependencyError(labels);
}

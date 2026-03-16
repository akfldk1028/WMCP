/**
 * Shared pipeline mappings — single source of truth for GENERATORS,
 * CONTEXT_KEYS, DEPENDENCY_MAP, and dependency checking.
 *
 * Used by: pipeline.ts, mcp/pipeline-runner.ts, hooks/useGeneration.ts
 */

import {
  SECTION_TITLES,
  type SectionType,
  type SectionData,
  type PipelineContext,
} from './types';

import { generate as generateCompanyOverview } from './company-overview';
import { generate as generatePEST } from './pest';
import { generate as generateMatrix } from './matrix';
import { generate as generateInternalCapability } from './internal-capability';
import { generate as generateSWOT } from './swot';
import { generate as generateTOWS } from './tows';
import { generate as generateStrategyCombination } from './strategy-combination';
import { generate as generateSevenS } from './seven-s';
import { generate as generatePriorityMatrix } from './priority-matrix';
import { generate as generateStrategyCurrent } from './strategy-current';
import { generate as generateCompetitor } from './competitor';
import { generate as generateImplications } from './implications';

export type GenerateFn = (ctx: PipelineContext) => Promise<SectionData>;

export const GENERATORS: Record<SectionType, GenerateFn> = {
  'company-overview': generateCompanyOverview,
  'pest-analysis': generatePEST,
  'possibility-impact-matrix': generateMatrix,
  'internal-capability': generateInternalCapability,
  'swot-summary': generateSWOT,
  'tows-cross-matrix': generateTOWS,
  'strategy-combination': generateStrategyCombination,
  'seven-s-alignment': generateSevenS,
  'priority-matrix': generatePriorityMatrix,
  'strategy-current-comparison': generateStrategyCurrent,
  'competitor-comparison': generateCompetitor,
  'final-implications': generateImplications,
};

export const CONTEXT_KEYS: Record<SectionType, keyof PipelineContext> = {
  'company-overview': 'companyOverview',
  'pest-analysis': 'pest',
  'possibility-impact-matrix': 'matrix',
  'internal-capability': 'internalCapability',
  'swot-summary': 'swot',
  'tows-cross-matrix': 'towsCrossMatrix',
  'strategy-combination': 'strategyCombination',
  'seven-s-alignment': 'sevenS',
  'priority-matrix': 'priorityMatrix',
  'strategy-current-comparison': 'strategyCurrentComparison',
  'competitor-comparison': 'competitor',
  'final-implications': 'implications',
};

export const DEPENDENCY_MAP: Partial<Record<SectionType, SectionType[]>> = {
  'possibility-impact-matrix': ['pest-analysis'],
  'swot-summary': ['pest-analysis', 'internal-capability'],
  'tows-cross-matrix': ['swot-summary'],
  'strategy-combination': ['swot-summary'],
  'seven-s-alignment': ['strategy-combination'],
  'priority-matrix': ['strategy-combination', 'seven-s-alignment'],
  'strategy-current-comparison': ['priority-matrix', 'seven-s-alignment'],
};

/** Check if all required upstream deps are present in context. */
export function checkDependencies(
  sectionType: SectionType,
  ctx: PipelineContext,
): string | null {
  const deps = DEPENDENCY_MAP[sectionType];
  if (!deps) return null;

  const missing = deps.filter((dep) => {
    const key = CONTEXT_KEYS[dep];
    return ctx[key] == null;
  });

  if (missing.length === 0) return null;

  const labels = missing.map((d) => SECTION_TITLES[d]).join(', ');
  return `${labels}이(가) 필요하지만 실패했습니다. 이 섹션을 건너뜁니다.`;
}

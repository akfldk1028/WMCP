/**
 * Section type definitions — extracted to avoid circular deps between
 * frameworks/types.ts and i18n/.
 *
 * Import from here when you need SectionType without pulling in all of types.ts.
 */

export type CompanySectionType =
  | 'company-overview'
  | 'business-model-detail'
  | 'kpi-performance'
  | 'financial-analysis'
  | 'pest-analysis'
  | 'five-forces-detail'
  | 'pest-forces-matrix'
  | 'key-env-variables'
  | 'internal-capability'
  | 'swot-summary'
  | 'tows-cross-matrix'
  | 'strategy-combination'
  | 'seven-s-alignment'
  | 'priority-matrix'
  | 'strategy-current-comparison'
  | 'competitor-comparison'
  | 'reference-case'
  | 'final-implications';

export type IdeaSectionType =
  | 'idea-overview'
  | 'idea-target-customer'
  | 'market-size'
  | 'market-environment'
  | 'competitor-scan'
  | 'competitor-positioning'
  | 'differentiation'
  | 'business-model'
  | 'unit-economics'
  | 'go-to-market'
  | 'growth-strategy'
  | 'financial-projection'
  | 'risk-assessment'
  | 'idea-reference-case'
  | 'action-plan';

export type SectionType = CompanySectionType | IdeaSectionType;

export type ReportMode = 'company' | 'idea';

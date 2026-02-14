export type {
  RiskLevel,
  AnalyzedClause,
  ClauseCategory,
  DarkPatternType,
  DarkPatternMatch,
  SiteGrade,
  SiteAnalysis,
  SiteGuardConfig,
} from './types.js';

export { analyzeToS, calculateGrade, extractToSLinks } from './tos-analyzer.js';
export {
  detectDarkPatterns,
  detectPreselectedCheckboxes,
  detectCookieBannerMisdirection,
} from './dark-pattern-detector.js';

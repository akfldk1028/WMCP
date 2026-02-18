// Review signals
export {
  detectDateClustering,
  detectRatingAnomaly,
  detectPhraseRepetition,
  detectLengthUniformity,
  detectIncentiveKeywords,
  detectRatingSurge,
  detectAIGeneration,
  analyzeReviewSignals,
} from './review-signals.js';

// Price signals
export { extractFeeMatches, extractTrapMatches } from './price-signals.js';

// Dark pattern signals
export { extractDarkPatternEvidence } from './darkpattern-signals.js';

// AI signals (re-export)
export {
  measureBurstiness,
  measureTTR,
  measureExclamationDensity,
  detectAIGenerated,
  detectAIGeneratedBatch,
} from './ai-signals.js';

// Patterns (re-export)
export { findIncentiveKeywords } from './patterns.js';

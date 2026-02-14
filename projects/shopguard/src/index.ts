// Core
export * from './core/index.js';

// Review analysis
export { analyzeReviews, detectAIGenerated } from './review/index.js';

// Price analysis
export { analyzePrices, detectHiddenFees, comparePrices } from './price/index.js';

// Dark pattern detection
export { analyzeDarkPatterns, detectDarkPatterns } from './darkpattern/index.js';

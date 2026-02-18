// Core
export * from './core/index.js';

// Review analysis (legacy, kept for Chrome extension compatibility)
export { analyzeReviews, detectAIGenerated } from './review/index.js';

// Price analysis (legacy, kept for Chrome extension compatibility)
export { analyzePrices, detectHiddenFees, comparePrices } from './price/index.js';

// Dark pattern detection (legacy, kept for Chrome extension compatibility)
export { analyzeDarkPatterns, detectDarkPatterns } from './darkpattern/index.js';

// Signals (new agent-based architecture)
export * from './signals/index.js';

// Extractors (new agent-based architecture)
export * from './extractors/index.js';

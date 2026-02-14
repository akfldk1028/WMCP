export type {
  PriceComponent,
  PriceIssueType,
  PriceIssue,
  PriceSnapshot,
  PriceAnalysis,
  PriceShieldConfig,
} from './types.js';

export {
  detectHiddenFees,
  detectDripPricing,
  detectSubscriptionTraps,
  extractPrices,
  calculateTrustScore,
} from './price-detector.js';

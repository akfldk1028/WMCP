/**
 * Types for the Price Shield consumer protection agent.
 */

/**
 * A detected price component on a page.
 */
export interface PriceComponent {
  /** Display label (e.g., "Service Fee", "Subtotal") */
  label: string;
  /** Amount in cents to avoid floating point issues */
  amountCents: number;
  /** Currency code */
  currency: string;
  /** Whether this was clearly visible from the start */
  wasVisible: boolean;
  /** Whether this was added late in checkout */
  addedAtCheckout: boolean;
}

/**
 * Types of pricing manipulation detected.
 */
export type PriceIssueType =
  | 'hidden-fee'          // Fee not shown until checkout
  | 'drip-pricing'        // Price increases through funnel
  | 'dynamic-pricing'     // Price changes based on user behavior/device
  | 'bait-and-switch'     // Advertised price differs from actual
  | 'decoy-pricing'       // Middle option designed to push you to expensive
  | 'surge-pricing'       // Demand-based price inflation
  | 'subscription-trap'   // Low intro price, high renewal
  | 'currency-trick';     // Misleading currency display

/**
 * A detected pricing issue.
 */
export interface PriceIssue {
  type: PriceIssueType;
  /** Severity 0-100 */
  severity: number;
  /** Human-readable description */
  description: string;
  /** Evidence (price values, selectors, etc.) */
  evidence: string;
  /** Estimated extra cost to the consumer */
  estimatedExtraCostCents: number;
}

/**
 * Price snapshot for tracking changes over time.
 */
export interface PriceSnapshot {
  url: string;
  productName: string;
  priceCents: number;
  currency: string;
  capturedAt: string;
  /** Browser/device info for dynamic pricing detection */
  userAgent: string;
}

/**
 * Analysis result for a shopping page.
 */
export interface PriceAnalysis {
  url: string;
  analyzedAt: string;
  /** Base advertised price */
  advertisedPriceCents: number;
  /** Actual total including all fees */
  actualTotalCents: number;
  /** Breakdown of all price components */
  components: PriceComponent[];
  /** Detected pricing issues */
  issues: PriceIssue[];
  /** Price difference percentage */
  markupPercent: number;
  /** Overall trust score 0-100 */
  trustScore: number;
  /** Whether WebMCP price tools were available */
  hasWebMCPPricing: boolean;
}

/**
 * Configuration for Price Shield.
 */
export interface PriceShieldConfig {
  /** Auto-analyze shopping pages */
  autoAnalyze: boolean;
  /** Track price history */
  trackHistory: boolean;
  /** Alert threshold for hidden fees (percentage) */
  feeAlertThreshold: number;
  /** Compare prices across sites */
  crossSiteCompare: boolean;
}

/**
 * Shared types for Price Shield.
 */

export type PriceIssueType =
  | 'hidden-fee'
  | 'drip-pricing'
  | 'dynamic-pricing'
  | 'bait-and-switch'
  | 'decoy-pricing'
  | 'surge-pricing'
  | 'subscription-trap'
  | 'currency-trick';

export interface PriceIssue {
  type: PriceIssueType;
  severity: number;
  description: string;
  evidence: string;
  estimatedExtraCostCents: number;
}

export interface PriceComponent {
  label: string;
  amountCents: number;
  currency: string;
  wasVisible: boolean;
  addedAtCheckout: boolean;
}

export interface PriceSnapshot {
  id: string;
  url: string;
  productName: string;
  priceCents: number;
  currency: string;
  capturedAt: string;
  userAgent?: string;
}

export type TrendDirection = 'rising' | 'falling' | 'stable';

export interface PriceTrend {
  direction: TrendDirection;
  changePercent: number;
  periodDays: number;
  snapshots: PriceSnapshot[];
}

export interface CrossSiteComparison {
  productName: string;
  cheapest: { url: string; priceCents: number; currency: string };
  mostExpensive: { url: string; priceCents: number; currency: string };
  spreadPercent: number;
  sources: Array<{ url: string; priceCents: number; currency: string }>;
}

export interface AnalysisReport {
  url: string;
  analyzedAt: string;
  prices: PriceComponent[];
  issues: PriceIssue[];
  trustScore: number;
  grade: string;
  summary: string;
}

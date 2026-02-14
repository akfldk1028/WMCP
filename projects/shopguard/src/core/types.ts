// ── Risk & Grade ──

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe';
export type TrustGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type Locale = 'ko' | 'en';

// ── Review Types ──

/** A single product review to analyze */
export interface Review {
  text: string;
  rating: number; // 1-5
  date: string; // ISO 8601 date string
  author?: string;
  verified?: boolean;
}

/** Flag raised on a specific review */
export interface ReviewFlag {
  reviewIndex: number;
  flags: string[];
  suspicionScore: number; // 0-100
}

/** Scores for each review heuristic (0 = clean, 100 = highly suspicious) */
export interface HeuristicScores {
  dateCluster: number;
  ratingDistribution: number;
  phraseRepetition: number;
  lengthUniformity: number;
  incentiveKeyword: number;
  ratingSurge: number;
}

/** Full review analysis result */
export interface ReviewAnalysis {
  totalReviews: number;
  suspiciousCount: number;
  suspicionRate: number; // 0-1
  heuristics: HeuristicScores;
  aiScore: number; // 0-100 (how likely AI-generated)
  overallScore: number; // 0-100 (trust, higher = better)
  grade: TrustGrade;
  flags: ReviewFlag[];
  details: string[];
}

// ── AI Detection Types ──

export interface AIDetectionResult {
  score: number; // 0-100 (likelihood of AI generation)
  burstiness: number; // sentence length variance (low = AI)
  ttr: number; // Type-Token Ratio (vocabulary diversity)
  exclamationDensity: number; // exclamation rate
  details: string[];
}

// ── Dark Pattern Types ──

export type DarkPatternType =
  | 'fake-urgency'
  | 'fake-social-proof'
  | 'misdirection'
  | 'hidden-costs'
  | 'forced-continuity'
  | 'confirm-shaming'
  | 'obstruction'
  | 'preselection'
  | 'privacy-zuckering';

export interface DarkPatternMatch {
  type: DarkPatternType;
  evidence: string;
  risk: RiskLevel;
  explanation: string;
}

export interface DarkPatternResult {
  patterns: DarkPatternMatch[];
  riskScore: number; // 0-100
  grade: TrustGrade;
}

// ── Price Types ──

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
  severity: number; // 0-100
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

export interface PriceAnalysis {
  components: PriceComponent[];
  issues: PriceIssue[];
  trustScore: number; // 0-100
  grade: TrustGrade;
  totalHiddenFeeCents: number;
}

// ── Combined Trust Score ──

export interface TrustScore {
  overall: number; // 0-100
  grade: TrustGrade;
  reviewScore: number;
  priceScore: number;
  darkPatternScore: number;
  summary: string;
}

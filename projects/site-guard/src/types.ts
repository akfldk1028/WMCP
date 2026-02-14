/**
 * Risk levels for ToS clauses and dark patterns.
 */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe';

/**
 * A single clause analyzed from Terms of Service.
 */
export interface AnalyzedClause {
  /** Original text of the clause */
  text: string;
  /** Risk level */
  risk: RiskLevel;
  /** Human-readable summary of why this is risky */
  summary: string;
  /** Category of risk */
  category: ClauseCategory;
  /** Applicable regulations that this may violate */
  regulations: string[];
}

export type ClauseCategory =
  | 'data-selling'        // Site can sell your data to third parties
  | 'arbitration'         // Forced arbitration, no class action
  | 'auto-renewal'        // Auto-renewal with unclear cancellation
  | 'content-rights'      // Site claims rights over your content
  | 'liability-waiver'    // Site avoids all liability
  | 'unilateral-change'   // Site can change terms without notice
  | 'data-retention'      // Indefinite data retention
  | 'third-party-sharing' // Broad third-party data sharing
  | 'jurisdiction'        // Unfavorable jurisdiction clause
  | 'other';

/**
 * Dark pattern types detected on a page.
 */
export type DarkPatternType =
  | 'fake-urgency'         // "Only 3 left!" "Sale ends in 2:00"
  | 'fake-social-proof'    // "47 people are viewing this"
  | 'misdirection'         // Highlighted "Accept All" vs tiny "Manage"
  | 'hidden-costs'         // Fees revealed only at checkout
  | 'forced-continuity'    // Free trial → auto-charge
  | 'confirm-shaming'      // "No thanks, I don't want to save money"
  | 'obstruction'          // Making cancellation unnecessarily hard
  | 'preselection'         // Pre-checked opt-in boxes
  | 'privacy-zuckering';   // Confusing privacy settings

/**
 * A detected dark pattern instance.
 */
export interface DarkPatternMatch {
  type: DarkPatternType;
  /** The DOM selector or text that triggered the match */
  evidence: string;
  /** Severity */
  risk: RiskLevel;
  /** Human-readable explanation */
  explanation: string;
}

/**
 * Overall site safety grade.
 */
export type SiteGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * Complete analysis result for a website.
 */
export interface SiteAnalysis {
  url: string;
  analyzedAt: string;
  /** Overall safety grade A-F */
  grade: SiteGrade;
  /** Number of critical/high issues found */
  criticalCount: number;
  /** ToS clause analysis */
  clauses: AnalyzedClause[];
  /** Dark patterns detected on page */
  darkPatterns: DarkPatternMatch[];
  /** Privacy policy risk summary */
  privacySummary: string;
  /** Whether site has WebMCP tools for structured ToS access */
  hasWebMCPTools: boolean;
}

/**
 * Configuration for the analyzer.
 */
export interface SiteGuardConfig {
  /** Whether to auto-analyze pages with ToS links */
  autoAnalyze: boolean;
  /** Whether to scan for dark patterns */
  detectDarkPatterns: boolean;
  /** Risk threshold for notifications */
  notifyThreshold: RiskLevel;
  /** API endpoint for AI analysis (if using remote) */
  apiEndpoint?: string;
  /** API key for premium features */
  apiKey?: string;
}

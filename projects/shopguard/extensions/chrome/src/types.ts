/** Types for ShopGuard Chrome Extension — Agent-first architecture */

export interface AnalysisResult {
  review: {
    totalReviews: number;
    suspiciousCount: number;
    overallScore: number;
    grade: string;
    details: string[];
  };
  price: {
    trustScore: number;
    grade: string;
    issues: Array<{
      type: string;
      severity: number;
      description: string;
    }>;
    totalHiddenFeeCents: number;
  };
  darkPattern: {
    riskScore: number;
    grade: string;
    patterns: Array<{
      type: string;
      risk: string;
      explanation: string;
    }>;
  };
  overall: {
    score: number;
    grade: string;
    summary: string;
  };
  timestamp: number;
}

// ── Agent Extraction (LLM response) ──

export type PageType =
  | 'product'
  | 'ad'
  | 'sponsored-content'
  | 'live-commerce'
  | 'non-commercial';

export type PatternSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AgentReview {
  text: string;
  rating: number; // 1-5
  date: string;
}

export interface AgentPriceInfo {
  displayPrice: string | null;
  originalPrice: string | null;
  currency: string;
  hiddenFees: string[];
}

export interface AgentSuspiciousPattern {
  type: string;
  evidence: string;
  severity: PatternSeverity;
}

export interface AgentExtraction {
  pageType: PageType;
  confidence: number; // 0-1
  productName: string | null;
  platform: string;
  reviews: AgentReview[];
  priceInfo: AgentPriceInfo;
  suspiciousPatterns: AgentSuspiciousPattern[];
  agentNotes: string;
}

// ── Page Snapshot (content script → agent) ──

export interface PageSnapshot {
  url: string;
  title: string;
  meta?: {
    description?: string;
    ogType?: string;
    ogSiteName?: string;
  };
  visibleText?: string;
  priceContexts?: string[];
  reviewBlocks?: string[];
  interactiveElements?: string[];
  rawHtml?: string;
  rawPageText?: string;
}

// ── Pipeline Result ──

export type AgentErrorCode = 'auth' | 'rate_limit' | 'overloaded' | 'network' | 'unknown';

export type PipelineResult =
  | {
      success: true;
      pageType: PageType;
      analysis: AnalysisResult | null; // null for non-commercial
      agentNotes: string;
      suspiciousPatterns: AgentSuspiciousPattern[];
    }
  | {
      success: false;
      error: string;
      errorCode: AgentErrorCode;
    };

// ── Message Protocol ──

export interface CapturePageMessage {
  type: 'CAPTURE_PAGE';
}

export interface PageSnapshotMessage {
  type: 'PAGE_SNAPSHOT';
  data: PageSnapshot;
}

export interface TriggerAnalysisMessage {
  type: 'TRIGGER_ANALYSIS';
}

export interface AnalysisStartedMessage {
  type: 'ANALYSIS_STARTED';
}

export interface AnalysisResultMessage {
  type: 'ANALYSIS_RESULT';
  data: AnalysisResult;
  agentNotes?: string;
  suspiciousPatterns?: AgentSuspiciousPattern[];
}

export interface AnalysisErrorMessage {
  type: 'ANALYSIS_ERROR';
  error: string;
  errorCode: AgentErrorCode;
}

export interface GetStatusMessage {
  type: 'GET_STATUS';
  tabId?: number;
}

export interface StatusResponseMessage {
  type: 'STATUS_RESPONSE';
  data: {
    hasApiKey: boolean;
    analyzing: boolean;
    pageType: PageType | null;
    lastAnalysis: AnalysisResult | null;
    agentNotes?: string;
    suspiciousPatterns?: AgentSuspiciousPattern[];
    error?: string;
    errorCode?: AgentErrorCode;
  };
}

export interface ValidateLicenseMessage {
  type: 'VALIDATE_LICENSE';
  licenseKey: string;
}

export type Message =
  | CapturePageMessage
  | PageSnapshotMessage
  | TriggerAnalysisMessage
  | AnalysisStartedMessage
  | AnalysisResultMessage
  | AnalysisErrorMessage
  | GetStatusMessage
  | StatusResponseMessage
  | ValidateLicenseMessage;

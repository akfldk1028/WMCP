import type { AnalyzedClause, ClauseCategory, RiskLevel, SiteGrade } from './types.js';

/**
 * Patterns that indicate risky ToS clauses.
 * Each pattern maps a regex to a category and risk level.
 */
const CLAUSE_PATTERNS: Array<{
  pattern: RegExp;
  category: ClauseCategory;
  risk: RiskLevel;
  summary: string;
}> = [
  {
    pattern: /(?:sell|share|transfer|disclose)\s+(?:your\s+)?(?:personal\s+)?(?:data|information)\s+(?:to|with)\s+(?:third\s+part|advertis|partner|affiliat)/i,
    category: 'data-selling',
    risk: 'critical',
    summary: 'This service may sell or share your personal data with third parties',
  },
  {
    pattern: /(?:binding\s+)?arbitration|waive\s+(?:your\s+)?(?:right\s+to\s+)?(?:a\s+)?(?:jury\s+trial|class\s+action)/i,
    category: 'arbitration',
    risk: 'high',
    summary: 'You waive your right to a jury trial or class action lawsuit',
  },
  {
    pattern: /(?:automatically|auto)\s*[-\s]?renew|(?:renew|continue)\s+(?:automatically|unless\s+(?:you\s+)?cancel)/i,
    category: 'auto-renewal',
    risk: 'medium',
    summary: 'Subscription auto-renews unless you explicitly cancel',
  },
  {
    pattern: /(?:irrevocable|perpetual|worldwide|royalty[\s-]?free)\s+(?:license|right)\s+(?:to\s+)?(?:use|reproduce|modify|distribute)\s+(?:your\s+)?(?:content|submissions|posts)/i,
    category: 'content-rights',
    risk: 'high',
    summary: 'The service claims broad rights over content you create or upload',
  },
  {
    pattern: /(?:not\s+(?:be\s+)?(?:liable|responsible)|(?:disclaim|exclude)\s+(?:all\s+)?(?:liability|warranties)|(?:as[\s-]?is|without\s+warranty))/i,
    category: 'liability-waiver',
    risk: 'medium',
    summary: 'The service disclaims liability for damages or service issues',
  },
  {
    pattern: /(?:modify|change|update|revise)\s+(?:these\s+)?(?:terms|conditions|agreement)\s+(?:at\s+any\s+time|without\s+(?:prior\s+)?notice)/i,
    category: 'unilateral-change',
    risk: 'high',
    summary: 'Terms can be changed at any time without notifying you',
  },
  {
    pattern: /(?:retain|store|keep)\s+(?:your\s+)?(?:data|information)\s+(?:indefinitely|permanently|after\s+(?:you\s+)?(?:delete|close|terminate))/i,
    category: 'data-retention',
    risk: 'high',
    summary: 'Your data may be retained even after you delete your account',
  },
  {
    pattern: /(?:governed\s+by|subject\s+to)\s+(?:the\s+)?laws\s+of\s+(?:the\s+)?(?:State\s+of\s+(?:Delaware|California)|Cayman\s+Islands|British\s+Virgin)/i,
    category: 'jurisdiction',
    risk: 'medium',
    summary: 'Disputes are governed by laws of a potentially unfavorable jurisdiction',
  },
];

/**
 * Analyze Terms of Service text for risky clauses.
 */
export function analyzeToS(text: string): AnalyzedClause[] {
  const clauses: AnalyzedClause[] = [];
  // Split into sentences/paragraphs for granular analysis
  const segments = text.split(/[.!?]\s+|\n\n+/).filter((s) => s.trim().length > 20);

  for (const segment of segments) {
    for (const rule of CLAUSE_PATTERNS) {
      if (rule.pattern.test(segment)) {
        clauses.push({
          text: segment.trim().slice(0, 500),
          risk: rule.risk,
          summary: rule.summary,
          category: rule.category,
          regulations: getApplicableRegulations(rule.category),
        });
        break; // One match per segment
      }
    }
  }

  return clauses;
}

/**
 * Calculate site grade based on analyzed clauses.
 */
export function calculateGrade(clauses: AnalyzedClause[]): SiteGrade {
  let score = 100;

  for (const clause of clauses) {
    switch (clause.risk) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 8; break;
      case 'low': score -= 3; break;
    }
  }

  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  if (score >= 20) return 'E';
  return 'F';
}

/**
 * Extract ToS text from a page's HTML.
 * Looks for common ToS page indicators.
 */
export function extractToSLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  const tosKeywords = /terms\s*(?:of\s*(?:service|use))?|privacy\s*policy|legal|user\s*agreement|eula|cookie\s*policy/i;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]*>/g, '').trim();

    if (tosKeywords.test(text) || tosKeywords.test(href)) {
      try {
        const absoluteUrl = new URL(href, baseUrl).toString();
        if (!links.includes(absoluteUrl)) {
          links.push(absoluteUrl);
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }

  return links;
}

function getApplicableRegulations(category: ClauseCategory): string[] {
  const regulations: Record<string, string[]> = {
    'data-selling': ['GDPR Art. 6', 'CCPA', 'CPRA'],
    'arbitration': ['FAA', 'EU Consumer Rights Directive'],
    'auto-renewal': ['FTC Restore Online Shoppers Confidence Act', 'CA ARL'],
    'content-rights': ['DMCA', 'EU Copyright Directive'],
    'liability-waiver': ['UCC', 'EU Unfair Terms Directive'],
    'unilateral-change': ['EU Unfair Terms Directive 93/13/EEC'],
    'data-retention': ['GDPR Art. 5(1)(e)', 'CCPA'],
    'third-party-sharing': ['GDPR Art. 6 & 13', 'CCPA'],
    'jurisdiction': ['Brussels Regulation (EU)'],
    'other': [],
  };
  return regulations[category] ?? [];
}

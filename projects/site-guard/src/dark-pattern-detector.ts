import type { DarkPatternMatch, DarkPatternType, RiskLevel } from './types.js';

/**
 * Detection rules for common dark patterns.
 */
const DARK_PATTERN_RULES: Array<{
  type: DarkPatternType;
  patterns: RegExp[];
  risk: RiskLevel;
  explanation: string;
}> = [
  {
    type: 'fake-urgency',
    patterns: [
      /only\s+\d+\s+(?:left|remaining|available)/i,
      /(?:sale|offer|deal)\s+ends?\s+(?:in|soon|today|tonight)/i,
      /(?:hurry|rush|act\s+(?:now|fast)|limited\s+time|don'?t\s+miss)/i,
      /\d{1,2}:\d{2}(?::\d{2})?\s*(?:remaining|left)/i,
    ],
    risk: 'medium',
    explanation: 'Creates artificial urgency to pressure immediate action',
  },
  {
    type: 'fake-social-proof',
    patterns: [
      /\d+\s+(?:people|users|customers|others)\s+(?:are\s+)?(?:viewing|looking|watching|bought)/i,
      /(?:trending|popular|hot|best[\s-]?seller)\s+(?:right\s+)?now/i,
      /(?:just\s+)?(?:purchased|bought|ordered)\s+(?:by\s+)?\w+\s+(?:from|in)\s+\w+/i,
    ],
    risk: 'medium',
    explanation: 'Uses fabricated or misleading social proof to influence decisions',
  },
  {
    type: 'confirm-shaming',
    patterns: [
      /no\s+thanks?,?\s+I\s+(?:don'?t\s+)?(?:want|like|need|prefer)/i,
      /I(?:'?ll)?\s+(?:pass|skip)\s+(?:on\s+)?(?:this|saving|the\s+(?:discount|deal|offer))/i,
      /(?:miss\s+out|stay\s+(?:uninformed|behind))/i,
    ],
    risk: 'high',
    explanation: 'Shames users into accepting by making the decline option negative',
  },
  {
    type: 'misdirection',
    patterns: [
      /accept\s+all/i,  // Detected in context of cookie banners
    ],
    risk: 'medium',
    explanation: 'Uses visual emphasis to direct users toward the less privacy-friendly option',
  },
  {
    type: 'preselection',
    patterns: [
      /checked\s*(?:=\s*["']?(?:true|checked)["']?)?/i,
    ],
    risk: 'medium',
    explanation: 'Pre-selects options that benefit the service, not the user',
  },
  {
    type: 'forced-continuity',
    patterns: [
      /free\s+trial\s+(?:will\s+)?(?:automatically\s+)?(?:convert|become|turn\s+into)/i,
      /(?:after|when)\s+(?:your\s+)?(?:free\s+)?trial\s+(?:ends?|expires?|is\s+over)/i,
      /credit\s+card\s+required\s+(?:for\s+)?(?:free\s+)?trial/i,
    ],
    risk: 'high',
    explanation: 'Free trial automatically converts to paid subscription',
  },
  {
    type: 'obstruction',
    patterns: [
      /(?:call|contact|email)\s+(?:us|support|customer\s+service)\s+to\s+cancel/i,
      /(?:cancellation|cancel)\s+(?:requires?|needs?)\s+(?:phone|call|written|letter)/i,
    ],
    risk: 'critical',
    explanation: 'Makes cancellation intentionally difficult',
  },
  {
    type: 'hidden-costs',
    patterns: [
      /(?:service|processing|handling|convenience|platform)\s+fee/i,
      /(?:additional|extra)\s+(?:charges?|fees?)\s+(?:may\s+)?apply/i,
    ],
    risk: 'high',
    explanation: 'Hidden fees not shown until checkout or buried in fine print',
  },
];

/**
 * Scan page text/HTML for dark patterns.
 */
export function detectDarkPatterns(content: string): DarkPatternMatch[] {
  const matches: DarkPatternMatch[] = [];
  const seen = new Set<DarkPatternType>();

  for (const rule of DARK_PATTERN_RULES) {
    if (seen.has(rule.type)) continue;

    for (const pattern of rule.patterns) {
      const match = pattern.exec(content);
      if (match) {
        seen.add(rule.type);
        matches.push({
          type: rule.type,
          evidence: match[0].slice(0, 200),
          risk: rule.risk,
          explanation: rule.explanation,
        });
        break;
      }
    }
  }

  return matches;
}

/**
 * Scan HTML for pre-checked checkboxes (preselection dark pattern).
 */
export function detectPreselectedCheckboxes(html: string): DarkPatternMatch[] {
  const matches: DarkPatternMatch[] = [];
  const checkboxRegex = /<input\b([^>]*type\s*=\s*["']checkbox["'][^>]*)>/gi;
  let match: RegExpExecArray | null;

  while ((match = checkboxRegex.exec(html)) !== null) {
    const attrs = match[1];
    if (/\bchecked\b/i.test(attrs)) {
      const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/i);
      const fieldName = nameMatch ? nameMatch[1] : 'unknown';

      // Skip common non-dark-pattern checkboxes
      if (/remember|stay.?logged|keep.?signed/i.test(fieldName)) continue;

      matches.push({
        type: 'preselection',
        evidence: `Pre-checked checkbox: ${fieldName}`,
        risk: 'medium',
        explanation: `Checkbox "${fieldName}" is pre-selected, potentially opting you into something`,
      });
    }
  }

  return matches;
}

/**
 * Analyze cookie consent banners for misdirection patterns.
 * Returns matches if "Accept All" is visually dominant over "Manage"/"Reject".
 */
export function detectCookieBannerMisdirection(html: string): DarkPatternMatch[] {
  const matches: DarkPatternMatch[] = [];

  // Look for cookie consent patterns
  const cookieRegex = /(?:cookie|consent|gdpr|privacy)\s*(?:banner|notice|popup|modal|bar)/i;
  if (!cookieRegex.test(html)) return matches;

  // Check if "Accept All" button exists but "Reject All" doesn't
  const hasAcceptAll = /accept\s+all|agree\s+(?:to\s+)?all/i.test(html);
  const hasRejectAll = /reject\s+all|decline\s+all|deny\s+all/i.test(html);

  if (hasAcceptAll && !hasRejectAll) {
    matches.push({
      type: 'misdirection',
      evidence: 'Cookie banner has "Accept All" but no equivalent "Reject All"',
      risk: 'medium',
      explanation: 'Cookie consent banner makes accepting all cookies easier than rejecting them',
    });
  }

  return matches;
}

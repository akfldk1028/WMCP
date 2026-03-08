import type {
  DarkPatternType,
  DarkPatternMatch,
  DarkPatternResult,
  RiskLevel,
} from '../core/types.js';
import { clamp, scoreToGrade } from '../core/scoring.js';

/**
 * Detection rules for common dark patterns.
 * Ported from site-guard with added Korean patterns.
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
      /\b(?:hurry|rush|act\s+(?:now|fast)|limited\s+time|don'?t\s+miss)\b/i,
      /\d{1,2}:\d{2}(?::\d{2})?\s*(?:remaining|left)/i,
      /limited[\s-]+time\s+deal/i,
      /deal\s+of\s+the\s+day/i,
      /(?:lightning|flash)\s+deal/i,
      /ends?\s+in\s+\d{1,2}\s*[hH:]\s*\d{1,2}/i,
      /(?:offer|price)\s+expires?/i,
      /(?:selling|going)\s+fast/i,
      /while\s+(?:supplies?|stocks?|they)\s+last/i,
      /(?:today|tonight)\s+only/i,
      /order\s+(?:within|in)\s+\d+\s+(?:hr|hour|min)/i,
      // Korean urgency
      /(?:단\s*)?(\d+)개\s*(?:남음|남았)/,
      /(?:마감|종료)\s*(?:임박|까지|D-?\d)/,
      /(?:서두르|지금\s*(?:바로|즉시)|놓치지\s*마)/,
      /한정\s*(?:수량|판매|특가)/,
      /(?:오늘|금일)\s*(?:만|한정)/,
      /(?:품절|매진)\s*임박/,
      /\d+시간\s*(?:남음|후\s*종료)/,
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
      /\d+[kK+]*\s+(?:bought|sold|purchased)\s+(?:in\s+(?:the\s+)?(?:past|last))?/i,
      /\d+[kK+]*\s+(?:ratings?|reviews?)/i,
      /(?:amazon(?:'s)?|#1)\s+best[\s-]?seller/i,
      /#\d+\s+(?:best[\s-]?seller|most\s+wished)/i,
      /\d+\s+(?:watchers?|sold)\b/i,
      /(?:almost|nearly)\s+gone/i,
      /popular\s+pick/i,
      /(?:best|top)\s+seller\b/i,
      // Korean social proof
      /\d+명이?\s*(?:보고\s*있|구매|장바구니)/,
      /(?:지금|현재)\s*\d+명\s*(?:열람|조회)/,
      /(?:인기|베스트|핫)\s*(?:상품|아이템)/,
      /\d+[만천]?\s*(?:개|건)\s*(?:판매|리뷰|구매)/,
      /(?:누적|총)\s*(?:판매|리뷰)\s*\d+/,
      /\d+명이?\s*(?:이\s*상품을?\s*)?(?:봤|관심|찜)/,
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
      /continue\s+without\s+(?:saving|discount|deal|offer|protection)/i,
      /no,?\s+I\s+(?:don'?t\s+)?(?:want|need)\s+(?:to\s+)?(?:save|pay\s+less)/i,
      /I(?:'?d)?\s+rather\s+pay\s+(?:full|more|regular)\s+price/i,
      // Korean confirm-shaming
      /(?:할인|혜택|쿠폰)[^<]{0,60}(?:포기|거부|안\s*받)/,
    ],
    risk: 'high',
    explanation: 'Shames users into accepting by making the decline option negative',
  },
  {
    type: 'misdirection',
    patterns: [
      /accept\s+all/i,
      /모두\s*동의/,
      /(?:recommended|suggested)\s+(?:for\s+you|plan|option)/i,
      /(?:most\s+popular|best\s+value)\s+(?:plan|option|choice)/i,
    ],
    risk: 'medium',
    explanation:
      'Uses visual emphasis to direct users toward the less privacy-friendly option',
  },
  {
    type: 'preselection',
    patterns: [/checked\s*(?:=\s*["']?(?:true|checked)["']?)?/i],
    risk: 'medium',
    explanation: 'Pre-selects options that benefit the service, not the user',
  },
  {
    type: 'forced-continuity',
    patterns: [
      /free\s+trial\s+(?:will\s+)?(?:automatically\s+)?(?:convert|become|turn\s+into)/i,
      /(?:after|when)\s+(?:your\s+)?(?:free\s+)?trial\s+(?:ends?|expires?|is\s+over)/i,
      /credit\s+card\s+required\s+(?:for\s+)?(?:free\s+)?trial/i,
      // Korean
      /무료\s*체험[^<]{0,60}자동\s*(?:결제|전환|갱신)/,
      /(?:체험|이용)\s*기간[^<]{0,60}(?:결제|과금)/,
    ],
    risk: 'high',
    explanation: 'Free trial automatically converts to paid subscription',
  },
  {
    type: 'obstruction',
    patterns: [
      /(?:call|contact|email)\s+(?:us|support|customer\s+service)\s+to\s+cancel/i,
      /(?:cancellation|cancel)\s+(?:requires?|needs?)\s+(?:phone|call|written|letter)/i,
      // Korean
      /(?:해지|탈퇴|취소)[^<]{0,60}(?:전화|고객\s*센터|상담원|방문)/,
    ],
    risk: 'critical',
    explanation: 'Makes cancellation intentionally difficult',
  },
  {
    type: 'hidden-costs',
    patterns: [
      /(?:service|processing|handling|convenience|platform)\s+fee/i,
      /(?:additional|extra)\s+(?:charges?|fees?)\s+(?:may\s+)?apply/i,
      /(?:shipping|tax(?:es)?)\s+(?:calculated|determined|shown)\s+at\s+checkout/i,
      /(?:plus|excluding)\s+(?:shipping|tax|delivery)/i,
      /import\s+(?:fees?|duties?|charges?)\s+deposit/i,
      // Korean
      /(?:추가|별도)\s*(?:요금|비용|수수료)\s*(?:발생|부과)/,
      /(?:배송비|설치비)\s*(?:별도|추가)/,
      /(?:부가세|관세)\s*(?:별도|미포함|불포함)/,
    ],
    risk: 'high',
    explanation: 'Hidden fees not shown until checkout or buried in fine print',
  },
  {
    type: 'bait-and-switch',
    patterns: [
      /(?:from|starting\s+at)\s+\$\d+/i,
      /(?:as\s+low\s+as|prices?\s+start)\s+(?:at\s+)?\$?\d+/i,
      /(?:was|regular(?:ly)?)\s+\$\d+[^<]{0,30}now\s+\$\d+/i,
      /정가\s*대비\s*\d+%\s*할인/,
      /(?:원래|정상)\s*가격?\s*\d+[^<]{0,20}(?:할인|세일)/,
    ],
    risk: 'medium',
    explanation: 'Displayed price may differ from the actual final price',
  },
  {
    type: 'drip-pricing',
    patterns: [
      /(?:taxes?|tax(?:es)?)\s+not\s+included/i,
      /(?:fees?|charges?)\s+not\s+included/i,
      /(?:excluding|before)\s+(?:tax(?:es)?|fees?|shipping)/i,
      /(?:배송비|설치비|관세)\s*(?:미포함|불포함|별도)/,
      /(?:부가세|세금)\s*(?:미포함|불포함|별도)/,
    ],
    risk: 'high',
    explanation: 'Mandatory costs may not be included in the displayed price',
  },
  {
    type: 'nagging',
    patterns: [
      /subscribe\s+to\s+(?:our\s+)?(?:newsletter|updates|emails?)/i,
      /(?:download|install|get)\s+(?:our|the)\s+app/i,
      /(?:enable|turn\s+on|allow)\s+(?:push\s+)?notifications?/i,
      /(?:sign\s+up|register)\s+(?:for|to\s+get)\s+(?:updates|deals|offers)/i,
      /(?:앱\s*(?:다운로드|설치)|뉴스레터\s*구독)/,
      /(?:알림|푸시)\s*(?:허용|켜기|받기)/,
    ],
    risk: 'low',
    explanation: 'Repeatedly prompts for subscriptions, app installs, or notifications',
  },
  {
    type: 'trick-question',
    patterns: [
      /uncheck\s+(?:to|if\s+you)\s+(?:opt\s+out|don'?t\s+want)/i,
      /(?:un)?check\s+(?:this\s+)?box\s+(?:to|if\s+you\s+do)\s+not/i,
      /(?:do\s+not|don'?t)\s+(?:un)?check\s+(?:if|to)/i,
      /(?:선택\s*해제|체크\s*해제)[^<]{0,30}(?:원하지\s*않|거부)/,
    ],
    risk: 'high',
    explanation: 'Opt-out wording uses double negatives or confusing phrasing',
  },
  {
    type: 'disguised-ads',
    patterns: [
      /sponsored\s+(?:product|result|listing|content|post)/i,
      /(?:featured|promoted)\s+(?:product|result|listing|offer)/i,
      /(?:\bad\b|advertisement|광고)\s*(?:product|상품|결과)?/i,
      /(?:광고|협찬|제휴)\s*(?:상품|제품|링크)/,
    ],
    risk: 'medium',
    explanation: 'Some results may be paid advertising placements',
  },
];

/**
 * Scan page text/HTML for dark patterns.
 * Ported from site-guard with Korean pattern additions.
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
 */
export function detectCookieBannerMisdirection(
  html: string,
): DarkPatternMatch[] {
  const matches: DarkPatternMatch[] = [];

  const cookieRegex =
    /(?:cookie|consent|gdpr|privacy)\s*(?:banner|notice|popup|modal|bar)/i;
  if (!cookieRegex.test(html)) return matches;

  const hasAcceptAll = /accept\s+all|agree\s+(?:to\s+)?all/i.test(html);
  const hasRejectAll = /reject\s+all|decline\s+all|deny\s+all/i.test(html);

  if (hasAcceptAll && !hasRejectAll) {
    matches.push({
      type: 'misdirection',
      evidence: 'Cookie banner has "Accept All" but no equivalent "Reject All"',
      risk: 'medium',
      explanation:
        'Cookie consent banner makes accepting all cookies easier than rejecting them',
    });
  }

  return matches;
}

const RISK_WEIGHTS: Record<RiskLevel, number> = {
  critical: 30,
  high: 20,
  medium: 12,
  low: 5,
  safe: 0,
};

/**
 * Run full dark pattern analysis and produce a result with trust score.
 */
export function analyzeDarkPatterns(
  content: string,
  html?: string,
): DarkPatternResult {
  const textPatterns = detectDarkPatterns(content);
  const checkboxPatterns = html ? detectPreselectedCheckboxes(html) : [];
  const cookiePatterns = html ? detectCookieBannerMisdirection(html) : [];

  const allPatterns = [...textPatterns, ...checkboxPatterns, ...cookiePatterns];

  // Calculate penalty from risk weights
  const totalPenalty = allPatterns.reduce(
    (sum, p) => sum + RISK_WEIGHTS[p.risk],
    0,
  );

  // riskScore: 0 = safe, 100 = very risky (true risk, not inverted)
  const riskScore = clamp(totalPenalty);

  return {
    patterns: allPatterns,
    riskScore,
    grade: scoreToGrade(100 - riskScore),
  };
}

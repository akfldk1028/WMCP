import type { DarkPatternType, DarkPatternEvidence, Locale } from '../core/types.js';

const DARK_PATTERN_RULES: Array<{
  type: DarkPatternType;
  patterns: RegExp[];
  locale?: Locale;
}> = [
  {
    type: 'fake-urgency',
    patterns: [
      /only\s+\d+\s+(?:left|remaining|available)/i,
      /(?:sale|offer|deal)\s+ends?\s+(?:in|soon|today|tonight)/i,
      /(?:hurry|rush|act\s+(?:now|fast)|limited\s+time|don'?t\s+miss)/i,
      /\d{1,2}:\d{2}(?::\d{2})?\s*(?:remaining|left)/i,
    ],
    locale: 'en',
  },
  {
    type: 'fake-urgency',
    patterns: [
      /(?:단\s*)?(\d+)개\s*(?:남음|남았)/,
      /(?:마감|종료)\s*(?:임박|까지|D-?\d)/,
      /(?:서두르|지금\s*(?:바로|즉시)|놓치지\s*마)/,
      /한정\s*(?:수량|판매|특가)/,
    ],
    locale: 'ko',
  },
  {
    type: 'fake-social-proof',
    patterns: [
      /\d+\s+(?:people|users|customers|others)\s+(?:are\s+)?(?:viewing|looking|watching|bought)/i,
      /(?:trending|popular|hot|best[\s-]?seller)\s+(?:right\s+)?now/i,
      /(?:just\s+)?(?:purchased|bought|ordered)\s+(?:by\s+)?\w+\s+(?:from|in)\s+\w+/i,
    ],
    locale: 'en',
  },
  {
    type: 'fake-social-proof',
    patterns: [
      /\d+명이?\s*(?:보고\s*있|구매|장바구니)/,
      /(?:지금|현재)\s*\d+명\s*(?:열람|조회)/,
      /(?:인기|베스트|핫)\s*(?:상품|아이템)/,
    ],
    locale: 'ko',
  },
  {
    type: 'confirm-shaming',
    patterns: [
      /no\s+thanks?,?\s+I\s+(?:don'?t\s+)?(?:want|like|need|prefer)/i,
      /I(?:'?ll)?\s+(?:pass|skip)\s+(?:on\s+)?(?:this|saving|the\s+(?:discount|deal|offer))/i,
      /(?:miss\s+out|stay\s+(?:uninformed|behind))/i,
      /(?:할인|혜택|쿠폰)[^<]{0,60}(?:포기|거부|안\s*받)/,
    ],
  },
  {
    type: 'misdirection',
    patterns: [/accept\s+all/i, /모두\s*동의/],
  },
  // preselection: detected via HTML checkbox analysis below, not text patterns
  // (text-based /checked/ regex false-positives on normal content)
  {
    type: 'forced-continuity',
    patterns: [
      /free\s+trial\s+(?:will\s+)?(?:automatically\s+)?(?:convert|become|turn\s+into)/i,
      /(?:after|when)\s+(?:your\s+)?(?:free\s+)?trial\s+(?:ends?|expires?|is\s+over)/i,
      /credit\s+card\s+required\s+(?:for\s+)?(?:free\s+)?trial/i,
      /무료\s*체험[^<]{0,60}자동\s*(?:결제|전환|갱신)/,
      /(?:체험|이용)\s*기간[^<]{0,60}(?:결제|과금)/,
    ],
  },
  {
    type: 'obstruction',
    patterns: [
      /(?:call|contact|email)\s+(?:us|support|customer\s+service)\s+to\s+cancel/i,
      /(?:cancellation|cancel)\s+(?:requires?|needs?)\s+(?:phone|call|written|letter)/i,
      /(?:해지|탈퇴|취소)[^<]{0,60}(?:전화|고객\s*센터|상담원|방문)/,
    ],
  },
  {
    type: 'hidden-costs',
    patterns: [
      /(?:service|processing|handling|convenience|platform)\s+fee/i,
      /(?:additional|extra)\s+(?:charges?|fees?)\s+(?:may\s+)?apply/i,
      /(?:추가|별도)\s*(?:요금|비용|수수료)\s*(?:발생|부과)/,
    ],
  },
  {
    type: 'privacy-zuckering',
    patterns: [
      /(?:by\s+(?:signing|continuing|clicking|creating|registering))\s+[^<]{0,60}(?:agree|consent|accept)[^<]{0,60}(?:privacy|data|terms)/i,
      /(?:동의|계속|가입)[^<]{0,30}(?:개인정보|약관|이용약관)/,
    ],
  },
];

/** Extract dark pattern evidence from text content, returning context around each match */
export function extractDarkPatternEvidence(
  content: string,
  html?: string,
): DarkPatternEvidence[] {
  const matches: DarkPatternEvidence[] = [];
  const seen = new Set<string>();

  // Text-based patterns (use type+locale key to allow both EN and KO matches)
  for (const rule of DARK_PATTERN_RULES) {
    const seenKey = `${rule.type}:${rule.locale ?? 'any'}`;
    if (seen.has(seenKey)) continue;

    for (const pattern of rule.patterns) {
      const match = pattern.exec(content);
      if (match) {
        seen.add(seenKey);
        const start = Math.max(0, match.index - 80);
        const end = Math.min(content.length, match.index + match[0].length + 80);

        matches.push({
          type: rule.type,
          evidence: match[0].slice(0, 200),
          context: content.substring(start, end),
          locale: rule.locale,
        });
        break;
      }
    }
  }

  // HTML-specific: pre-checked checkboxes
  if (html) {
    const checkboxRegex = /<input\b([^>]*type\s*=\s*["']checkbox["'][^>]*)>/gi;
    let cbMatch: RegExpExecArray | null;
    while ((cbMatch = checkboxRegex.exec(html)) !== null) {
      const attrs = cbMatch[1];
      if (!/\bchecked\b/i.test(attrs)) continue;

      const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/i);
      const fieldName = nameMatch ? nameMatch[1] : 'unknown';
      if (/remember|stay.?logged|keep.?signed/i.test(fieldName)) continue;

      if (!seen.has('preselection:html')) {
        seen.add('preselection:html');
        matches.push({
          type: 'preselection',
          evidence: `Pre-checked checkbox: ${fieldName}`,
          context: cbMatch[0],
          elementType: 'input[checkbox]',
        });
      }
    }

    // Cookie banner misdirection
    const cookieRegex = /(?:cookie|consent|gdpr|privacy)\s*(?:banner|notice|popup|modal|bar)/i;
    if (cookieRegex.test(html)) {
      const hasAcceptAll = /accept\s+all|agree\s+(?:to\s+)?all/i.test(html);
      const hasRejectAll = /reject\s+all|decline\s+all|deny\s+all/i.test(html);
      if (hasAcceptAll && !hasRejectAll && !seen.has('misdirection:html')) {
        seen.add('misdirection:html');
        matches.push({
          type: 'misdirection',
          evidence: 'Cookie banner has "Accept All" but no equivalent "Reject All"',
          context: 'Cookie consent banner makes accepting all cookies easier than rejecting them',
          elementType: 'cookie-banner',
        });
      }
    }
  }

  return matches;
}

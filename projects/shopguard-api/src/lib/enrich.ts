/** Enrich dark pattern results with human-readable descriptions */

interface RawDarkPattern {
  type: string;
  evidence: string;
  context: string;
  locale?: string;
  elementType?: string;
}

interface EnrichedDarkPattern extends RawDarkPattern {
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  tip: string;
}

interface CatalogEntry {
  risk: EnrichedDarkPattern['risk'];
  ko: { description: string; tip: string };
  en: { description: string; tip: string };
}

const CATALOG: Record<string, CatalogEntry> = {
  'fake-urgency': {
    risk: 'medium',
    ko: {
      description: '재고 수량이나 카운트다운 타이머가 표시되고 있습니다.',
      tip: '시간을 두고 다시 확인해볼 수 있습니다. 실제로 긴급한 경우는 많지 않습니다.',
    },
    en: {
      description: 'Stock counters or countdown timers are being displayed.',
      tip: 'Check back later — genuine scarcity rarely resets every day.',
    },
  },
  'fake-social-proof': {
    risk: 'medium',
    ko: {
      description: '조회수나 구매수 등의 수치가 표시되고 있습니다.',
      tip: '상품 자체의 장단점으로 판단하세요. 표시된 수치가 실시간 정확한 데이터인지는 알 수 없습니다.',
    },
    en: {
      description: 'Viewer or purchase counts are being displayed.',
      tip: 'Judge the product on its own merits. These numbers may not reflect real-time data.',
    },
  },
  'confirm-shaming': {
    risk: 'high',
    ko: {
      description: '거절 옵션이 손해 보는 느낌의 문구를 사용하고 있습니다.',
      tip: '거절은 언제나 유효한 선택입니다. 문구의 감정적 표현에 영향받지 않아도 됩니다.',
    },
    en: {
      description: 'The decline option uses guilt-inducing language.',
      tip: 'Saying "no" is always a valid choice. Don\'t let emotional wording influence you.',
    },
  },
  'misdirection': {
    risk: 'medium',
    ko: {
      description: '특정 선택지가 시각적으로 더 강조되어 있습니다.',
      tip: '덜 눈에 띄는 옵션도 확인해보세요. 작은 링크나 텍스트에 원하는 선택지가 있을 수 있습니다.',
    },
    en: {
      description: 'Certain options are visually emphasized over others.',
      tip: 'Check the less visible options too — smaller links may be what you actually want.',
    },
  },
  'preselection': {
    risk: 'medium',
    ko: {
      description: '일부 옵션이 미리 선택(체크)되어 있습니다.',
      tip: '제출 전 체크박스를 검토하세요. 직접 선택하지 않은 항목은 해제할 수 있습니다.',
    },
    en: {
      description: 'Some options are pre-checked for you.',
      tip: 'Review all checkboxes before submitting. Uncheck anything you didn\'t actively choose.',
    },
  },
  'forced-continuity': {
    risk: 'high',
    ko: {
      description: '무료 체험이 자동으로 유료 구독으로 전환될 수 있습니다.',
      tip: '체험 종료일에 알림을 설정하세요. 가입 전 해지 방법을 미리 확인하면 도움이 됩니다.',
    },
    en: {
      description: 'A free trial may auto-convert to a paid subscription.',
      tip: 'Set a calendar reminder before the trial ends. Check cancellation steps before signing up.',
    },
  },
  'obstruction': {
    risk: 'critical',
    ko: {
      description: '해지나 탈퇴에 전화, 우편 등 추가 절차가 필요할 수 있습니다.',
      tip: '해지 시도 과정을 기록해두세요. 일부 국가에서는 소비자 보호법으로 간편 해지를 보장합니다.',
    },
    en: {
      description: 'Cancellation may require phone calls, letters, or extra steps.',
      tip: 'Document your cancellation attempts. Many countries require easy cancellation by law.',
    },
  },
  'hidden-costs': {
    risk: 'high',
    ko: {
      description: '표시된 가격 외에 결제 단계에서 추가 비용이 발생할 수 있습니다.',
      tip: '결제 전 최종 금액을 확인하세요. 다른 판매자와 비교해보는 것도 좋습니다.',
    },
    en: {
      description: 'Additional fees may appear at checkout beyond the displayed price.',
      tip: 'Always check the final total before confirming. Compare with other sellers.',
    },
  },
  'privacy-zuckering': {
    risk: 'high',
    ko: {
      description: '동의 과정에서 의도보다 넓은 범위의 데이터 공유가 포함될 수 있습니다.',
      tip: '동의 문구를 꼼꼼히 읽어보세요. "계속하면 동의" 조항에 광범위한 데이터 공유가 포함될 수 있습니다.',
    },
    en: {
      description: 'The consent flow may include broader data sharing than intended.',
      tip: 'Read consent forms carefully. "By continuing" clauses often hide wide data sharing.',
    },
  },
  'bait-and-switch': {
    risk: 'medium',
    ko: {
      description: '표시 가격이 실제 최종 가격과 다를 수 있습니다.',
      tip: '"~부터" 가격은 최소 사양 기준일 수 있습니다. 원하는 옵션의 실제 가격을 확인하세요.',
    },
    en: {
      description: 'The displayed price may differ from the actual final price.',
      tip: '"From" prices are often for the base option. Check the real price for what you want.',
    },
  },
  'drip-pricing': {
    risk: 'high',
    ko: {
      description: '표시 가격에 필수 비용(세금, 배송비 등)이 포함되지 않았을 수 있습니다.',
      tip: '결제 최종 단계에서 총액을 반드시 확인하세요.',
    },
    en: {
      description: 'Mandatory costs (tax, shipping) may not be included in the displayed price.',
      tip: 'Always check the final total at checkout.',
    },
  },
  'nagging': {
    risk: 'low',
    ko: {
      description: '구독, 앱 설치, 알림 수신을 반복적으로 요청하고 있습니다.',
      tip: '필요하지 않다면 무시해도 됩니다. 대부분 닫기 버튼이 있습니다.',
    },
    en: {
      description: 'Repeated prompts for subscriptions, app installs, or notifications.',
      tip: 'Ignore if not needed — there\'s usually a close button.',
    },
  },
  'trick-question': {
    risk: 'high',
    ko: {
      description: '선택 해제 문구가 이중 부정 등 혼동되는 표현을 사용합니다.',
      tip: '체크박스 옆 문구를 천천히 읽어보세요. "해제하면 받지 않음" 같은 이중 부정에 주의하세요.',
    },
    en: {
      description: 'Opt-out wording uses double negatives or confusing phrasing.',
      tip: 'Read checkbox labels slowly. Watch for double negatives like "uncheck to not receive".',
    },
  },
  'disguised-ads': {
    risk: 'medium',
    ko: {
      description: '일부 결과가 유료 광고 배치일 수 있습니다.',
      tip: '"Sponsored", "광고", "Promoted" 라벨을 확인하세요. 자연 검색 결과와 구분됩니다.',
    },
    en: {
      description: 'Some results may be paid advertising placements.',
      tip: 'Look for "Sponsored" or "Promoted" labels to distinguish ads from organic results.',
    },
  },
};

const FALLBACK: CatalogEntry = {
  risk: 'medium',
  ko: {
    description: '이 페이지에서 주목할 만한 디자인 패턴이 감지되었습니다.',
    tip: '해당 요소를 한 번 더 확인해보세요.',
  },
  en: {
    description: 'A notable design pattern was detected on this page.',
    tip: 'Review this element carefully before proceeding.',
  },
};

type Locale = 'ko' | 'en';

export function enrichDarkPatterns(results: RawDarkPattern[], locale?: Locale): EnrichedDarkPattern[] {
  const lang: Locale = locale === 'ko' ? 'ko' : 'en';
  return results.map(r => {
    const entry = CATALOG[r.type] || FALLBACK;
    const localized = entry[lang];
    return {
      ...r,
      risk: entry.risk,
      description: localized.description,
      tip: localized.tip,
    };
  });
}

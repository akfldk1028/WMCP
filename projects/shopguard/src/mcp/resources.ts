/** MCP Resources — domain knowledge catalogs for AI agents */

export interface ResourceEntry {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  content: string;
}

export const DARK_PATTERN_CATALOG: ResourceEntry = {
  uri: 'shopguard://catalog/dark-patterns',
  name: 'Dark Pattern Catalog',
  description: '9 types of dark patterns with definitions, examples, and risk levels (KO+EN)',
  mimeType: 'application/json',
  content: JSON.stringify({
    version: '1.0',
    patterns: [
      {
        type: 'fake-urgency',
        risk: 'medium',
        definition: 'Creates artificial scarcity or time pressure to force immediate action',
        examples_en: ['Only 3 left in stock!', 'Sale ends in 00:15:30', 'Limited time offer!'],
        examples_ko: ['단 5개 남음!', '마감 임박!', '한정 수량 특가'],
      },
      {
        type: 'fake-social-proof',
        risk: 'medium',
        definition: 'Uses fabricated or misleading activity indicators to influence decisions',
        examples_en: ['47 people are viewing this right now', 'Trending now', 'Just purchased by John from NYC'],
        examples_ko: ['현재 23명이 보고 있습니다', '인기 상품', '지금 15명이 장바구니에 담았습니다'],
      },
      {
        type: 'confirm-shaming',
        risk: 'high',
        definition: 'Makes the decline option emotionally negative to shame users into accepting',
        examples_en: ["No thanks, I don't want to save money", "I'll pass on this amazing deal"],
        examples_ko: ['할인 혜택을 포기하겠습니다', '쿠폰을 안 받겠습니다'],
      },
      {
        type: 'misdirection',
        risk: 'medium',
        definition: 'Uses visual hierarchy or emphasis to steer users toward less privacy-friendly options',
        examples_en: ['Large "Accept All" button with tiny "Manage preferences" link'],
        examples_ko: ['큰 "모두 동의" 버튼과 작은 "설정" 링크'],
      },
      {
        type: 'preselection',
        risk: 'medium',
        definition: 'Pre-checks options that benefit the service, not the user',
        examples_en: ['Pre-checked newsletter subscription', 'Pre-selected premium shipping'],
        examples_ko: ['사전 체크된 뉴스레터 구독', '기본 선택된 프리미엄 배송'],
      },
      {
        type: 'forced-continuity',
        risk: 'high',
        definition: 'Free trial automatically converts to paid subscription without clear notice',
        examples_en: ['Free trial will automatically convert to $19.99/month', 'Credit card required for free trial'],
        examples_ko: ['무료 체험 후 자동 결제', '체험 기간 종료 시 자동 과금'],
      },
      {
        type: 'obstruction',
        risk: 'critical',
        definition: 'Makes cancellation or unsubscribing intentionally difficult',
        examples_en: ['Call us to cancel', 'Cancellation requires written letter'],
        examples_ko: ['해지는 고객센터로 전화', '탈퇴를 위해 방문 필요'],
      },
      {
        type: 'hidden-costs',
        risk: 'high',
        definition: 'Fees not shown until checkout or buried in fine print',
        examples_en: ['Service fee added at checkout', 'Additional charges may apply'],
        examples_ko: ['추가 요금 발생', '별도 수수료 부과'],
      },
      {
        type: 'privacy-zuckering',
        risk: 'high',
        definition: 'Tricks users into sharing more data than intended through confusing consent flows',
        examples_en: ['By continuing you agree to share data with partners'],
        examples_ko: ['계속하면 개인정보 제3자 제공에 동의합니다'],
      },
    ],
  }, null, 2),
};

export const PRICING_TACTICS_CATALOG: ResourceEntry = {
  uri: 'shopguard://catalog/pricing-tactics',
  name: 'Pricing Tactics Catalog',
  description: '8 pricing tactics with definitions, examples, and platform-specific characteristics',
  mimeType: 'application/json',
  content: JSON.stringify({
    version: '1.0',
    tactics: [
      {
        type: 'hidden-fee',
        definition: 'Extra charges not displayed in the advertised price',
        keywords_en: ['service fee', 'processing fee', 'handling fee', 'convenience fee', 'platform fee', 'resort fee'],
        keywords_ko: ['수수료', '추가 요금', '별도 비용', '설치비', '배송비'],
        platforms: { airbnb: 'cleaning fee + service fee', ticketmaster: 'service + facility charges' },
      },
      {
        type: 'drip-pricing',
        definition: 'Price increases incrementally through checkout as fees are revealed',
        detection: 'Compare initial displayed price with final checkout price',
      },
      {
        type: 'dynamic-pricing',
        definition: 'Prices change based on user behavior, time, or demand',
        detection: 'Price changes between visits or across different browsers/devices',
      },
      {
        type: 'bait-and-switch',
        definition: 'Advertised price/product is unavailable, substitute offered at higher price',
        detection: 'Advertised item "out of stock" with redirect to pricier alternative',
      },
      {
        type: 'decoy-pricing',
        definition: 'Inferior option makes the target option seem like better value',
        detection: 'Three-tier pricing where middle option is clearly worse than premium',
      },
      {
        type: 'surge-pricing',
        definition: 'Temporary price increases during high demand periods',
        platforms: { uber: 'ride surge', delivery: 'peak hour fees' },
      },
      {
        type: 'subscription-trap',
        definition: 'Free trial converts to paid subscription without adequate notice',
        keywords_en: ['auto-renew', 'introductory price', 'after trial'],
        keywords_ko: ['자동 결제', '자동 갱신', '체험 종료 후'],
      },
      {
        type: 'currency-trick',
        definition: 'Prices displayed in a different currency to appear cheaper',
        detection: 'Currency symbol differs from user locale or checkout currency',
      },
    ],
  }, null, 2),
};

export const REVIEW_INDICATORS_CATALOG: ResourceEntry = {
  uri: 'shopguard://catalog/review-indicators',
  name: 'Review Indicators Catalog',
  description: '6 fake review heuristics with thresholds and keyword lists',
  mimeType: 'application/json',
  content: JSON.stringify({
    version: '1.0',
    indicators: [
      {
        name: 'dateCluster',
        description: 'Unnatural clustering of review dates — many reviews on the same day suggests coordinated campaigns',
        thresholds: { '≥80% same day': 95, '≥60%': 75, '≥40%': 55, '≥25%': 30 },
        weight: 0.2,
      },
      {
        name: 'ratingAnomaly',
        description: 'Abnormal rating distribution — real products rarely have 90%+ five-star reviews',
        thresholds: { '>90% five-star': 90, '>80%': 70, '>70%': 45, 'J-curve (5★+1★, no middle)': 60 },
        weight: 0.2,
      },
      {
        name: 'phraseRepetition',
        description: 'Shared 3-grams across multiple reviews — templated/copied reviews share exact phrases',
        thresholds: { '>30% shared': 90, '>20%': 70, '>10%': 45, '>5%': 20 },
        weight: 0.15,
      },
      {
        name: 'lengthUniformity',
        description: 'Suspiciously uniform review lengths — real reviews vary widely in length',
        metric: 'Coefficient of Variation (CV) of word counts',
        thresholds: { 'CV<0.15': 85, 'CV<0.25': 55, 'CV<0.35': 25 },
        weight: 0.1,
      },
      {
        name: 'incentiveKeywords',
        description: 'Keywords indicating sponsored/incentivized reviews',
        keywords_ko: ['체험단', '협찬', '제공받', '무료 제공', '광고 포함', '원고료', '서포터즈'],
        keywords_en: ['received for free', 'in exchange for review', 'gifted by', 'sponsored', 'ambassador'],
        thresholds: { '>50% incentivized': 90, '>30%': 65, '>15%': 40, '>5%': 15 },
        weight: 0.15,
      },
      {
        name: 'ratingSurge',
        description: 'Sudden spikes of 5-star reviews in specific weeks — suggests paid review campaigns',
        thresholds: { '>30% surge weeks': 90, '>15%': 65, '>5%': 35 },
        weight: 0.2,
      },
    ],
    aiDetection: {
      name: 'aiGeneration',
      description: 'Statistical text analysis for AI-generated content',
      metrics: ['burstiness (sentence length variance)', 'TTR (vocabulary diversity)', 'exclamation density'],
      note: 'Low burstiness + low TTR + low exclamation = likely AI-generated',
    },
  }, null, 2),
};

export const ALL_RESOURCES = [
  DARK_PATTERN_CATALOG,
  PRICING_TACTICS_CATALOG,
  REVIEW_INDICATORS_CATALOG,
];

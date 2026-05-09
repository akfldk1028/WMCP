/**
 * Maker-friendly environment scan — PEST + 5 Forces + macro trends.
 * Pure client-side rule-based analysis seeded with category-specific
 * domain knowledge that's accurate as of 2026 vibe-coding wave.
 */

import type { Category } from '@/lib/finance/valuation';

export interface EnvironmentInput {
  category: Category;
  /** Target geography. */
  region: 'kr' | 'global';
  /** Self-assessed competitor density (1=blue ocean, 5=blood bath). */
  competitorDensity: number;
  /** Self-assessed regulatory exposure (1=none, 5=heavily regulated). */
  regulatoryRisk: number;
  /** Years since launch (0 = pre-launch). */
  ageYears: number;
}

export interface PestFactor {
  axis: 'P' | 'E' | 'S' | 'T';
  /** Headline of the trend or risk. */
  headline: string;
  body: string;
  /** -2..+2: how positive/negative for this category right now. */
  signal: number;
}

export interface ForceScore {
  /** 1 = weak (favorable to incumbent), 5 = strong (squeeze). */
  score: number;
  rationale: string;
}

export interface FiveForces {
  rivalry: ForceScore;
  newEntrants: ForceScore;
  substitutes: ForceScore;
  buyerPower: ForceScore;
  supplierPower: ForceScore;
  /** Average of all 5 forces — higher = harder market. */
  pressure: number;
}

export interface EnvironmentResult {
  pest: PestFactor[];
  forces: FiveForces;
  megaTrends: { title: string; body: string; tone: 'tail' | 'head' }[];
  summary: string;
}

/* Seed knowledge: per-category PEST baseline as of 2026 (Korean context). */
const PEST_SEED: Record<Category, PestFactor[]> = {
  saas: [
    { axis: 'P', headline: '개인정보보호법·CSAP·EU AI Act 압박', body: 'SaaS 데이터 처리·AI 기능에 대한 KR/EU 규제 강화. B2B SaaS는 보안·컴플라이언스 인증이 거래 조건이 됨.', signal: -1 },
    { axis: 'E', headline: 'B2B 예산 압박 + AI ROI 회의론', body: '한국 기업의 SaaS 예산 동결 사례 증가. AI 도구는 실측 ROI 증명 못 하면 갱신 거부.', signal: -1 },
    { axis: 'S', headline: '1인 메이커·소형 팀 폭증', body: '바이브 코딩 도구 보급으로 진입 장벽 붕괴. 동시에 동료 팀의 소비자가 됨 — 가격 민감도 높음.', signal: 1 },
    { axis: 'T', headline: '에이전트형 SaaS 표준화', body: 'WebMCP·MCP·Tool calling이 기본 인터페이스가 됨. SaaS는 단독 사용보다 에이전트가 호출하는 도구로 변형 중.', signal: 2 },
  ],
  app: [
    { axis: 'P', headline: 'iOS 17.4+/EU DMA: 사이드로딩 의무화', body: '앱스토어 독점 약화 + 결제 수수료 우회 가능. 한국은 인앱결제법 시행 중.', signal: 1 },
    { axis: 'E', headline: '광고 ARPU 회복 + IAP 둔화', body: '브랜드 광고 회복세, 그러나 IAP는 사용자 피로 누적. 구독 모델로 이동.', signal: 0 },
    { axis: 'S', headline: '쇼츠/릴스 중심 사용 행태', body: '평균 세션 길이 단축. 첫 30초 안에 가치 못 보여주면 이탈.', signal: -1 },
    { axis: 'T', headline: 'AI 네이티브 UX 보편화', body: '음성·이미지 입력 → 결과 생성. 텍스트 폼 위주 앱은 구식 인식.', signal: 1 },
  ],
  agent: [
    { axis: 'P', headline: 'EU AI Act 고위험 분류 / KR AI 기본법', body: '에이전트의 자동 의사결정에 대한 투명성·로깅 요구. 컴플라이언스 비용 발생.', signal: -1 },
    { axis: 'E', headline: '엔터프라이즈 AI 예산 폭증', body: 'Cursor·Claude Code 도입 케이스 일반화. AI 에이전트에 대한 신용한도 확대.', signal: 2 },
    { axis: 'S', headline: '신뢰 격차: "AI는 거짓말한다" 인식', body: '결과의 근거·출처 표기가 사용자 채택의 결정 요인.', signal: -1 },
    { axis: 'T', headline: 'Tool 표준화 + 컨텍스트 1M+ 보편화', body: 'MCP·tool calling 표준 + 1M+ 컨텍스트가 기본. 에이전트의 능력 차이가 빠르게 좁혀짐.', signal: 1 },
  ],
  content: [
    { axis: 'P', headline: 'AI 학습용 콘텐츠 저작권 이슈', body: 'NYT vs OpenAI 류 소송 확산. 콘텐츠 라이선싱이 신규 매출원이자 분쟁 영역.', signal: 0 },
    { axis: 'E', headline: '크리에이터 직접결제 시장 성장', body: 'Substack·Patreon·캐롯 등 D2F 결제 보편화.', signal: 1 },
    { axis: 'S', headline: 'AI 생성 콘텐츠 범람 → 큐레이션 가치 ↑', body: '인간 큐레이션·전문가 시그널이 차별화 요소가 됨.', signal: 1 },
    { axis: 'T', headline: '음성·영상 자동 생성 가속', body: '제작 단가 1/100. 결국 분배·발견 채널이 가치를 가짐.', signal: 0 },
  ],
  commerce: [
    { axis: 'P', headline: '플랫폼법 / 공정거래 규제', body: '쿠팡·네이버 외 신규 진입 어려움. D2C는 SNS 직판으로 우회.', signal: -1 },
    { axis: 'E', headline: '소비 둔화 + 객단가 양극화', body: '저가/프리미엄 양극화. 중간 가격대 가장 어려움.', signal: -1 },
    { axis: 'S', headline: '라이브커머스 피로 + 숏폼 커머스', body: 'TikTok Shop·SHEIN형 숏폼 직판이 새 채널.', signal: 0 },
    { axis: 'T', headline: 'AI 추천·재고 자동화', body: 'Shopify·Cafe24가 AI 기능 무료화. 차별점이 빠르게 사라짐.', signal: 0 },
  ],
};

const FORCES_SEED: Record<Category, FiveForces> = {
  saas: {
    rivalry: { score: 4, rationale: '경쟁 SaaS 무한히 공급. 차별화 못 하면 가격 경쟁.' },
    newEntrants: { score: 5, rationale: 'AI 도구로 1주일이면 유사품 출시 가능.' },
    substitutes: { score: 3, rationale: 'No-code, 에이전트가 직접 도구를 만들어 쓸 수도.' },
    buyerPower: { score: 3, rationale: 'B2B는 갱신 거부 위협, B2C는 SaaS 피로감.' },
    supplierPower: { score: 2, rationale: '클라우드·LLM API 공급은 다양해 가격 협상 가능.' },
    pressure: 0,
  },
  app: {
    rivalry: { score: 5, rationale: '앱스토어 100만 개 + 사용자 피로감.' },
    newEntrants: { score: 5, rationale: '코딩 에이전트로 누구나 출시.' },
    substitutes: { score: 3, rationale: '웹앱·PWA·미니앱이 대체.' },
    buyerPower: { score: 4, rationale: '사용자가 무료 대안을 즉시 찾음.' },
    supplierPower: { score: 4, rationale: 'iOS·Android 수수료 30%, EU 일부 변동 중.' },
    pressure: 0,
  },
  agent: {
    rivalry: { score: 4, rationale: 'GPT·Claude·Gemini·Grok 동시 진입.' },
    newEntrants: { score: 5, rationale: 'API 호출만 있으면 시작 가능.' },
    substitutes: { score: 3, rationale: '범용 모델이 직접 도구 호출.' },
    buyerPower: { score: 3, rationale: '엔터프라이즈는 협상력 강함, 개발자는 가격 민감.' },
    supplierPower: { score: 5, rationale: 'OpenAI·Anthropic·Google이 사실상 독점 공급.' },
    pressure: 0,
  },
  content: {
    rivalry: { score: 5, rationale: 'AI 생성물 무제한 공급.' },
    newEntrants: { score: 5, rationale: '진입 장벽 거의 없음.' },
    substitutes: { score: 4, rationale: 'YouTube·SNS 무료 콘텐츠.' },
    buyerPower: { score: 4, rationale: '독자가 무한히 갈아타기 가능.' },
    supplierPower: { score: 2, rationale: '플랫폼 수수료 정도.' },
    pressure: 0,
  },
  commerce: {
    rivalry: { score: 5, rationale: '쿠팡·네이버 + 알리·테무 압박.' },
    newEntrants: { score: 4, rationale: 'Shopify·Cafe24로 진입 쉬움.' },
    substitutes: { score: 3, rationale: '오프라인·중고·구독.' },
    buyerPower: { score: 5, rationale: '가격 비교 즉시. 충성도 낮음.' },
    supplierPower: { score: 3, rationale: '카테고리별 다름.' },
    pressure: 0,
  },
};

type Region = EnvironmentInput['region'];

const MEGA_TRENDS: {
  title: string;
  body: string;
  tone: 'tail' | 'head';
  relevant: Category[];
  /** Regions where this trend is salient. `undefined` = both. */
  regions?: Region[];
}[] = [
  {
    title: '바이브 코딩 폭발',
    body: '비전공자도 AI 도구로 풀스택 앱 출시. 공급 폭증 → 차별화·증빙·신뢰가 결정 요인.',
    tone: 'tail',
    relevant: ['saas', 'app', 'agent', 'content', 'commerce'],
  },
  {
    title: 'AI 인프라 비용 1/10',
    body: 'GPT/Claude/Gemini 토큰 단가 매년 절반. AI 기능 자체로 차별화 어려움.',
    tone: 'head',
    relevant: ['saas', 'agent'],
  },
  {
    title: '에이전트 by-default',
    body: '사용자가 직접 도구를 쓰는 게 아니라 에이전트가 도구를 호출. WebMCP·MCP가 표준.',
    tone: 'tail',
    relevant: ['saas', 'agent'],
  },
  {
    title: '신뢰·증빙·라이선스 기반 차별화',
    body: 'AI 결과의 근거 표기, 평가 점수, 라이선싱이 신규 차별화 축.',
    tone: 'tail',
    relevant: ['saas', 'agent', 'content'],
  },
  {
    title: '첫 30초의 가치',
    body: '쇼츠 시대의 사용 행태가 모든 카테고리에 전이. 온보딩 속도가 곧 전환.',
    tone: 'head',
    relevant: ['app', 'content', 'commerce'],
  },
  // Region-specific trends.
  {
    title: '국내 인앱결제법·플랫폼법 수혜',
    body: '한국은 인앱결제 우회·자체 결제 허용 흐름. 결제 수수료 30% → 협상 가능. 단, 광고/콘텐츠 규제 강화도 동시.',
    tone: 'tail',
    relevant: ['app', 'content', 'commerce'],
    regions: ['kr'],
  },
  {
    title: 'EU AI Act 글로벌 표준화',
    body: '글로벌 출시 시 고위험 AI 시스템은 투명성·로깅·평가 의무. 컴플라이언스 비용 발생.',
    tone: 'head',
    relevant: ['saas', 'agent'],
    regions: ['global'],
  },
  {
    title: '글로벌 SaaS 가격 압축',
    body: '글로벌 진출 시 PPP 기반 가격 차등 + LATAM·인도 시장 폭발. 단가는 내려가지만 사용자 풀이 10배.',
    tone: 'tail',
    relevant: ['saas', 'agent', 'content'],
    regions: ['global'],
  },
];

/**
 * Stage-of-life headwinds — pre-launch과 5년 이상은 전혀 다른 판이다.
 * 슬라이드의 정형 PEST에는 없지만, 메이커 자가진단에선 큰 신호.
 */
function ageStageTrends(ageYears: number): { title: string; body: string; tone: 'tail' | 'head' }[] {
  if (ageYears <= 0) {
    return [
      {
        title: '출시 전 — 신뢰 자산 0',
        body: '인지도·후기·증빙이 모두 비어있는 상태. 첫 100명의 코호트 데이터를 빠르게 만드는 것이 모든 분석보다 우선.',
        tone: 'head',
      },
    ];
  }
  if (ageYears >= 5) {
    return [
      {
        title: '5년+ — 레거시 부채 누적',
        body: '초기 의사결정의 흔적이 코드·고객·계약에 굳어있음. 신규 진입자가 「깨끗한 상태로 다시 시작」 우위를 잡음.',
        tone: 'head',
      },
    ];
  }
  return [];
}

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

export function analyzeEnvironment(input: EnvironmentInput): EnvironmentResult {
  const pest = PEST_SEED[input.category] ?? [];

  const baseForces = FORCES_SEED[input.category];
  const cdAdjust = (input.competitorDensity - 3) * 0.5;
  const regAdjust = (input.regulatoryRisk - 3) * 0.5;

  const adjusted: FiveForces = {
    rivalry: { ...baseForces.rivalry, score: clamp(baseForces.rivalry.score + cdAdjust, 1, 5) },
    newEntrants: { ...baseForces.newEntrants, score: clamp(baseForces.newEntrants.score + cdAdjust * 0.5, 1, 5) },
    substitutes: { ...baseForces.substitutes, score: clamp(baseForces.substitutes.score, 1, 5) },
    buyerPower: { ...baseForces.buyerPower, score: clamp(baseForces.buyerPower.score, 1, 5) },
    supplierPower: { ...baseForces.supplierPower, score: clamp(baseForces.supplierPower.score + regAdjust * 0.3, 1, 5) },
    pressure: 0,
  };
  adjusted.pressure =
    (adjusted.rivalry.score +
      adjusted.newEntrants.score +
      adjusted.substitutes.score +
      adjusted.buyerPower.score +
      adjusted.supplierPower.score) /
    5;

  const baseTrends = MEGA_TRENDS.filter(
    (t) => t.relevant.includes(input.category) && (!t.regions || t.regions.includes(input.region)),
  ).map(({ title, body, tone }) => ({ title, body, tone }));

  const megaTrends = [...baseTrends, ...ageStageTrends(input.ageYears)];

  const tailwinds = pest.filter((p) => p.signal > 0).length;
  const headwinds = pest.filter((p) => p.signal < 0).length;
  const regionLabel = input.region === 'kr' ? '국내' : '글로벌';
  const summary =
    adjusted.pressure >= 4
      ? `${regionLabel} 시장 압력 ${adjusted.pressure.toFixed(1)}/5 — 매우 빡빡한 환경. 차별화 축 1개로는 부족.`
      : adjusted.pressure >= 3
        ? `${regionLabel} 시장 압력 ${adjusted.pressure.toFixed(1)}/5 — 평균 이상. ${tailwinds}개 호재로 ${headwinds}개 역풍 상쇄 가능.`
        : `${regionLabel} 시장 압력 ${adjusted.pressure.toFixed(1)}/5 — 상대적으로 좋음. 호재 ${tailwinds}개 활용 권장.`;

  return { pest, forces: adjusted, megaTrends, summary };
}

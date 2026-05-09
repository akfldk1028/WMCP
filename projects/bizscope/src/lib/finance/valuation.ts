/**
 * Maker-friendly valuation engine.
 * Pure functions — runs entirely in the browser.
 * No external API calls, no server dependencies.
 *
 * Source basis: 서강대 이석근 교수, "재무 (기업가치 평가를 중심으로)" handout.
 * NPV / IRR / DCF / Terminal value / Multiple-based valuation.
 */

export type Category = 'saas' | 'app' | 'content' | 'commerce' | 'agent';

export interface ValuationInput {
  category: Category;
  /** Monthly Active Users */
  mau: number;
  /** Monthly Recurring Revenue (KRW) */
  mrr: number;
  /** Monthly churn rate (0~1). e.g. 0.05 = 5% churn. */
  monthlyChurn: number;
  /** Customer Acquisition Cost (KRW per user). */
  cac: number;
  /** Average Revenue Per User per month (KRW). */
  arpu: number;
  /** Monthly growth rate (0~1). e.g. 0.10 = 10%/mo. */
  monthlyGrowth: number;
  /** Gross margin (0~1). e.g. 0.7 = 70%. */
  grossMargin: number;
}

export interface ValuationResult {
  arr: number;
  /** Customer lifetime value (KRW). */
  ltv: number;
  /** LTV / CAC ratio. ∞ when CAC is 0. */
  ltvToCac: number;
  /** Annual growth rate (0~1) — derived from monthlyGrowth. */
  annualGrowth: number;
  /** 5-year FCF projection (nominal KRW per year). */
  fcfProjection: number[];
  /** DCF-based valuation (KRW). */
  dcfValuation: number;
  /** Multiple-based valuation (KRW) using ARR × adjusted multiple. */
  multipleValuation: number;
  /** Multiple actually applied. */
  multipleApplied: number;
  /** Recommended valuation range (60% / 100% / 140% of midpoint). */
  range: { low: number; mid: number; high: number };
  /** Confidence score 0~100 — how reliable the inputs look. */
  confidence: number;
  /** Plain-language signals to surface in the UI. */
  signals: Signal[];
}

export interface Signal {
  level: 'good' | 'warn' | 'bad';
  message: string;
}

/** Discount rate used for DCF (proxy for WACC for early-stage makers). */
export const DEFAULT_DISCOUNT_RATE = 0.15;
/** Years projected explicitly before terminal value. */
export const PROJECTION_YEARS = 5;
/** Terminal value perpetuity growth rate. */
export const TERMINAL_GROWTH = 0.03;

/**
 * Category baseline ARR multiples, calibrated against public SaaS comps and
 * the workshop ranges in the source handout. Growth/churn adjust this number.
 */
const BASE_MULTIPLE: Record<Category, number> = {
  saas: 6,
  app: 4,
  content: 3,
  commerce: 2,
  agent: 8,
};

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));
const safe = (n: number): number => (Number.isFinite(n) ? n : 0);

export function annualizeGrowth(monthly: number): number {
  return Math.pow(1 + monthly, 12) - 1;
}

/**
 * LTV under simple geometric retention:
 *   LTV = ARPU × grossMargin / monthlyChurn
 * Returns 0 when churn is 0 (effectively infinite — caller decides UX).
 */
export function computeLtv(arpu: number, grossMargin: number, monthlyChurn: number): number {
  if (monthlyChurn <= 0) return 0;
  return safe((arpu * grossMargin) / monthlyChurn);
}

/**
 * Five-year FCF projection.
 * FCF_y = ARR × (1+g)^y × margin, capped to keep growth realistic
 * (annual growth clamped to [0, 3.0] = 300%/yr to avoid hockey-stick blowups).
 */
export function projectFcf(arr: number, annualGrowth: number, margin: number): number[] {
  const g = clamp(annualGrowth, 0, 3.0);
  const m = clamp(margin, 0, 0.95);
  const years: number[] = [];
  for (let y = 1; y <= PROJECTION_YEARS; y++) {
    years.push(safe(arr * Math.pow(1 + g, y) * m));
  }
  return years;
}

/**
 * DCF with Gordon-growth terminal value:
 *   DCF = Σ FCF_y / (1+r)^y + (FCF_N × (1+gT)) / (r - gT) / (1+r)^N
 */
export function computeDcf(fcf: number[], discount: number, terminalGrowth: number): number {
  if (fcf.length === 0) return 0;
  const r = clamp(discount, 0.05, 0.5);
  const gT = clamp(terminalGrowth, 0, r - 0.01);
  let pv = 0;
  fcf.forEach((cf, i) => {
    const year = i + 1;
    pv += cf / Math.pow(1 + r, year);
  });
  const last = fcf[fcf.length - 1];
  const terminal = (last * (1 + gT)) / (r - gT);
  pv += terminal / Math.pow(1 + r, fcf.length);
  return safe(pv);
}

/**
 * Adjusted ARR multiple:
 *   base × (1 + growth_uplift) × (1 - churn_penalty)
 * Growth uplift: +50% per 100% annual growth, capped at +200%.
 * Churn penalty: 8x monthly churn rate, capped at 80%.
 */
export function computeMultiple(category: Category, annualGrowth: number, monthlyChurn: number): number {
  const base = BASE_MULTIPLE[category] ?? 4;
  const growthUplift = clamp(annualGrowth * 0.5, 0, 2.0);
  const churnPenalty = clamp(monthlyChurn * 8, 0, 0.8);
  return safe(base * (1 + growthUplift) * (1 - churnPenalty));
}

export function computeConfidence(input: ValuationInput): number {
  let score = 100;
  if (input.mrr <= 0) score -= 35;
  if (input.mau <= 0) score -= 15;
  if (input.monthlyChurn <= 0 || input.monthlyChurn > 0.5) score -= 15;
  if (input.cac < 0) score -= 10;
  if (input.arpu <= 0) score -= 10;
  if (input.grossMargin <= 0 || input.grossMargin > 0.95) score -= 10;
  if (input.monthlyGrowth < -0.5 || input.monthlyGrowth > 1.0) score -= 10;
  return clamp(score, 0, 100);
}

function buildSignals(input: ValuationInput, result: Omit<ValuationResult, 'signals' | 'range'>): Signal[] {
  const out: Signal[] = [];
  if (result.ltvToCac >= 3) {
    out.push({ level: 'good', message: `LTV/CAC ${result.ltvToCac.toFixed(1)}x — 건강한 단위경제` });
  } else if (input.cac > 0 && result.ltvToCac > 0) {
    out.push({ level: 'warn', message: `LTV/CAC ${result.ltvToCac.toFixed(1)}x — 3x 미만, 회수 어려움` });
  }
  if (input.monthlyChurn >= 0.1) {
    out.push({ level: 'bad', message: `월 이탈률 ${(input.monthlyChurn * 100).toFixed(1)}% — 가치 큰 폭 할인` });
  } else if (input.monthlyChurn > 0 && input.monthlyChurn < 0.03) {
    out.push({ level: 'good', message: `월 이탈률 ${(input.monthlyChurn * 100).toFixed(1)}% — 우수` });
  }
  if (result.annualGrowth >= 1.0) {
    out.push({ level: 'good', message: `연 성장 ${(result.annualGrowth * 100).toFixed(0)}% — Premium multiple 적용` });
  } else if (result.annualGrowth < 0.2 && input.mrr > 0) {
    out.push({ level: 'warn', message: `연 성장 ${(result.annualGrowth * 100).toFixed(0)}% — 성장 둔화` });
  }
  if (input.grossMargin < 0.4 && input.mrr > 0) {
    out.push({ level: 'warn', message: `마진 ${(input.grossMargin * 100).toFixed(0)}% — 구조적 개선 필요` });
  }
  return out;
}

export function valuate(input: ValuationInput): ValuationResult {
  const arr = safe(input.mrr * 12);
  const ltv = computeLtv(input.arpu, input.grossMargin, input.monthlyChurn);
  const ltvToCac = input.cac > 0 ? safe(ltv / input.cac) : 0;
  const annualGrowth = annualizeGrowth(input.monthlyGrowth);
  const fcfProjection = projectFcf(arr, annualGrowth, input.grossMargin);
  const dcfValuation = computeDcf(fcfProjection, DEFAULT_DISCOUNT_RATE, TERMINAL_GROWTH);
  const multipleApplied = computeMultiple(input.category, annualGrowth, input.monthlyChurn);
  const multipleValuation = safe(arr * multipleApplied);
  const mid = (dcfValuation + multipleValuation) / 2;
  const partial: Omit<ValuationResult, 'signals' | 'range'> = {
    arr,
    ltv,
    ltvToCac,
    annualGrowth,
    fcfProjection,
    dcfValuation,
    multipleValuation,
    multipleApplied,
    confidence: computeConfidence(input),
  };
  return {
    ...partial,
    range: { low: mid * 0.6, mid, high: mid * 1.4 },
    signals: buildSignals(input, partial),
  };
}

export function formatKrw(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '0원';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}조원`;
  if (abs >= 1e8) return `${(n / 1e8).toFixed(2)}억원`;
  if (abs >= 1e4) return `${(n / 1e4).toFixed(0)}만원`;
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

const VALID_CATEGORIES: Category[] = ['saas', 'app', 'content', 'commerce', 'agent'];

/**
 * Coerce arbitrary parsed JSON (typically from localStorage written by an
 * older build, another tab, or a curious user via DevTools) into a clean
 * ValuationInput. Anything missing or non-numeric falls back to safe defaults.
 * Treat this as the only legitimate way to hydrate input from untrusted JSON.
 */
export function safeParseValuationInput(raw: unknown, fallback: ValuationInput): ValuationInput {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;
  const num = (v: unknown, def: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };
  const cat = obj.category;
  return {
    category: VALID_CATEGORIES.includes(cat as Category) ? (cat as Category) : fallback.category,
    mau: num(obj.mau, fallback.mau),
    mrr: num(obj.mrr, fallback.mrr),
    monthlyChurn: num(obj.monthlyChurn, fallback.monthlyChurn),
    cac: num(obj.cac, fallback.cac),
    arpu: num(obj.arpu, fallback.arpu),
    monthlyGrowth: num(obj.monthlyGrowth, fallback.monthlyGrowth),
    grossMargin: num(obj.grossMargin, fallback.grossMargin),
  };
}
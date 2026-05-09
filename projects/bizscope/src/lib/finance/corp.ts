/**
 * Corporate finance primitives — NPV / IRR / WACC / Terminal Value.
 * Mirrors the formulas in 「재무 101」 and 「재무 (기업가치 평가를 중심으로)」
 * by 서강대 이석근 교수. All pure, all client-side.
 */

export interface CashflowRow {
  /** Year index (0-based, 0 = today / time of investment). */
  t: number;
  /** Nominal cash flow at time t (negative = outflow). */
  cf: number;
}

/** NPV = Σ CF_t / (1+r)^t. Time index taken from the row's `t`. */
export function npv(rate: number, rows: CashflowRow[]): number {
  if (rate <= -1) return Number.NaN;
  let sum = 0;
  for (const { t, cf } of rows) {
    sum += cf / Math.pow(1 + rate, t);
  }
  return sum;
}

/** Per-row PV table — useful for showing the full DCF table to the user. */
export function pvTable(rate: number, rows: CashflowRow[]): { t: number; cf: number; df: number; pv: number }[] {
  return rows.map(({ t, cf }) => {
    const df = Math.pow(1 + rate, t);
    return { t, cf, df, pv: cf / df };
  });
}

/**
 * IRR via bisection — robust enough for the kinds of cash-flow shapes used in
 * the handouts (one initial outflow followed by inflows). Returns NaN when no
 * sign change exists in the search interval.
 */
export function irr(rows: CashflowRow[], options: { lo?: number; hi?: number; tol?: number; maxIter?: number } = {}): number {
  const lo = options.lo ?? -0.9;
  const hi = options.hi ?? 5;
  const tol = options.tol ?? 1e-6;
  const maxIter = options.maxIter ?? 200;
  let a = lo;
  let b = hi;
  let fa = npv(a, rows);
  let fb = npv(b, rows);
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return Number.NaN;
  // Handle exact-zero endpoints — rare but possible on contrived flows.
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) return Number.NaN;
  for (let i = 0; i < maxIter; i++) {
    const m = (a + b) / 2;
    const fm = npv(m, rows);
    if (!Number.isFinite(fm)) return Number.NaN;
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return m;
    if (fa * fm < 0) {
      b = m;
      fb = fm;
    } else {
      a = m;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

export interface WaccInput {
  /** Market value of equity. */
  E: number;
  /** Market value of debt. */
  D: number;
  /** Cost of equity (decimal, e.g. 0.10 = 10%). */
  Re: number;
  /** Pre-tax cost of debt (decimal). */
  Rd: number;
  /** Corporate tax rate (decimal). */
  t: number;
}

export interface WaccResult {
  weightE: number;
  weightD: number;
  afterTaxRd: number;
  wacc: number;
}

/** WACC = (E/V) × Re + (D/V) × Rd × (1 − t). Matches handout slide 13/14. */
export function wacc({ E, D, Re, Rd, t }: WaccInput): WaccResult {
  const V = E + D;
  if (V <= 0) return { weightE: 0, weightD: 0, afterTaxRd: 0, wacc: 0 };
  const weightE = E / V;
  const weightD = D / V;
  const afterTaxRd = Rd * (1 - t);
  return {
    weightE,
    weightD,
    afterTaxRd,
    wacc: weightE * Re + weightD * afterTaxRd,
  };
}

export type TerminalMethod =
  | 'growing-perpetuity'
  | 'value-driver'
  | 'convergence'
  | 'aggressive'
  | 'pe-multiple'
  | 'ebitda-multiple';

export interface TerminalInput {
  method: TerminalMethod;
  fcfNext?: number;
  noplat?: number;
  netIncome?: number;
  ebitda?: number;
  waccRate?: number;
  growth?: number;
  roic?: number;
  peMultiple?: number;
  ebitdaMultiple?: number;
}

/**
 * Terminal value — six of the eight methods listed in slide 16 of
 * 재무_기업가치 (the two "Others" approaches are case-specific and not modeled).
 *
 * Returns NaN (not 0 or Infinity) when the inputs are mathematically invalid
 * (e.g. WACC ≤ 0). Caller-side `formatKrwCompact` renders NaN as `—`, which
 * is safer for a maker-tool than silently lying with a finite-but-wrong number.
 */
export function terminalValue(input: TerminalInput): number {
  const { method } = input;
  switch (method) {
    case 'growing-perpetuity': {
      const { fcfNext = 0, waccRate = 0.1, growth = 0 } = input;
      if (waccRate <= 0) return Number.NaN;
      if (waccRate <= growth) return fcfNext / waccRate;
      return fcfNext / (waccRate - growth);
    }
    case 'value-driver': {
      const { noplat = 0, waccRate = 0.1, growth = 0, roic = 0.1 } = input;
      if (waccRate <= 0 || roic <= 0 || waccRate <= growth) return Number.NaN;
      return (noplat * (1 - growth / roic)) / (waccRate - growth);
    }
    case 'convergence': {
      const { noplat = 0, waccRate = 0.1 } = input;
      if (waccRate <= 0) return Number.NaN;
      return noplat / waccRate;
    }
    case 'aggressive': {
      const { noplat = 0, waccRate = 0.1, growth = 0 } = input;
      if (waccRate <= 0 || waccRate <= growth) return Number.NaN;
      return noplat / (waccRate - growth);
    }
    case 'pe-multiple': {
      const { netIncome = 0, peMultiple = 0 } = input;
      return netIncome * peMultiple;
    }
    case 'ebitda-multiple': {
      const { ebitda = 0, ebitdaMultiple = 0 } = input;
      return ebitda * ebitdaMultiple;
    }
    default:
      return 0;
  }
}

/** CAGR over (n) periods given first and last values. Slide 21 of 재무_기업가치. */
export function cagr(first: number, last: number, periods: number): number {
  if (first <= 0 || periods <= 0) return 0;
  if (last < 0) return 0;
  return Math.pow(last / first, 1 / periods) - 1;
}

/** PER-based valuation — earnings × multiple. */
export function perValuation(netIncome: number, peer: number): number {
  return netIncome * peer;
}

/** PBR-based valuation — book equity × multiple. */
export function pbrValuation(bookEquity: number, peer: number): number {
  return bookEquity * peer;
}

/** PSR-based valuation — revenue × multiple. */
export function psrValuation(revenue: number, peer: number): number {
  return revenue * peer;
}

/** EV/EBITDA-based valuation — EBITDA × peer multiple, less net debt = equity value. */
export function evEbitdaValuation(ebitda: number, peer: number, netDebt: number): number {
  return ebitda * peer - netDebt;
}

/** Format KRW in Korean units (만 / 억 / 조). Mirrors lib/finance/valuation:formatKrw. */
export function formatKrwCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n < 0) return `−${formatKrwCompact(-n)}`;
  if (n === 0) return '0원';
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}조원`;
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)}억원`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)}만원`;
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

/** Format a decimal as a percentage with given fractional digits. */
export function formatPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(digits)}%`;
}

import { describe, expect, it } from 'vitest';
import {
  cagr,
  evEbitdaValuation,
  irr,
  npv,
  pbrValuation,
  perValuation,
  psrValuation,
  pvTable,
  terminalValue,
  wacc,
} from './corp';

describe('npv', () => {
  it('matches handout slide 4 — invest 1000, +500 for 3 years at 12%', () => {
    const v = npv(0.12, [
      { t: 0, cf: -1000 },
      { t: 1, cf: 500 },
      { t: 2, cf: 500 },
      { t: 3, cf: 500 },
    ]);
    // Handout rounds to ~200; allow ±5 for rounding of discount factors
    expect(v).toBeGreaterThan(195);
    expect(v).toBeLessThan(205);
  });

  it('zero NPV when discount equals IRR', () => {
    const flows = [
      { t: 0, cf: -1000 },
      { t: 1, cf: 1100 },
    ];
    expect(npv(0.1, flows)).toBeCloseTo(0, 6);
  });
});

describe('pvTable', () => {
  it('produces a row per cash flow with discount factor and PV', () => {
    const rows = pvTable(0.1, [
      { t: 0, cf: -100 },
      { t: 1, cf: 110 },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[1].df).toBeCloseTo(1.1, 6);
    expect(rows[1].pv).toBeCloseTo(100, 6);
  });
});

describe('irr', () => {
  it('matches handout slide 7 — 1000/500/500/500 → ~23.4%', () => {
    const r = irr([
      { t: 0, cf: -1000 },
      { t: 1, cf: 500 },
      { t: 2, cf: 500 },
      { t: 3, cf: 500 },
    ]);
    expect(r).toBeGreaterThan(0.23);
    expect(r).toBeLessThan(0.24);
  });

  it('matches a simple 1-period case', () => {
    const r = irr([
      { t: 0, cf: -100 },
      { t: 1, cf: 110 },
    ]);
    expect(r).toBeCloseTo(0.1, 5);
  });

  it('returns NaN when there is no sign change', () => {
    const r = irr([
      { t: 0, cf: 100 },
      { t: 1, cf: 200 },
    ]);
    expect(Number.isNaN(r)).toBe(true);
  });
});

describe('wacc', () => {
  it('matches handout slide 13 — 70/30 capital, 10% Re, 5% Rd*(1-t implicit) → 8.5%', () => {
    // The slide explicitly shows WACC = 70%×10% + 30%×5% = 8.5% (no tax shield in that simplification)
    const w = wacc({ E: 70, D: 30, Re: 0.1, Rd: 0.05, t: 0 });
    expect(w.wacc).toBeCloseTo(0.085, 4);
    expect(w.weightE).toBeCloseTo(0.7, 6);
    expect(w.weightD).toBeCloseTo(0.3, 6);
  });

  it('applies tax shield on debt', () => {
    const w = wacc({ E: 70, D: 30, Re: 0.1, Rd: 0.05, t: 0.25 });
    // After-tax Rd = 5% × 0.75 = 3.75%; WACC = 70%×10% + 30%×3.75% = 8.125%
    expect(w.wacc).toBeCloseTo(0.08125, 5);
  });

  it('returns zero on empty capital structure', () => {
    expect(wacc({ E: 0, D: 0, Re: 0.1, Rd: 0.05, t: 0.25 }).wacc).toBe(0);
  });
});

describe('terminalValue', () => {
  it('growing-perpetuity matches the handout (FCF/(WACC-g))', () => {
    expect(terminalValue({ method: 'growing-perpetuity', fcfNext: 100, waccRate: 0.1, growth: 0.03 })).toBeCloseTo(100 / 0.07, 4);
  });

  it('falls back to FCF/WACC when g >= WACC (slide 21 note)', () => {
    expect(terminalValue({ method: 'growing-perpetuity', fcfNext: 100, waccRate: 0.05, growth: 0.08 })).toBeCloseTo(100 / 0.05, 4);
  });

  it('value-driver formula uses ROIC adjustment', () => {
    const tv = terminalValue({ method: 'value-driver', noplat: 100, waccRate: 0.1, growth: 0.03, roic: 0.15 });
    // (100 × (1 - 0.03/0.15)) / (0.10 - 0.03) = 80 / 0.07
    expect(tv).toBeCloseTo(80 / 0.07, 3);
  });

  it('convergence collapses to NOPLAT/WACC', () => {
    expect(terminalValue({ method: 'convergence', noplat: 100, waccRate: 0.1 })).toBeCloseTo(1000, 3);
  });

  it('multiple-based methods multiply directly', () => {
    expect(terminalValue({ method: 'pe-multiple', netIncome: 100, peMultiple: 20 })).toBe(2000);
    expect(terminalValue({ method: 'ebitda-multiple', ebitda: 100, ebitdaMultiple: 9 })).toBe(900);
  });
});

describe('cagr', () => {
  it('two-year doubling = ~41.4%', () => {
    expect(cagr(100, 200, 2)).toBeCloseTo(Math.SQRT2 - 1, 6);
  });

  it('returns 0 on bad inputs', () => {
    expect(cagr(0, 200, 2)).toBe(0);
    expect(cagr(100, -200, 2)).toBe(0);
  });
});

describe('multiple-method valuations', () => {
  it('PER × earnings — slide 8 example: 90,648 × 20 = 1,812,960', () => {
    expect(perValuation(90_648, 20)).toBe(1_812_960);
  });
  it('PBR × book equity — slide 9 example: 776,285 × 1.5 ≈ 1,164,427', () => {
    expect(pbrValuation(776_285, 1.5)).toBeCloseTo(1_164_427.5, 1);
  });
  it('PSR × revenue', () => {
    expect(psrValuation(220_330, 0.18)).toBeCloseTo(39_659.4, 1);
  });
  it('EV/EBITDA × EBITDA − net debt', () => {
    // EV = 12_234 × 9.54 ≈ 116_712; equity = EV − 49_760
    expect(evEbitdaValuation(12_234, 9.54, 49_760)).toBeCloseTo(116_712.36 - 49_760, 1);
  });
});

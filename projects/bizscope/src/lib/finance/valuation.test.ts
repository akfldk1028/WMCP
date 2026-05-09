import { describe, it, expect } from 'vitest';
import {
  annualizeGrowth,
  computeDcf,
  computeLtv,
  computeMultiple,
  formatKrw,
  projectFcf,
  valuate,
  PROJECTION_YEARS,
} from './valuation';

describe('annualizeGrowth', () => {
  it('compounds monthly to annual', () => {
    expect(annualizeGrowth(0)).toBe(0);
    expect(annualizeGrowth(0.1)).toBeCloseTo(2.1384, 3);
  });
});

describe('computeLtv', () => {
  it('returns ARPU × margin / churn', () => {
    expect(computeLtv(10000, 0.7, 0.05)).toBeCloseTo(140000, 0);
  });
  it('returns 0 for zero churn (UI handles infinite case)', () => {
    expect(computeLtv(10000, 0.7, 0)).toBe(0);
  });
});

describe('projectFcf', () => {
  it('projects exactly PROJECTION_YEARS years', () => {
    expect(projectFcf(1_000_000, 0.5, 0.7)).toHaveLength(PROJECTION_YEARS);
  });
  it('grows year over year when growth is positive', () => {
    const fcf = projectFcf(1_000_000, 0.5, 0.7);
    for (let i = 1; i < fcf.length; i++) {
      expect(fcf[i]).toBeGreaterThan(fcf[i - 1]);
    }
  });
  it('clamps unrealistic growth to prevent blowup', () => {
    const insane = projectFcf(1_000_000, 100, 0.7);
    expect(Number.isFinite(insane[insane.length - 1])).toBe(true);
  });
});

describe('computeDcf', () => {
  it('discounts future cash flows below their nominal sum', () => {
    const fcf = [100, 100, 100, 100, 100];
    const nominal = fcf.reduce((a, b) => a + b, 0);
    const dcf = computeDcf(fcf, 0.15, 0.03);
    expect(dcf).toBeGreaterThan(nominal);
    expect(dcf).toBeLessThan(nominal * 5);
  });
  it('returns 0 for empty cash flows', () => {
    expect(computeDcf([], 0.15, 0.03)).toBe(0);
  });
});

describe('computeMultiple', () => {
  it('applies growth uplift', () => {
    const slow = computeMultiple('saas', 0.1, 0.02);
    const fast = computeMultiple('saas', 1.5, 0.02);
    expect(fast).toBeGreaterThan(slow);
  });
  it('applies churn penalty', () => {
    const healthy = computeMultiple('saas', 0.5, 0.02);
    const leaky = computeMultiple('saas', 0.5, 0.1);
    expect(leaky).toBeLessThan(healthy);
  });
  it('agent category gets premium baseline', () => {
    expect(computeMultiple('agent', 0.5, 0.02)).toBeGreaterThan(computeMultiple('content', 0.5, 0.02));
  });
});

describe('valuate (integration)', () => {
  const baseInput = {
    category: 'saas' as const,
    mau: 5000,
    mrr: 10_000_000,
    monthlyChurn: 0.03,
    cac: 50_000,
    arpu: 20_000,
    monthlyGrowth: 0.08,
    grossMargin: 0.7,
  };

  it('produces consistent valuation for healthy SaaS', () => {
    const v = valuate(baseInput);
    expect(v.arr).toBe(120_000_000);
    expect(v.dcfValuation).toBeGreaterThan(0);
    expect(v.multipleValuation).toBeGreaterThan(0);
    expect(v.range.low).toBeLessThan(v.range.mid);
    expect(v.range.mid).toBeLessThan(v.range.high);
  });

  it('penalizes high churn in signals', () => {
    const v = valuate({ ...baseInput, monthlyChurn: 0.15 });
    expect(v.signals.some((s) => s.level === 'bad')).toBe(true);
  });

  it('confidence drops when MRR is missing', () => {
    const healthy = valuate(baseInput);
    const bad = valuate({ ...baseInput, mrr: 0 });
    expect(bad.confidence).toBeLessThan(healthy.confidence);
  });

  it('never returns NaN on garbage input', () => {
    const v = valuate({
      category: 'app',
      mau: 0,
      mrr: 0,
      monthlyChurn: 0,
      cac: 0,
      arpu: 0,
      monthlyGrowth: 0,
      grossMargin: 0,
    });
    expect(Number.isFinite(v.dcfValuation)).toBe(true);
    expect(Number.isFinite(v.multipleValuation)).toBe(true);
    expect(Number.isFinite(v.range.mid)).toBe(true);
  });
});

describe('formatKrw', () => {
  it('formats large numbers in Korean units', () => {
    expect(formatKrw(0)).toBe('0원');
    expect(formatKrw(50_000)).toContain('만원');
    expect(formatKrw(2_500_000_000)).toContain('억원');
    expect(formatKrw(1_500_000_000_000)).toContain('조원');
  });
});
import { describe, expect, it } from 'vitest';
import { analyzeEnvironment } from './environment';
import { synthesizeStrategy } from './strategy';

describe('analyzeEnvironment', () => {
  it('returns category-specific PEST seeds', () => {
    const r = analyzeEnvironment({
      category: 'agent',
      region: 'kr',
      competitorDensity: 3,
      regulatoryRisk: 3,
      ageYears: 1,
    });
    expect(r.pest.length).toBeGreaterThanOrEqual(4);
    expect(r.pest.every((p) => ['P', 'E', 'S', 'T'].includes(p.axis))).toBe(true);
  });

  it('5-forces pressure stays within [1..5]', () => {
    const r = analyzeEnvironment({
      category: 'saas',
      region: 'kr',
      competitorDensity: 5,
      regulatoryRisk: 5,
      ageYears: 0,
    });
    expect(r.forces.pressure).toBeGreaterThanOrEqual(1);
    expect(r.forces.pressure).toBeLessThanOrEqual(5);
  });

  it('higher competitor density → higher rivalry score', () => {
    const easy = analyzeEnvironment({
      category: 'saas',
      region: 'kr',
      competitorDensity: 1,
      regulatoryRisk: 1,
      ageYears: 0,
    });
    const hard = analyzeEnvironment({
      category: 'saas',
      region: 'kr',
      competitorDensity: 5,
      regulatoryRisk: 1,
      ageYears: 0,
    });
    expect(hard.forces.rivalry.score).toBeGreaterThan(easy.forces.rivalry.score);
  });

  it('mega-trends are filtered by category relevance', () => {
    const agent = analyzeEnvironment({
      category: 'agent',
      region: 'kr',
      competitorDensity: 3,
      regulatoryRisk: 3,
      ageYears: 1,
    });
    const commerce = analyzeEnvironment({
      category: 'commerce',
      region: 'kr',
      competitorDensity: 3,
      regulatoryRisk: 3,
      ageYears: 1,
    });
    expect(agent.megaTrends.some((t) => t.title.includes('에이전트'))).toBe(true);
    expect(commerce.megaTrends.some((t) => t.title.includes('에이전트'))).toBe(false);
  });
});

describe('synthesizeStrategy', () => {
  const baseInput = {
    category: 'saas' as const,
    productName: 'Test',
    strengths: ['빠른 배포', '강한 디자인'],
    weaknesses: ['마케팅 부재', '소규모 팀'],
    opportunities: ['에이전트 표준화', '바이브 코더 폭증'],
    threats: ['거대 SaaS 진입', '규제 강화'],
    stage: 'mvp' as const,
  };

  it('produces options in all 4 TOWS quadrants', () => {
    const r = synthesizeStrategy(baseInput);
    const quads = new Set(r.tows.map((o) => o.quadrant));
    expect(quads.has('SO')).toBe(true);
    expect(quads.has('WO')).toBe(true);
    expect(quads.has('ST')).toBe(true);
    expect(quads.has('WT')).toBe(true);
  });

  it('top moves are bounded to 3', () => {
    const r = synthesizeStrategy(baseInput);
    expect(r.topMoves.length).toBeLessThanOrEqual(3);
  });

  it('priority cells cover every TOWS option', () => {
    const r = synthesizeStrategy(baseInput);
    expect(r.priority.length).toBe(r.tows.length);
    const buckets = new Set(r.priority.map((p) => p.bucket));
    expect(buckets.size).toBeGreaterThan(0);
  });

  it('stage shifts emphasis — scale stage weights ST/WT higher', () => {
    const mvp = synthesizeStrategy({ ...baseInput, stage: 'mvp' });
    const scale = synthesizeStrategy({ ...baseInput, stage: 'scale' });
    const mvpStAvg = average(mvp.tows.filter((o) => o.quadrant === 'ST').map((o) => o.impact));
    const scaleStAvg = average(scale.tows.filter((o) => o.quadrant === 'ST').map((o) => o.impact));
    expect(scaleStAvg).toBeGreaterThanOrEqual(mvpStAvg);
  });

  it('handles empty input gracefully', () => {
    const r = synthesizeStrategy({
      ...baseInput,
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    });
    expect(r.tows).toHaveLength(0);
    expect(r.topMoves).toHaveLength(0);
  });
});

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

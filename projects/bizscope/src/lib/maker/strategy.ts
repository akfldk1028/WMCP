/**
 * Maker-friendly strategy synthesis — SWOT + TOWS Cross + Priority Matrix.
 * Pure client-side. Generates concrete strategic options from
 * lightweight maker-self-assessment inputs.
 */

import type { Category } from '@/lib/finance/valuation';

export type SwotItem = string;

export interface StrategyInput {
  category: Category;
  productName: string;
  /** Free-form maker self-assessment. */
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  /** Stage of the maker's product. */
  stage: 'prelaunch' | 'mvp' | 'pmf' | 'scale';
}

export type TowsQuadrant = 'SO' | 'WO' | 'ST' | 'WT';

export interface TowsOption {
  quadrant: TowsQuadrant;
  title: string;
  body: string;
  /** Combined inputs that produced this option. */
  derivedFrom: { s?: string; w?: string; o?: string; t?: string };
  impact: number; // 1..5
  effort: number; // 1..5
}

export interface PriorityCell {
  option: TowsOption;
  /** Quadrant in the priority matrix. */
  bucket: 'now' | 'plan' | 'maybe' | 'drop';
}

export interface StrategyResult {
  swot: {
    s: SwotItem[];
    w: SwotItem[];
    o: SwotItem[];
    t: SwotItem[];
  };
  tows: TowsOption[];
  priority: PriorityCell[];
  topMoves: TowsOption[];
  summary: string;
}

const STAGE_FOCUS: Record<StrategyInput['stage'], { description: string; soWeight: number; woWeight: number; stWeight: number; wtWeight: number }> = {
  prelaunch: { description: '출시 전 — 핵심 차별화 검증과 위협 회피가 우선', soWeight: 1.2, woWeight: 0.8, stWeight: 1.0, wtWeight: 1.4 },
  mvp: { description: 'MVP — PMF 향한 SO·ST가 핵심', soWeight: 1.4, woWeight: 1.0, stWeight: 1.2, wtWeight: 0.8 },
  pmf: { description: 'PMF 도달 — 약점 보강(WO)과 확장 SO 동시', soWeight: 1.2, woWeight: 1.4, stWeight: 1.0, wtWeight: 0.8 },
  scale: { description: '스케일 — 위협 방어(ST·WT) 중심', soWeight: 1.0, woWeight: 1.0, stWeight: 1.4, wtWeight: 1.2 },
};

const TEMPLATES: Record<TowsQuadrant, { titleTpl: string; bodyTpl: string }> = {
  SO: {
    titleTpl: '강점으로 기회를 잡는다 — {s} × {o}',
    bodyTpl: '{s}을(를) 활용해 {o} 흐름의 초기 진입자가 된다. 메이커 입장에서 가장 빠르게 효과 보는 조합.',
  },
  WO: {
    titleTpl: '기회를 빌려 약점을 메운다 — {w} × {o}',
    bodyTpl: '{o} 트렌드의 도구·파트너십을 활용해 {w}을(를) 보완. 직접 만들기보다 외부 자산을 빌리는 전략.',
  },
  ST: {
    titleTpl: '강점으로 위협을 막는다 — {s} × {t}',
    bodyTpl: '{t} 위협이 현실화되기 전에 {s}을(를) 무기로 방어선을 친다.',
  },
  WT: {
    titleTpl: '약점·위협 중첩을 회피한다 — {w} × {t}',
    bodyTpl: '{w}와 {t}이(가) 동시에 작동하면 가장 빠르게 침몰. 해당 영역에 자원을 투입하지 말고 회피·매각·축소.',
  },
};

const fill = (tpl: string, vars: Record<string, string>): string =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

function firstN<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

function categorySpecificImpact(input: StrategyInput, q: TowsQuadrant): number {
  const baseline: Record<TowsQuadrant, number> = { SO: 4, WO: 3, ST: 3, WT: 2 };
  const stage = STAGE_FOCUS[input.stage];
  const weight = q === 'SO' ? stage.soWeight : q === 'WO' ? stage.woWeight : q === 'ST' ? stage.stWeight : stage.wtWeight;
  const impact = baseline[q] * weight;
  return Math.max(1, Math.min(5, Math.round(impact)));
}

function effortFor(q: TowsQuadrant): number {
  const map: Record<TowsQuadrant, number> = { SO: 3, WO: 4, ST: 3, WT: 2 };
  return map[q];
}

function priorityBucket(impact: number, effort: number): PriorityCell['bucket'] {
  if (impact >= 4 && effort <= 3) return 'now';
  if (impact >= 4 && effort > 3) return 'plan';
  if (impact < 4 && effort <= 3) return 'maybe';
  return 'drop';
}

export function synthesizeStrategy(input: StrategyInput): StrategyResult {
  const stage = STAGE_FOCUS[input.stage];

  const tows: TowsOption[] = [];
  firstN(input.strengths, 2).forEach((s) =>
    firstN(input.opportunities, 2).forEach((o) => {
      tows.push({
        quadrant: 'SO',
        title: fill(TEMPLATES.SO.titleTpl, { s, o }),
        body: fill(TEMPLATES.SO.bodyTpl, { s, o }),
        derivedFrom: { s, o },
        impact: categorySpecificImpact(input, 'SO'),
        effort: effortFor('SO'),
      });
    }),
  );
  firstN(input.weaknesses, 2).forEach((w) =>
    firstN(input.opportunities, 2).forEach((o) => {
      tows.push({
        quadrant: 'WO',
        title: fill(TEMPLATES.WO.titleTpl, { w, o }),
        body: fill(TEMPLATES.WO.bodyTpl, { w, o }),
        derivedFrom: { w, o },
        impact: categorySpecificImpact(input, 'WO'),
        effort: effortFor('WO'),
      });
    }),
  );
  firstN(input.strengths, 2).forEach((s) =>
    firstN(input.threats, 2).forEach((t) => {
      tows.push({
        quadrant: 'ST',
        title: fill(TEMPLATES.ST.titleTpl, { s, t }),
        body: fill(TEMPLATES.ST.bodyTpl, { s, t }),
        derivedFrom: { s, t },
        impact: categorySpecificImpact(input, 'ST'),
        effort: effortFor('ST'),
      });
    }),
  );
  firstN(input.weaknesses, 2).forEach((w) =>
    firstN(input.threats, 2).forEach((t) => {
      tows.push({
        quadrant: 'WT',
        title: fill(TEMPLATES.WT.titleTpl, { w, t }),
        body: fill(TEMPLATES.WT.bodyTpl, { w, t }),
        derivedFrom: { w, t },
        impact: categorySpecificImpact(input, 'WT'),
        effort: effortFor('WT'),
      });
    }),
  );

  const priority: PriorityCell[] = tows.map((option) => ({
    option,
    bucket: priorityBucket(option.impact, option.effort),
  }));

  const topMoves = priority
    .filter((p) => p.bucket === 'now')
    .map((p) => p.option)
    .sort((a, b) => b.impact - a.impact || a.effort - b.effort)
    .slice(0, 3);

  const summary =
    topMoves.length > 0
      ? `${stage.description}. 즉시 실행 후보 ${topMoves.length}개 제시.`
      : `${stage.description}. 입력값으로는 임팩트·실행난이도 모두 만족하는 즉시 실행 옵션이 부족 — 강점/기회를 더 구체화 필요.`;

  return {
    swot: {
      s: input.strengths,
      w: input.weaknesses,
      o: input.opportunities,
      t: input.threats,
    },
    tows,
    priority,
    topMoves,
    summary,
  };
}

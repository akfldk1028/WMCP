'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Crosshair, Sparkles, Target } from 'lucide-react';
import { synthesizeStrategy, type StrategyInput, type TowsQuadrant } from '@/lib/maker/strategy';
import type { Category } from '@/lib/finance/valuation';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'saas', label: 'SaaS' },
  { value: 'app', label: '앱/모바일' },
  { value: 'agent', label: 'AI 에이전트' },
  { value: 'content', label: '콘텐츠' },
  { value: 'commerce', label: '커머스' },
];

const STAGE_OPTIONS: { value: StrategyInput['stage']; label: string; sub: string }[] = [
  { value: 'prelaunch', label: '출시 전', sub: '아이디어 ~ 빌드 중' },
  { value: 'mvp', label: 'MVP', sub: '베타·초기 사용자' },
  { value: 'pmf', label: 'PMF 도달', sub: '재방문·구전 발생' },
  { value: 'scale', label: '스케일', sub: '성장 가속' },
];

const QUAD_LABEL: Record<TowsQuadrant, string> = {
  SO: 'SO · 강점 × 기회',
  WO: 'WO · 약점 × 기회',
  ST: 'ST · 강점 × 위협',
  WT: 'WT · 약점 × 위협',
};

const QUAD_TONE: Record<TowsQuadrant, string> = {
  SO: 'border-emerald-500/40 bg-emerald-500/5',
  WO: 'border-amber-500/40 bg-amber-500/5',
  ST: 'border-sky-500/40 bg-sky-500/5',
  WT: 'border-rose-500/40 bg-rose-500/5',
};

const BUCKET_LABEL: Record<'now' | 'plan' | 'maybe' | 'drop', string> = {
  now: 'NOW · 즉시',
  plan: 'PLAN · 계획',
  maybe: 'MAYBE · 보류',
  drop: 'DROP · 회피',
};

const BUCKET_TONE: Record<'now' | 'plan' | 'maybe' | 'drop', string> = {
  now: 'border-emerald-500 bg-emerald-500/10',
  plan: 'border-sky-500 bg-sky-500/10',
  maybe: 'border-amber-500 bg-amber-500/10',
  drop: 'border-rose-500/40 bg-rose-500/5',
};

const DEFAULT_INPUT: StrategyInput = {
  category: 'saas',
  productName: '',
  strengths: ['AI 통합 빠름', '직관적 UI'],
  weaknesses: ['1인 팀', '브랜드 인지도 없음'],
  opportunities: ['바이브 코더 폭증', 'WebMCP 표준화'],
  threats: ['경쟁 SaaS 폭증', 'LLM API 가격 변동'],
  stage: 'mvp',
};

export default function StrategyPage() {
  const [input, setInput] = useState<StrategyInput>(DEFAULT_INPUT);
  const result = useMemo(() => synthesizeStrategy(input), [input]);

  const updateList = (key: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', value: string) => {
    const lines = value.split('\n').map((s) => s.trim()).filter(Boolean);
    setInput((p) => ({ ...p, [key]: lines }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
              BizScope
            </Link>
            <span className="text-sm font-bold tracking-tight">
              <span className="text-sky-500">Strategy</span> Studio
            </span>
          </div>
          <nav className="flex gap-2 text-sm">
            <Link href="/environment" className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Environment
            </Link>
            <Link href="/finance" className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Finance
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <section className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <Target className="size-3.5 text-sky-500" />
            SWOT → TOWS Cross → Priority Matrix
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">바이브 코더의 전략 도출</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            SWOT 4개 항목만 채우면 TOWS Cross로 4가지 전략 옵션을 자동 조합하고, 임팩트·실행난이도 매트릭스로 우선순위까지
            제시합니다. 단계(MVP/PMF/Scale)에 따라 가중치 자동 조정.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Inputs */}
          <section className="space-y-6 rounded-2xl border bg-card p-6">
            <div>
              <h2 className="text-sm font-semibold">카테고리</h2>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORY_OPTIONS.map((opt) => {
                  const active = input.category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setInput((p) => ({ ...p, category: opt.value }))}
                      className={`rounded-lg border px-3 py-2 text-xs transition ${
                        active ? 'border-sky-500 bg-sky-500/10 text-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">단계</h2>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {STAGE_OPTIONS.map((s) => {
                  const active = input.stage === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setInput((p) => ({ ...p, stage: s.value }))}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                        active ? 'border-sky-500 bg-sky-500/10 text-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-semibold">{s.label}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{s.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <SwotField label="S — 강점" placeholder="우리만의 무기 (한 줄에 하나)" value={input.strengths.join('\n')} onChange={(v) => updateList('strengths', v)} />
            <SwotField label="W — 약점" placeholder="구조적 한계" value={input.weaknesses.join('\n')} onChange={(v) => updateList('weaknesses', v)} />
            <SwotField label="O — 기회" placeholder="시장 흐름·트렌드" value={input.opportunities.join('\n')} onChange={(v) => updateList('opportunities', v)} />
            <SwotField label="T — 위협" placeholder="외부 리스크" value={input.threats.join('\n')} onChange={(v) => updateList('threats', v)} />
          </section>

          {/* Results */}
          <section className="space-y-6">
            <div className="rounded-2xl border bg-gradient-to-br from-sky-500/5 to-indigo-500/5 p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-3.5" />
                요약
              </div>
              <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
              {result.topMoves.length > 0 ? (
                <ol className="mt-4 space-y-2">
                  {result.topMoves.map((m, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-semibold">{m.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{m.body}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold">SWOT 매트릭스</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['s', 'w', 'o', 't'] as const).map((key) => (
                  <article key={key} className="rounded-xl border bg-card p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                      {key.toUpperCase()}
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {result.swot[key].length === 0 ? <li className="italic">입력 없음</li> : null}
                      {result.swot[key].map((item, i) => (
                        <li key={i}>· {item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Crosshair className="size-4 text-sky-500" />
                TOWS Cross 전략 옵션 ({result.tows.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.tows.map((opt, i) => (
                  <article key={i} className={`rounded-xl border p-4 ${QUAD_TONE[opt.quadrant]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{QUAD_LABEL[opt.quadrant]}</span>
                      <span className="text-[10px] text-muted-foreground">
                        I {opt.impact}/5 · E {opt.effort}/5
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold leading-tight">{opt.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{opt.body}</p>
                  </article>
                ))}
                {result.tows.length === 0 ? (
                  <div className="col-span-2 rounded-xl border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                    SWOT 입력이 부족합니다. 좌측 4개 영역에 한 줄씩이라도 채워보세요.
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold">우선순위 매트릭스 (Impact × Effort)</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['now', 'plan', 'maybe', 'drop'] as const).map((bucket) => {
                  const cells = result.priority.filter((p) => p.bucket === bucket);
                  return (
                    <article key={bucket} className={`rounded-xl border p-4 ${BUCKET_TONE[bucket]}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider">{BUCKET_LABEL[bucket]}</div>
                      <ul className="mt-2 space-y-1 text-xs">
                        {cells.length === 0 ? <li className="italic text-muted-foreground">없음</li> : null}
                        {cells.map((c, i) => (
                          <li key={i}>· {c.option.title}</li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>

            <Link
              href="/finance"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              이 전략으로 가치는 얼마? — Finance로
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

function SwotField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (s: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="resize-none rounded-lg border bg-background px-3 py-2 text-xs leading-relaxed outline-none focus:border-sky-500"
      />
    </label>
  );
}

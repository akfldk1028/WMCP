'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Compass, Globe2, Sparkles } from 'lucide-react';
import { analyzeEnvironment, type EnvironmentInput } from '@/lib/maker/environment';
import type { Category } from '@/lib/finance/valuation';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'saas', label: 'SaaS' },
  { value: 'app', label: '앱/모바일' },
  { value: 'agent', label: 'AI 에이전트' },
  { value: 'content', label: '콘텐츠' },
  { value: 'commerce', label: '커머스' },
];

const AXIS_LABEL: Record<'P' | 'E' | 'S' | 'T', string> = {
  P: '정치/규제 (Political)',
  E: '경제 (Economic)',
  S: '사회 (Social)',
  T: '기술 (Technological)',
};

const FORCE_LABEL: Record<keyof ReturnType<typeof analyzeEnvironment>['forces'], string> = {
  rivalry: '기존 경쟁 강도',
  newEntrants: '신규 진입 위협',
  substitutes: '대체재 위협',
  buyerPower: '구매자 협상력',
  supplierPower: '공급자 협상력',
  pressure: '평균 압력',
};

const DEFAULT_INPUT: EnvironmentInput = {
  category: 'saas',
  region: 'kr',
  competitorDensity: 4,
  regulatoryRisk: 3,
  ageYears: 1,
};

export default function EnvironmentPage() {
  const [input, setInput] = useState<EnvironmentInput>(DEFAULT_INPUT);
  const result = useMemo(() => analyzeEnvironment(input), [input]);

  const update = <K extends keyof EnvironmentInput>(key: K, value: EnvironmentInput[K]) =>
    setInput((p) => ({ ...p, [key]: value }));

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
              <span className="text-emerald-500">Environment</span> Scan
            </span>
          </div>
          <nav className="flex gap-2 text-sm">
            <Link href="/strategy" className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Strategy
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
            <Compass className="size-3.5 text-emerald-500" />
            5분 안에 환경 스캔
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
            바이브 코더의 환경분석
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            막 만든 서비스가 어떤 시장에 떨어졌는지를 PEST · 5 Forces · 메가트렌드로 즉시 파악. 카테고리·규제·경쟁
            밀도만 입력하면 카테고리별 도메인 지식 시드와 결합해 자동 산출.
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
                      onClick={() => update('category', opt.value)}
                      className={`rounded-lg border px-3 py-2 text-xs transition ${
                        active ? 'border-emerald-500 bg-emerald-500/10 text-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">지역</h2>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['kr', 'global'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => update('region', r)}
                    className={`rounded-lg border px-3 py-2 text-xs transition ${
                      input.region === r ? 'border-emerald-500 bg-emerald-500/10 text-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    {r === 'kr' ? '국내' : '글로벌'}
                  </button>
                ))}
              </div>
            </div>

            <SliderField
              label="경쟁 밀도"
              hint="1=블루오션 · 5=레드오션"
              value={input.competitorDensity}
              onChange={(n) => update('competitorDensity', n)}
            />
            <SliderField
              label="규제 노출"
              hint="1=무관 · 5=중규제"
              value={input.regulatoryRisk}
              onChange={(n) => update('regulatoryRisk', n)}
            />
            <NumberField
              label="런칭 후 경과"
              value={input.ageYears}
              onChange={(n) => update('ageYears', n)}
              suffix="년"
              min={0}
              max={20}
            />
          </section>

          {/* Results */}
          <section className="space-y-6">
            <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-3.5" />
                요약
              </div>
              <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold">PEST 분석</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.pest.map((p, i) => (
                  <article key={i} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                        {p.axis} · {AXIS_LABEL[p.axis]}
                      </span>
                      <Signal n={p.signal} />
                    </div>
                    <h4 className="mt-2 text-sm font-bold">{p.headline}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold">5 Forces 압력 ({result.forces.pressure.toFixed(1)}/5)</h3>
              <div className="space-y-2 rounded-2xl border bg-card p-4">
                {(['rivalry', 'newEntrants', 'substitutes', 'buyerPower', 'supplierPower'] as const).map((k) => {
                  const f = result.forces[k];
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs font-medium">{FORCE_LABEL[k]}</span>
                      <Bar score={f.score} />
                      <span className="w-8 shrink-0 text-right font-mono text-xs">{f.score.toFixed(1)}</span>
                    </div>
                  );
                })}
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    각 force의 근거 보기
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {(['rivalry', 'newEntrants', 'substitutes', 'buyerPower', 'supplierPower'] as const).map((k) => (
                      <li key={k}>
                        <strong className="text-foreground">{FORCE_LABEL[k]}:</strong> {result.forces[k].rationale}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold">메가트렌드</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.megaTrends.map((t, i) => (
                  <article key={i} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Globe2 className={`size-4 ${t.tone === 'tail' ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {t.tone === 'tail' ? '순풍 (tailwind)' : '역풍 (headwind)'}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold">{t.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <Link
              href="/strategy"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              이 환경에 맞는 전략 도출
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

function SliderField({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between text-xs font-medium text-muted-foreground">
        <span>
          {label} <span className="ml-1 text-foreground">({value})</span>
        </span>
        {hint ? <span className="text-[10px] text-muted-foreground/70">{hint}</span> : null}
      </span>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-emerald-500"
      />
    </label>
  );
}

function NumberField({ label, value, onChange, suffix, min, max }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; min?: number; max?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:border-emerald-500">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-sm outline-none"
        />
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

function Signal({ n }: { n: number }) {
  const tone =
    n >= 1 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
    : n <= -1 ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
    : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300';
  const txt = n > 0 ? `+${n}` : `${n}`;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}>{txt}</span>;
}

function Bar({ score }: { score: number }) {
  const pct = ((score - 1) / 4) * 100;
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

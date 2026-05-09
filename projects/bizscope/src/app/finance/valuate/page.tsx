'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Info, Save } from 'lucide-react';
import { type Category, type ValuationInput, formatKrw, safeParseValuationInput, valuate } from '@/lib/finance/valuation';

const STORAGE_KEY = 'bizscope:finance:lastValuation';

const CATEGORY_OPTIONS: { value: Category; label: string; hint: string }[] = [
  { value: 'saas', label: 'SaaS', hint: '구독형 B2B/B2C 도구' },
  { value: 'app', label: '앱/모바일', hint: '인앱결제·광고형 모바일 앱' },
  { value: 'agent', label: 'AI 에이전트', hint: '에이전트·MCP·자동화 SaaS' },
  { value: 'content', label: '콘텐츠', hint: '뉴스레터·미디어·강의' },
  { value: 'commerce', label: '커머스', hint: 'D2C·이커머스' },
];

const DEFAULT_INPUT: ValuationInput = {
  category: 'saas',
  mau: 5000,
  mrr: 10_000_000,
  monthlyChurn: 0.04,
  cac: 50_000,
  arpu: 20_000,
  monthlyGrowth: 0.08,
  grossMargin: 0.7,
};

interface FieldProps {
  label: string;
  hint?: string;
  suffix?: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  percent?: boolean;
}

function Field({ label, hint, suffix, value, onChange, step = 1, min = 0, max, percent }: FieldProps) {
  const display = percent ? Math.round(value * 1000) / 10 : value;
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {hint ? <span className="ml-1 text-[10px] text-muted-foreground/70">{hint}</span> : null}
      </span>
      <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:border-indigo-500">
        <input
          type="number"
          value={Number.isFinite(display) ? display : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const next = Number.isFinite(raw) ? raw : 0;
            onChange(percent ? next / 100 : next);
          }}
          className="w-full bg-transparent text-sm outline-none"
        />
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

export default function ValuatePage() {
  const [input, setInput] = useState<ValuationInput>(DEFAULT_INPUT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setInput(safeParseValuationInput(JSON.parse(raw), DEFAULT_INPUT));
      }
    } catch {
      /* ignore — bad JSON in localStorage shouldn't break the page */
    }
  }, []);

  const result = useMemo(() => valuate(input), [input]);

  // Auto-clear the "saved" badge after 2s. Tracked via state + effect (instead
  // of an inline setTimeout in handleSave) so unmount during the timeout is
  // safe — no warning about setting state on an unmounted component.
  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(id);
  }, [saved]);

  const update = <K extends keyof ValuationInput>(key: K, value: ValuationInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
      setSaved(true);
    } catch {
      /* localStorage may be unavailable in private mode */
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">자가평가</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          숫자만 입력하세요. 계산은 100% 브라우저에서 — 입력값은 서버로 전송되지 않습니다.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
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
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                      active ? 'border-indigo-500 bg-indigo-500/10 text-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="MAU" hint="월 활성 사용자" value={input.mau} onChange={(n) => update('mau', n)} step={100} suffix="명" />
            <Field
              label="MRR"
              hint="월 반복 매출"
              value={input.mrr}
              onChange={(n) => update('mrr', n)}
              step={100_000}
              suffix="원"
            />
            <Field
              label="ARPU"
              hint="유저당 월 매출"
              value={input.arpu}
              onChange={(n) => update('arpu', n)}
              step={1000}
              suffix="원"
            />
            <Field
              label="CAC"
              hint="유저 1명 획득 비용"
              value={input.cac}
              onChange={(n) => update('cac', n)}
              step={1000}
              suffix="원"
            />
            <Field
              label="월 이탈률"
              percent
              value={input.monthlyChurn}
              onChange={(n) => update('monthlyChurn', n)}
              step={0.1}
              suffix="%"
              min={0}
              max={100}
            />
            <Field
              label="월 성장률"
              percent
              value={input.monthlyGrowth}
              onChange={(n) => update('monthlyGrowth', n)}
              step={0.5}
              suffix="%"
              min={-50}
              max={100}
            />
            <Field
              label="총이익률"
              percent
              value={input.grossMargin}
              onChange={(n) => update('grossMargin', n)}
              step={1}
              suffix="%"
              min={0}
              max={95}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            <Save className="size-4" />
            {saved ? '내 브라우저에 저장됨' : '내 브라우저에 저장 (서버 전송 없음)'}
          </button>
        </section>

        {/* Results */}
        <section className="space-y-4">
          <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">추정 가치 범위</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="size-3.5" />
                신뢰도 {result.confidence}%
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight">{formatKrw(result.range.mid)}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              범위 {formatKrw(result.range.low)} ~ {formatKrw(result.range.high)}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-background/60 p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">DCF 방식</div>
                <div className="mt-1 font-bold">{formatKrw(result.dcfValuation)}</div>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Multiple ({result.multipleApplied.toFixed(1)}× ARR)
                </div>
                <div className="mt-1 font-bold">{formatKrw(result.multipleValuation)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric label="ARR" value={formatKrw(result.arr)} />
            <Metric label="LTV" value={formatKrw(result.ltv)} />
            <Metric
              label="LTV / CAC"
              value={result.ltvToCac > 0 ? `${result.ltvToCac.toFixed(1)}x` : '입력 필요'}
            />
            <Metric label="연 성장률" value={`${(result.annualGrowth * 100).toFixed(0)}%`} />
          </div>

          {result.signals.length > 0 ? (
            <div className="space-y-2 rounded-2xl border bg-card p-4">
              {result.signals.map((sig, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {sig.level === 'good' ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  ) : sig.level === 'warn' ? (
                    <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  ) : (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-500" />
                  )}
                  <span>{sig.message}</span>
                </div>
              ))}
            </div>
          ) : null}

          <Link
            href="/finance/playbook"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-500 hover:underline"
          >
            가치를 더 끌어올리는 7가지 레버
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

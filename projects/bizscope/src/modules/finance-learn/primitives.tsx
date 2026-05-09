/**
 * Server-component-friendly primitives. NO `'use client'` — every export here
 * must remain renderable on the server so chapter pages can be RSC-rendered
 * with only the simulator islands hydrated on the client.
 *
 * Interactive primitives (currently `NumberInput`) live in a separate
 * `client-fields.tsx` file with its own `'use client'` directive.
 */

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ChapterMeta {
  slug: string;
  number: number;
  title: string;
  source: string;
}

export const LEARN_CHAPTERS: ChapterMeta[] = [
  { slug: 'time-value', number: 1, title: '시간가치 (Time Value of Money)', source: '재무 101 · slide 2~3' },
  { slug: 'npv-basics', number: 2, title: 'NPV — 순현재가치', source: '재무 101 · slide 4' },
  { slug: 'irr-basics', number: 3, title: 'IRR — 내부수익률 + 시행착오', source: '재무 101 · slide 5~8' },
  { slug: 'investment-compare', number: 4, title: '두 투자안 NPV 비교', source: '재무 101 · slide 9~11' },
  { slug: 'wacc', number: 5, title: 'WACC — 가중평균자본비용', source: '재무 101 · slide 12~13' },
  { slug: 'wacc-application', number: 6, title: 'WACC 적용 — 결론은 어떻게 뒤집히는가', source: '재무 101 · slide 14~16' },
  { slug: 'valuation-methods', number: 7, title: '기업가치 평가 3가지 방법', source: '재무_기업가치 · slide 4' },
  { slug: 'market-cap', number: 8, title: '시가총액법 (Market Capitalization)', source: '재무_기업가치 · slide 5~6' },
  { slug: 'multiples', number: 9, title: 'Multiple Method — PER / PBR / PSR / EV·EBITDA', source: '재무_기업가치 · slide 7~10' },
  { slug: 'dcf-process', number: 10, title: 'DCF 5단계 프로세스', source: '재무_기업가치 · slide 11~15' },
  { slug: 'terminal-value', number: 11, title: 'Terminal Value 8가지 산정 방식', source: '재무_기업가치 · slide 16' },
];

export function ChapterShell({
  meta,
  children,
}: {
  meta: ChapterMeta;
  children: ReactNode;
}) {
  const idx = LEARN_CHAPTERS.findIndex((c) => c.slug === meta.slug);
  const prev = idx > 0 ? LEARN_CHAPTERS[idx - 1] : null;
  const next = idx < LEARN_CHAPTERS.length - 1 ? LEARN_CHAPTERS[idx + 1] : null;
  return (
    <article className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/finance/learn" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        학습 목차로
      </Link>
      <header className="mt-4">
        <div className="text-xs font-mono uppercase tracking-wider text-indigo-500">
          Chapter {meta.number} / {LEARN_CHAPTERS.length}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{meta.title}</h1>
        <div className="mt-2 text-xs text-muted-foreground">자료: {meta.source}</div>
      </header>
      <div className="mt-8 space-y-8">{children}</div>
      <nav className="mt-12 grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/finance/learn/${prev.slug}`}
            className="group rounded-xl border bg-card p-4 transition hover:border-indigo-500/40"
          >
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <ArrowLeft className="size-3" /> 이전
            </div>
            <div className="mt-1 text-sm font-semibold">
              Ch{prev.number}. {prev.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/finance/learn/${next.slug}`}
            className="group rounded-xl border bg-card p-4 text-right transition hover:border-indigo-500/40"
          >
            <div className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              다음 <ArrowRight className="size-3" />
            </div>
            <div className="mt-1 text-sm font-semibold">
              Ch{next.number}. {next.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

export function Headline({ children }: { children: ReactNode }) {
  return <p className="text-base font-medium leading-relaxed text-foreground">{children}</p>;
}

export function Body({ children }: { children: ReactNode }) {
  return <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>;
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-zinc-950 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-100">
      {children}
    </div>
  );
}

export function Callout({ children, tone = 'highlight' }: { children: ReactNode; tone?: 'highlight' | 'note' | 'warn' }) {
  const cls =
    tone === 'highlight'
      ? 'border-amber-300/70 bg-amber-50 text-amber-950 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100'
      : tone === 'warn'
        ? 'border-rose-300/70 bg-rose-50 text-rose-950 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100'
        : 'border bg-muted/40 text-muted-foreground';
  return <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${cls}`}>{children}</div>;
}

export function CashflowTable({
  caption,
  columns,
  rows,
  highlightCol,
}: {
  caption?: string;
  columns: string[];
  rows: { label: string; cells: (string | number)[]; emphasize?: boolean }[];
  highlightCol?: number;
}) {
  return (
    <figure className="space-y-2">
      {caption ? <figcaption className="text-xs text-muted-foreground">{caption}</figcaption> : null}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs">
              <th className="px-3 py-2 text-left font-semibold"></th>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-3 py-2 text-right font-semibold ${highlightCol === i ? 'bg-indigo-500/10 text-foreground' : ''}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-b last:border-b-0 ${r.emphasize ? 'bg-amber-50/40 dark:bg-amber-300/5' : ''}`}>
                <td className="px-3 py-2 text-xs font-medium">{r.label}</td>
                {r.cells.map((c, j) => (
                  <td
                    key={j}
                    className={`px-3 py-2 text-right font-mono text-xs ${highlightCol === j ? 'bg-indigo-500/10' : ''}`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

// `NumberInput` moved to ./client-fields.tsx so this file stays server-pure.
// Re-export for legacy import paths to keep working until callers migrate.
export { NumberInput } from './client-fields';

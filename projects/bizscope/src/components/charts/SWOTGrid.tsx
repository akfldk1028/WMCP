'use client';

import type { SWOTData } from '@/frameworks/types';

interface SWOTGridProps {
  data: SWOTData;
}

const QUADRANTS = [
  { key: 'strengths' as const, letter: 'S', title: 'trengths', accent: 'border-sky-600', color: 'text-sky-600' },
  { key: 'weaknesses' as const, letter: 'W', title: 'eaknesses', accent: 'border-rose-500', color: 'text-rose-500' },
  { key: 'opportunities' as const, letter: 'O', title: 'pportunities', accent: 'border-emerald-600', color: 'text-emerald-600' },
  { key: 'threats' as const, letter: 'T', title: 'hreats', accent: 'border-amber-600', color: 'text-amber-600' },
] as const;

export default function SWOTGrid({ data }: SWOTGridProps) {
  const items: Record<string, string[]> = {
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    opportunities: data.opportunities,
    threats: data.threats,
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {QUADRANTS.map((q) => (
        <div key={q.key} className={`border-l-2 ${q.accent} pl-5`}>
          <h3 className="mb-3">
            <span className={`text-xl font-bold ${q.color}`}>{q.letter}</span>
            <span className="text-sm font-medium text-muted-foreground">{q.title}</span>
          </h3>
          <div className="divide-y divide-border/40">
            {items[q.key].map((item, i) => (
              <div key={i} className="flex gap-3 py-2.5">
                <span className={`w-5 shrink-0 text-xs font-bold tabular-nums ${q.color}`}>
                  {q.letter}{i + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

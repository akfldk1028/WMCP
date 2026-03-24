import type { ReferenceCaseData } from '@/frameworks/types';

interface Props {
  data: ReferenceCaseData;
  subPage?: number;
}

export default function ReferenceCase({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {(all || subPage === 0) && (
        <div className="space-y-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">성공사례 분석</h3>
          <div className="space-y-6">
            {data.cases.map((c, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold">{c.company}</h4>
                    <span className="text-xs text-muted-foreground">{c.industry}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">전략</span>
                    <p className="mt-0.5 text-sm">{c.strategy}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">성과</span>
                    <p className="mt-0.5 text-sm">{c.outcome}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">적용 가능성</span>
                    <p className="mt-0.5 text-sm text-indigo-600">{c.applicability}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-6' : 'space-y-6'}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">시사점</h3>
          <div className="divide-y">
            {data.implications.map((imp, i) => (
              <div key={i} className="flex gap-4 py-3.5">
                <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-[15px] leading-relaxed">{imp}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </div>
      )}
    </div>
  );
}

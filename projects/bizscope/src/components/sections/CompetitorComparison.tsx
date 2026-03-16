import type { CompetitorData } from '@/frameworks/types';

interface Props {
  data: CompetitorData;
  subPage?: number;
}

export default function CompetitorComparison({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Profiles */}
      {(all || subPage === 0) && (
        <div className="divide-y">
          {data.competitors.map((comp) => (
            <div key={comp.name} className="py-6 first:pt-0 last:pb-0">
              <div className="flex items-baseline gap-3">
                <h4 className="text-sm font-bold">{comp.name}</h4>
                {comp.marketShare && (
                  <span className="text-xs text-muted-foreground">MS {comp.marketShare}</span>
                )}
              </div>
              <p className="mt-1 text-sm italic text-indigo-600">{comp.keyDifferentiator}</p>
              <div className="mt-3 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">Strengths</p>
                  {comp.strengths.map((s, i) => (
                    <p key={i} className="mt-1 text-sm text-muted-foreground">+ {s}</p>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-500">Weaknesses</p>
                  {comp.weaknesses.map((w, i) => (
                    <p key={i} className="mt-1 text-sm text-muted-foreground">- {w}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub 1: Gap analysis */}
      {(all || subPage === 1) && data.gaps.length > 0 && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">Gap 분석</h3>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-5 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>영역</span><span>자사</span><span>경쟁사</span><span>Gap</span><span>대응</span>
            </div>
            {data.gaps.map((gap, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-3">
                <span className="font-medium">{gap.area}</span>
                <span className="text-muted-foreground">{gap.ourPosition}</span>
                <span className="text-muted-foreground">{gap.competitorBest}</span>
                <span className="font-medium text-amber-600">{gap.gap}</span>
                <span className="text-muted-foreground">{gap.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 2: Takeaway */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-14' : ''}>
          <div className="border-l-2 border-indigo-600 pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">Key Takeaway</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

import type { CompetitorScanData } from '@/frameworks/types';

interface Props {
  data: CompetitorScanData;
  subPage?: number;
}

export default function CompetitorScan({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Competitor profiles */}
      {(all || subPage === 0) && (
        <div className="divide-y">
          {data.competitors.map((comp) => (
            <div key={comp.name} className="py-6 first:pt-0 last:pb-0">
              <div className="flex items-baseline gap-3">
                <h4 className="text-sm font-bold">{comp.name}</h4>
                {comp.funding && (
                  <span className="text-xs text-muted-foreground">Funding: {comp.funding}</span>
                )}
                {comp.users && (
                  <span className="text-xs text-muted-foreground">Users: {comp.users}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{comp.description}</p>
              {comp.url && (
                <p className="mt-1 text-xs text-indigo-600">{comp.url}</p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
                    Strengths
                  </p>
                  {comp.strengths.map((s, i) => (
                    <p key={i} className="mt-1 text-sm text-muted-foreground">+ {s}</p>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-500">
                    Weaknesses
                  </p>
                  {comp.weaknesses.map((w, i) => (
                    <p key={i} className="mt-1 text-sm text-muted-foreground">- {w}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub 1: Market gaps */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            시장 Gap 분석
          </h3>
          <div className="mt-4 divide-y">
            {data.marketGaps.map((gap, i) => (
              <div key={i} className="flex gap-4 py-3.5">
                <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] leading-relaxed">{gap}</p>
              </div>
            ))}
          </div>

          {data.summary && (
            <div className="mt-10 border-l-2 border-indigo-600 pl-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
                Key Takeaway
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {data.summary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import type { StrategyCurrentComparisonData, StrategyComparison } from '@/frameworks/types';

interface Props {
  data: StrategyCurrentComparisonData;
  subPage?: number;
}

const VERDICT: Record<StrategyComparison['verdict'], { label: string; color: string }> = {
  match: { label: '일치', color: 'text-emerald-600' },
  supplement: { label: '보완', color: 'text-amber-600' },
  missing: { label: '미흡', color: 'text-rose-500' },
};

export default function StrategyCurrentComparison({ data, subPage }: Props) {
  const all = subPage === undefined;
  const counts = { match: 0, supplement: 0, missing: 0 };
  for (const c of data.comparisons) counts[c.verdict]++;

  return (
    <div>
      {/* Sub 0: Counts */}
      {(all || subPage === 0) && (
        <div className="grid grid-cols-3 gap-x-12">
          {(['match', 'supplement', 'missing'] as const).map((k) => (
            <div key={k}>
              <p className="text-4xl font-bold tabular-nums">{counts[k]}</p>
              <p className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${VERDICT[k].color}`}>
                {VERDICT[k].label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sub 1: Cards */}
      {(all || subPage === 1) && (
        <div className={`divide-y ${all ? 'mt-14' : ''}`}>
          {data.comparisons.map((comp) => {
            const v = VERDICT[comp.verdict];
            return (
              <div key={comp.strategyLabel} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-bold tabular-nums text-indigo-600">{comp.strategyLabel}</span>
                  <h4 className="text-sm font-bold">{comp.strategyName}</h4>
                  <span className={`ml-auto text-xs font-bold uppercase tracking-wider ${v.color}`}>{v.label}</span>
                </div>
                <div className="mt-3 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">현행 전략</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{comp.currentStrategy}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">7S 비교</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{comp.sevenSComparison}</p>
                  </div>
                </div>
              </div>
            );
          })}
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

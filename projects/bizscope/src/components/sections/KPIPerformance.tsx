import type { KPIPerformanceData } from '@/frameworks/types';

interface Props {
  data: KPIPerformanceData;
  subPage?: number;
}

export default function KPIPerformance({ data, subPage }: Props) {
  const all = subPage === undefined;
  const trendIcon = (trend: string) =>
    trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192';
  const trendColor = (trend: string) =>
    trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div>
      {(all || subPage === 0) && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="rounded-xl border p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">{kpi.metric}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{kpi.value}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`text-sm font-bold ${trendColor(kpi.trend)}`}>{trendIcon(kpi.trend)}</span>
                  {kpi.benchmark && <span className="text-xs text-muted-foreground">벤치마크: {kpi.benchmark}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-8' : 'space-y-8'}>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">시장 지위</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.marketPosition}</p>
          </div>
          {data.industryComparison && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">동종업계 비교</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.industryComparison}</p>
            </div>
          )}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">종합</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

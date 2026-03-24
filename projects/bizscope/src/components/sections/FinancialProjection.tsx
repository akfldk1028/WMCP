import type { FinancialProjectionData } from '@/frameworks/types';

interface Props {
  data: FinancialProjectionData;
  subPage?: number;
}

const SCENARIO_STYLE: Record<string, { border: string; label: string; color: string }> = {
  optimistic: { border: 'border-emerald-200', label: '낙관', color: 'text-emerald-600' },
  base: { border: 'border-indigo-200', label: '기본', color: 'text-indigo-600' },
  pessimistic: { border: 'border-rose-200', label: '비관', color: 'text-rose-500' },
};

export default function FinancialProjection({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: 3개년 재무 전망 */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            3개년 재무 전망
          </h3>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>연도</span>
              <span>매출</span>
              <span>비용</span>
              <span>수익</span>
              {data.yearly[0]?.users !== undefined && <span>사용자</span>}
            </div>
            {data.yearly.map((y, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-4 py-3">
                <span className="font-bold">{y.year}</span>
                <span className="text-indigo-600">{y.revenue}</span>
                <span className="text-rose-500">{y.cost}</span>
                <span className={y.profit.startsWith('-') ? 'text-rose-500' : 'text-emerald-600'}>
                  {y.profit}
                </span>
                {y.users !== undefined && (
                  <span className="text-muted-foreground">{y.users}</span>
                )}
              </div>
            ))}
          </div>

          {data.keyMetrics.length > 0 && (
            <div className="mt-10">
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                핵심 지표 전망
              </h4>
              <div className="divide-y text-sm">
                <div className="grid grid-cols-4 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  <span>지표</span>
                  <span>1년차</span>
                  <span>2년차</span>
                  <span>3년차</span>
                </div>
                {data.keyMetrics.map((m, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 py-3">
                    <span className="font-medium">{m.metric}</span>
                    <span className="text-muted-foreground">{m.year1}</span>
                    <span className="text-muted-foreground">{m.year2}</span>
                    <span className="text-indigo-600">{m.year3}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub 1: 시나리오 분석 */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            시나리오 분석
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {data.scenarios.map((sc) => {
              const style = SCENARIO_STYLE[sc.scenario] ?? { border: '', label: sc.scenario, color: '' };
              return (
                <div key={sc.scenario} className={`rounded-xl border p-5 ${style.border}`}>
                  <p className={`text-xs font-bold uppercase ${style.color}`}>{style.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">확률: {sc.probability}</p>
                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">3년차 매출</span>
                      <p className="mt-0.5 text-lg font-bold">{sc.year3Revenue}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">3년차 수익</span>
                      <p className={`mt-0.5 text-lg font-bold ${sc.year3Profit.startsWith('-') ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {sc.year3Profit}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{sc.keyAssumption}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub 2: 자금조달 계획 */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            자금조달 계획
          </h3>
          <div className="space-y-4">
            {data.fundingPlan.map((fp, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold">{fp.stage}</h4>
                    <span className="text-xs text-muted-foreground">{fp.timing}</span>
                  </div>
                  <span className="ml-auto text-lg font-bold text-indigo-600">{fp.amount}</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">용도</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{fp.use}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">조달처</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{fp.source}</p>
                  </div>
                </div>
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

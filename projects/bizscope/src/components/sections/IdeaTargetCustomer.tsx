import type { IdeaTargetCustomerData } from '@/frameworks/types';

interface Props {
  data: IdeaTargetCustomerData;
  subPage?: number;
}

const SATISFACTION_STYLE: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-rose-500',
};

export default function IdeaTargetCustomer({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: 고객 페르소나 상세 */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            고객 페르소나 상세
          </h3>
          <div className="space-y-6">
            {data.personas.map((p, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold">{p.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {p.age} · {p.occupation}
                      {p.income && ` · ${p.income}`}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">고충</span>
                    <p className="mt-0.5 text-sm">{p.pain}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">현재 해결책</span>
                    <p className="mt-0.5 text-sm">{p.currentSolution}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">원하는 결과</span>
                    <p className="mt-0.5 text-sm">{p.desiredOutcome}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">지불 의향</span>
                    <p className="mt-0.5 text-sm text-indigo-600">{p.willingnessToPay}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 1: 고객 여정 맵 */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            고객 여정 맵
          </h3>
          <div className="divide-y">
            {data.customerJourney.map((step, i) => (
              <div key={i} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-sm font-bold">{step.stage}</h4>
                </div>
                <div className="ml-10 mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">행동</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{step.action}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">접점</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{step.touchpoint}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-500">Pain Point</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{step.painPoint}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600">Opportunity</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{step.opportunity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              현재 대안 비교
            </h4>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-[1fr_1fr_72px_1fr] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <span>서비스</span>
                <span>사용 현황</span>
                <span>만족도</span>
                <span>전환 장벽</span>
              </div>
              {data.currentAlternatives.map((alt, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_72px_1fr] gap-4 py-3">
                  <span className="font-medium">{alt.name}</span>
                  <span className="text-muted-foreground">{alt.usage}</span>
                  <span className={`text-xs font-bold uppercase ${SATISFACTION_STYLE[alt.satisfaction] ?? ''}`}>
                    {alt.satisfaction}
                  </span>
                  <span className="text-muted-foreground">{alt.switchingBarrier}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 2: 전환 장벽 & 지불의향 */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            전환 장벽 & 지불의향
          </h3>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>세그먼트</span>
              <span>가격 범위</span>
              <span>결제 모델</span>
              <span>근거</span>
            </div>
            {data.willingnessAnalysis.map((w, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-4 py-3">
                <span className="font-medium">{w.segment}</span>
                <span className="text-indigo-600">{w.priceRange}</span>
                <span className="text-muted-foreground">{w.paymentModel}</span>
                <span className="text-muted-foreground">{w.reasoning}</span>
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

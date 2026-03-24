import type { GrowthStrategyData } from '@/frameworks/types';

interface Props {
  data: GrowthStrategyData;
  subPage?: number;
}

const PRI_COLOR: Record<string, string> = {
  high: 'text-rose-500',
  medium: 'text-amber-600',
  low: 'text-muted-foreground',
};

const TYPE_LABEL: Record<string, string> = {
  viral: 'Viral',
  content: 'Content',
  partnership: 'Partnership',
  paid: 'Paid',
  community: 'Community',
  'product-led': 'Product-Led',
};

const STRENGTH_STYLE: Record<string, string> = {
  strong: 'text-emerald-600',
  moderate: 'text-amber-600',
  weak: 'text-rose-500',
  none: 'text-muted-foreground',
};

const FEASIBILITY_STYLE: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-rose-500',
};

export default function GrowthStrategy({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: 성장 전략 */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            성장 전략
          </h3>
          <div className="space-y-4">
            {data.strategies.map((s, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-semibold">{s.name}</h4>
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium">
                        {TYPE_LABEL[s.type] ?? s.type}
                      </span>
                      <span className={`ml-auto text-xs font-bold uppercase ${PRI_COLOR[s.priority] ?? ''}`}>
                        {s.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">비용</span>
                    <p className="mt-0.5">{s.cost}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">기대 효과</span>
                    <p className="mt-0.5">{s.expectedImpact}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">기간</span>
                    <p className="mt-0.5">{s.timeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 1: 네트워크 효과 분석 */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            네트워크 효과 분석
          </h3>
          <div className="rounded-xl border p-5">
            <div className="flex items-baseline gap-3">
              <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase">
                {data.networkEffects.type}
              </span>
              <span className={`text-xs font-bold ${STRENGTH_STYLE[data.networkEffects.strength] ?? ''}`}>
                {data.networkEffects.strength}
              </span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {data.networkEffects.description}
            </p>
          </div>

          <div className="mt-10">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              파트너십
            </h4>
            <div className="divide-y">
              {data.partnerships.map((p, i) => (
                <div key={i} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-baseline gap-3">
                    <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold">{p.partner}</h4>
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium">{p.type}</span>
                    <span className={`ml-auto text-xs font-bold uppercase ${FEASIBILITY_STYLE[p.feasibility] ?? ''}`}>
                      {p.feasibility}
                    </span>
                  </div>
                  <p className="ml-10 mt-1 text-sm text-muted-foreground">{p.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 2: 확장 단계 & 해외 진출 */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            확장 단계
          </h3>
          <div className="divide-y">
            {data.expansionStages.map((stage, i) => (
              <div key={i} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-sm font-bold">{stage.stage}</h4>
                  <span className="text-xs text-muted-foreground">{stage.timeline}</span>
                </div>
                <div className="ml-10 mt-2 grid gap-2 sm:grid-cols-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">타겟</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{stage.target}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">전략</span>
                    <p className="mt-0.5 text-sm text-muted-foreground">{stage.strategy}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">KPI</span>
                    <p className="mt-0.5 text-sm text-indigo-600">{stage.kpi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.internationalExpansion && (
            <div className="mt-10">
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                해외 진출
              </h4>
              <div className="rounded-xl border p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">타당성</span>
                  <span className={`text-xs font-bold uppercase ${FEASIBILITY_STYLE[data.internationalExpansion.feasibility] ?? ''}`}>
                    {data.internationalExpansion.feasibility}
                  </span>
                  <span className="text-xs text-muted-foreground">{data.internationalExpansion.timeline}</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">우선 시장</span>
                    <p className="mt-0.5 text-sm">{data.internationalExpansion.priorityMarkets.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-500">진입 장벽</span>
                    {data.internationalExpansion.barriers.map((b, i) => (
                      <p key={i} className="mt-0.5 text-sm text-muted-foreground">- {b}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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

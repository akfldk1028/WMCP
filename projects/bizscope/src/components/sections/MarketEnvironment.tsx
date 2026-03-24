import type { MarketEnvironmentData } from '@/frameworks/types';

interface Props {
  data: MarketEnvironmentData;
  subPage?: number;
}

const PEST_LABEL: Record<string, string> = {
  political: 'Political',
  economic: 'Economic',
  social: 'Social',
  technological: 'Technological',
};

const PEST_COLOR: Record<string, string> = {
  political: 'bg-blue-100 text-blue-700',
  economic: 'bg-amber-100 text-amber-700',
  social: 'bg-purple-100 text-purple-700',
  technological: 'bg-emerald-100 text-emerald-700',
};

const DIR_STYLE: Record<string, string> = {
  positive: 'text-emerald-600',
  negative: 'text-rose-500',
  neutral: 'text-muted-foreground',
};

const STATUS_LABEL: Record<string, string> = {
  existing: '시행 중',
  upcoming: '예정',
  proposed: '논의 중',
};

const MATURITY_STYLE: Record<string, string> = {
  emerging: 'bg-blue-100 text-blue-700',
  growing: 'bg-emerald-100 text-emerald-700',
  mature: 'bg-amber-100 text-amber-700',
  declining: 'bg-rose-100 text-rose-700',
};

const MATURITY_LABEL: Record<string, string> = {
  emerging: '초기 시장',
  growing: '성장 시장',
  mature: '성숙 시장',
  declining: '쇠퇴 시장',
};

export default function MarketEnvironment({ data, subPage }: Props) {
  const all = subPage === undefined;

  const grouped = data.pestSummary.reduce<Record<string, typeof data.pestSummary>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div>
      {/* Sub 0: PEST 요약 & 기술 트렌드 */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            PEST 요약
          </h3>
          <div className="space-y-6">
            {(['political', 'economic', 'social', 'technological'] as const).map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat}>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${PEST_COLOR[cat]}`}>
                    {PEST_LABEL[cat]}
                  </span>
                  <div className="mt-2 divide-y">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-baseline gap-3 py-2.5">
                        <span className={`text-xs font-bold ${DIR_STYLE[item.direction] ?? ''}`}>
                          {item.direction === 'positive' ? '+' : item.direction === 'negative' ? '-' : '~'}
                        </span>
                        <div>
                          <span className="text-sm font-medium">{item.keyFactor}</span>
                          <p className="mt-0.5 text-sm text-muted-foreground">{item.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              기술 트렌드
            </h4>
            <div className="divide-y">
              {data.techTrends.map((t, i) => (
                <div key={i} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-baseline gap-3">
                    <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold">{t.trend}</h4>
                    <span className="text-xs text-muted-foreground">{t.timeframe}</span>
                  </div>
                  <p className="ml-10 mt-1 text-sm text-muted-foreground">{t.relevance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 1: 규제 환경 & 소비자 변화 */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            규제 환경
          </h3>
          <div className="divide-y">
            {data.regulatoryEnvironment.map((r, i) => (
              <div key={i} className="flex items-baseline gap-4 py-3.5">
                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                <div>
                  <span className="text-sm font-medium">{r.regulation}</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">{r.impact}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              소비자 행동 변화
            </h4>
            <div className="divide-y">
              {data.consumerBehavior.map((cb, i) => (
                <div key={i} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-baseline gap-3">
                    <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold">{cb.trend}</h4>
                  </div>
                  <div className="ml-10 mt-1 space-y-1">
                    <p className="text-sm text-muted-foreground">{cb.evidence}</p>
                    <p className="text-sm text-indigo-600">{cb.implication}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 2: 시장 성숙도 판단 */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            시장 성숙도 판단
          </h3>
          <div className="flex items-center gap-4">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${MATURITY_STYLE[data.marketMaturity] ?? 'bg-muted'}`}>
              {MATURITY_LABEL[data.marketMaturity] ?? data.marketMaturity}
            </span>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            {data.maturityReasoning}
          </p>

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

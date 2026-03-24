import type { UnitEconomicsData } from '@/frameworks/types';

interface Props {
  data: UnitEconomicsData;
  subPage?: number;
}

const VERDICT_STYLE: Record<string, string> = {
  healthy: 'bg-emerald-100 text-emerald-700',
  marginal: 'bg-amber-100 text-amber-700',
  unsustainable: 'bg-rose-100 text-rose-700',
};

const VERDICT_LABEL: Record<string, string> = {
  healthy: '건전',
  marginal: '경계',
  unsustainable: '지속불가',
};

export default function UnitEconomics({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: CAC/LTV/LTV:CAC 비율 */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            핵심 단위 경제성 지표
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* CAC */}
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                CAC (고객획득비용)
              </p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{data.cac.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.cac.breakdown}</p>
              {data.cac.benchmark && (
                <p className="mt-1 text-xs text-muted-foreground/70">업계 벤치마크: {data.cac.benchmark}</p>
              )}
            </div>
            {/* LTV */}
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                LTV (고객생애가치)
              </p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{data.ltv.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{data.ltv.calculation}</p>
              {data.ltv.benchmark && (
                <p className="mt-1 text-xs text-muted-foreground/70">업계 벤치마크: {data.ltv.benchmark}</p>
              )}
            </div>
            {/* LTV:CAC Ratio */}
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                LTV:CAC 비율
              </p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{data.ltvCacRatio.value}</p>
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${VERDICT_STYLE[data.ltvCacRatio.verdict] ?? 'bg-muted'}`}>
                {VERDICT_LABEL[data.ltvCacRatio.verdict] ?? data.ltvCacRatio.verdict}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sub 1: 손익분기점 (BEP) */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            손익분기점 (BEP) 분석
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">BEP 도달 시점</p>
              <p className="mt-2 text-xl font-bold">{data.breakEvenPoint.months}</p>
              <p className="mt-1 text-xs text-muted-foreground">필요 고객 수: {data.breakEvenPoint.customers}</p>
              <p className="text-xs text-muted-foreground">필요 매출: {data.breakEvenPoint.revenue}</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">월간 번레이트</p>
              <p className="mt-2 text-xl font-bold text-rose-500">{data.monthlyBurnRate}</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">런웨이</p>
              <p className="mt-2 text-xl font-bold">{data.runway}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium">가정: </span>{data.breakEvenPoint.assumptions}
          </p>
        </div>
      )}

      {/* Sub 2: 마진 & 민감도 분석 */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            마진 구조
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">매출 총이익률</p>
              <p className="mt-2 text-xl font-bold text-emerald-600">{data.margins.gross}</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">공헌이익률</p>
              <p className="mt-2 text-xl font-bold text-emerald-600">{data.margins.contribution}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{data.margins.reasoning}</p>

          <div className="mt-10">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              민감도 분석
            </h4>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-4 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <span>변수</span>
                <span className="text-emerald-600">낙관</span>
                <span>기본</span>
                <span className="text-rose-500">비관</span>
              </div>
              {data.sensitivityAnalysis.map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 py-3">
                  <span className="font-medium">{s.variable}</span>
                  <span className="text-emerald-600">{s.optimistic}</span>
                  <span className="text-muted-foreground">{s.base}</span>
                  <span className="text-rose-500">{s.pessimistic}</span>
                </div>
              ))}
            </div>
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

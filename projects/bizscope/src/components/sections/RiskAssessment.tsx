import type { RiskAssessmentData } from '@/frameworks/types';

interface Props {
  data: RiskAssessmentData;
  subPage?: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  market: 'Market',
  technical: 'Technical',
  financial: 'Financial',
  regulatory: 'Regulatory',
  competitive: 'Competitive',
};

const RISK_LEVEL_STYLE: Record<string, string> = {
  low: 'text-emerald-600',
  medium: 'text-amber-600',
  high: 'text-rose-500',
};

function ScoreDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`size-2 rounded-full ${
            i < value ? 'bg-indigo-600' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
}

export default function RiskAssessment({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Risk matrix */}
      {(all || subPage === 0) && (
        <div>
          <div className="mb-6 flex items-baseline gap-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              리스크 매트릭스
            </h3>
            <span className={`text-xs font-bold uppercase ${RISK_LEVEL_STYLE[data.overallRiskLevel] ?? ''}`}>
              Overall: {data.overallRiskLevel}
            </span>
          </div>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-[100px_1fr_72px_72px] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>카테고리</span>
              <span>리스크</span>
              <span>발생확률</span>
              <span>영향도</span>
            </div>
            {data.risks.map((r, i) => (
              <div key={i} className="grid grid-cols-[100px_1fr_72px_72px] items-center gap-4 py-3">
                <span className="rounded-full border px-2 py-0.5 text-center text-[10px] font-medium">
                  {CATEGORY_LABEL[r.category] ?? r.category}
                </span>
                <span className="font-medium">{r.risk}</span>
                <ScoreDots value={r.probability} />
                <ScoreDots value={r.impact} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 1: Mitigation strategies */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            완화 전략
          </h3>
          <div className="divide-y">
            {data.risks.map((r, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-sm font-bold">{r.risk}</h4>
                </div>
                <p className="ml-10 mt-1 text-sm text-muted-foreground">{r.mitigation}</p>
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

import type { ActionPlanData } from '@/frameworks/types';

interface Props {
  data: ActionPlanData;
  subPage?: number;
}

const TEAM_PRI: Record<string, string> = {
  critical: 'text-rose-500',
  important: 'text-amber-600',
  'nice-to-have': 'text-muted-foreground',
};

const VERDICT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  'strong-go': { bg: 'bg-emerald-600', text: 'text-emerald-600', label: 'STRONG GO' },
  go: { bg: 'bg-blue-600', text: 'text-blue-600', label: 'GO' },
  conditional: { bg: 'bg-amber-500', text: 'text-amber-600', label: 'CONDITIONAL' },
  'no-go': { bg: 'bg-rose-500', text: 'text-rose-500', label: 'NO-GO' },
};

export default function ActionPlan({ data, subPage }: Props) {
  const all = subPage === undefined;
  const fp = data.financialProjection;

  return (
    <div>
      {/* Sub 0: Milestones + Key metrics */}
      {(all || subPage === 0) && (
        <div className="space-y-14">
          {/* Milestones timeline */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              실행 로드맵
            </h3>
            <div className="divide-y">
              {data.milestones.map((ms, i) => (
                <div key={i} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-baseline gap-3">
                    <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold">{ms.phase}</h4>
                    <span className="text-xs text-muted-foreground">{ms.timeline}</span>
                    {ms.budget && (
                      <span className="text-xs text-muted-foreground">{ms.budget}</span>
                    )}
                  </div>
                  <div className="ml-10 mt-1.5">
                    {ms.deliverables.map((d, j) => (
                      <p key={j} className="text-sm text-muted-foreground">{d}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              핵심 지표
            </h3>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-3 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <span>지표</span>
                <span>목표</span>
                <span>일정</span>
              </div>
              {data.keyMetrics.map((km, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 py-3">
                  <span className="font-medium">{km.metric}</span>
                  <span className="text-muted-foreground">{km.target}</span>
                  <span className="text-muted-foreground">{km.timeline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 1: Team & Financial */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14 space-y-14' : 'space-y-14'}>
          {/* Team */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              팀 구성
            </h3>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-[1fr_60px_80px] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <span>역할</span>
                <span>인원</span>
                <span>우선순위</span>
              </div>
              {data.teamRequirements.map((tr, i) => (
                <div key={i} className="grid grid-cols-[1fr_60px_80px] gap-4 py-3">
                  <span className="font-medium">{tr.role}</span>
                  <span className="tabular-nums text-muted-foreground">{tr.count}</span>
                  <span className={`text-xs font-bold uppercase ${TEAM_PRI[tr.priority] ?? ''}`}>
                    {tr.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-year projection */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              3개년 재무 전망
            </h3>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-4 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <span />
                <span>Year 1</span>
                <span>Year 2</span>
                <span>Year 3</span>
              </div>
              {(['revenue', 'cost', 'profit'] as const).map((key) => (
                <div key={key} className="grid grid-cols-4 gap-4 py-3">
                  <span className="font-medium capitalize">
                    {key === 'revenue' ? '매출' : key === 'cost' ? '비용' : '이익'}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{fp.year1[key]}</span>
                  <span className="tabular-nums text-muted-foreground">{fp.year2[key]}</span>
                  <span className="tabular-nums text-muted-foreground">{fp.year3[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 2: Verdict */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-14' : ''}>
          {(() => {
            const vs = VERDICT_STYLE[data.verdict.recommendation] ?? VERDICT_STYLE.conditional;
            return (
              <div className="space-y-8">
                {/* Big score */}
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                      종합 점수
                    </p>
                    <p className={`mt-1 text-5xl font-black tabular-nums tracking-tighter ${vs.text}`}>
                      {data.verdict.score}
                      <span className="text-lg font-medium text-muted-foreground/50">/10</span>
                    </p>
                  </div>
                  <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white ${vs.bg}`}>
                    {vs.label}
                  </span>
                </div>

                {/* Score bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${vs.bg}`}
                    style={{ width: `${data.verdict.score * 10}%` }}
                  />
                </div>

                {/* Reasoning */}
                <div className="border-l-2 border-indigo-600 pl-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
                    Verdict
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed">{data.verdict.reasoning}</p>
                </div>

                {data.summary && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

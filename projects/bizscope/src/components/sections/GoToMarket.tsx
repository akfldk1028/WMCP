import type { GoToMarketData } from '@/frameworks/types';

interface Props {
  data: GoToMarketData;
  subPage?: number;
}

const PRI_COLOR: Record<string, string> = {
  high: 'text-rose-500',
  medium: 'text-amber-600',
  low: 'text-muted-foreground',
};

export default function GoToMarket({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Channel strategy */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            채널 전략
          </h3>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-[1fr_2fr_80px_72px] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>채널</span>
              <span>전략</span>
              <span>비용</span>
              <span>우선순위</span>
            </div>
            {data.channels.map((ch, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_80px_72px] gap-4 py-3">
                <span className="font-medium">{ch.channel}</span>
                <span className="text-muted-foreground">{ch.strategy}</span>
                <span className="text-muted-foreground">{ch.cost}</span>
                <span className={`text-xs font-bold uppercase ${PRI_COLOR[ch.priority] ?? ''}`}>
                  {ch.priority}
                </span>
              </div>
            ))}
          </div>

          {data.earlyAdopters && (
            <div className="mt-10">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                얼리어답터 프로필
              </h4>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {data.earlyAdopters}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sub 1: Launch roadmap */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            런칭 로드맵
          </h3>
          <div className="space-y-0 divide-y">
            {data.launchPhases.map((phase, i) => (
              <div key={i} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-sm font-bold">{phase.phase}</h4>
                  <span className="text-xs text-muted-foreground">{phase.duration}</span>
                </div>
                <div className="ml-10 mt-2 space-y-1.5">
                  {phase.goals.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                        Goals
                      </p>
                      {phase.goals.map((g, j) => (
                        <p key={j} className="mt-0.5 text-sm text-muted-foreground">{g}</p>
                      ))}
                    </div>
                  )}
                  {phase.actions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                        Actions
                      </p>
                      {phase.actions.map((a, j) => (
                        <p key={j} className="mt-0.5 text-sm text-muted-foreground">{a}</p>
                      ))}
                    </div>
                  )}
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

import type { CompetitorPositioningData } from '@/frameworks/types';

interface Props {
  data: CompetitorPositioningData;
  subPage?: number;
}

const THREAT_STYLE: Record<string, string> = {
  high: 'text-rose-500',
  medium: 'text-amber-600',
  low: 'text-muted-foreground',
};

const SIZE_PX: Record<string, string> = {
  small: 'size-3',
  medium: 'size-4',
  large: 'size-5',
};

export default function CompetitorPositioning({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: 포지셔닝 맵 (2축) */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            포지셔닝 맵
          </h3>
          <div className="relative mx-auto aspect-square max-w-[480px] rounded-xl border bg-muted/30">
            {/* Y-axis label */}
            <div className="absolute -left-2 top-1/2 -translate-x-full -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] font-semibold text-muted-foreground/70">
              {data.axes.y.label}
            </div>
            {/* X-axis label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-muted-foreground/70">
              {data.axes.x.label}
            </div>
            {/* Axis endpoints */}
            <span className="absolute bottom-1 left-1 text-[9px] text-muted-foreground/50">{data.axes.x.lowEnd}</span>
            <span className="absolute bottom-1 right-1 text-[9px] text-muted-foreground/50">{data.axes.x.highEnd}</span>
            <span className="absolute left-1 top-1 text-[9px] text-muted-foreground/50">{data.axes.y.highEnd}</span>
            <span className="absolute bottom-1 left-1 mt-3 text-[9px] text-muted-foreground/50">{data.axes.y.lowEnd}</span>
            {/* Grid lines */}
            <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
            {/* Dots */}
            {data.positions.map((pos) => (
              <div
                key={pos.name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, bottom: `${pos.y}%` }}
              >
                <div
                  className={`rounded-full ${pos.isOurs ? 'bg-indigo-600' : 'bg-rose-400'} ${SIZE_PX[pos.size ?? 'medium']}`}
                />
                <span className={`absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium ${pos.isOurs ? 'text-indigo-600' : 'text-muted-foreground'}`}>
                  {pos.name}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-indigo-600" />
              <span>우리 서비스</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-rose-400" />
              <span>경쟁사</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub 1: 경쟁사 취약점 분석 */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            경쟁사 취약점 분석
          </h3>
          <div className="space-y-4">
            {data.vulnerabilities.map((v, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h4 className="font-semibold">{v.competitor}</h4>
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-500">약점</span>
                    <p className="mt-0.5 text-sm">{v.weakness}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600">공략 전략</span>
                    <p className="mt-0.5 text-sm">{v.exploitStrategy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              대체재
            </h4>
            <div className="divide-y">
              {data.substitutes.map((s, i) => (
                <div key={i} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-baseline gap-3">
                    <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold">{s.name}</h4>
                  </div>
                  <div className="ml-10 mt-1 space-y-0.5">
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    <p className="text-xs text-muted-foreground/70">전환 비용: {s.switchingCost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 2: 차별화 기회 */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            시장 공백 (White Space)
          </h3>
          <div className="divide-y">
            {data.marketWhitespace.map((ws, i) => (
              <div key={i} className="flex gap-4 py-3.5">
                <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] leading-relaxed">{ws}</p>
              </div>
            ))}
          </div>

          {data.indirectCompetitors.length > 0 && (
            <div className="mt-10">
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                간접 경쟁자
              </h4>
              <div className="divide-y text-sm">
                <div className="grid grid-cols-[1fr_2fr_72px] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  <span>경쟁자</span>
                  <span>겹치는 영역</span>
                  <span>위협 수준</span>
                </div>
                {data.indirectCompetitors.map((ic, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr_72px] gap-4 py-3">
                    <span className="font-medium">{ic.name}</span>
                    <span className="text-muted-foreground">{ic.overlapArea}</span>
                    <span className={`text-xs font-bold uppercase ${THREAT_STYLE[ic.threatLevel] ?? ''}`}>
                      {ic.threatLevel}
                    </span>
                  </div>
                ))}
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

import type { ImplicationsData } from '@/frameworks/types';

interface Props {
  data: ImplicationsData;
  subPage?: number;
}

const PRI: Record<string, string> = {
  high: 'text-rose-500', medium: 'text-amber-600', low: 'text-muted-foreground',
};

export default function FinalImplications({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Key Insights */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">핵심 시사점</h3>
          <div className="mt-4 divide-y">
            {data.keyInsights.map((insight, i) => (
              <div key={i} className="flex gap-4 py-4">
                <span className="w-6 shrink-0 text-lg font-bold tabular-nums text-indigo-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 1: Action Items */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">액션 아이템</h3>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-[72px_1fr_100px_100px_1fr] gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>우선순위</span><span>액션</span><span>일정</span><span>담당</span><span>기대 성과</span>
            </div>
            {data.actionItems.map((item, i) => (
              <div key={i} className="grid grid-cols-[72px_1fr_100px_100px_1fr] gap-4 py-3">
                <span className={`text-xs font-bold uppercase ${PRI[item.priority] ?? ''}`}>{item.priority}</span>
                <span className="font-medium">{item.action}</span>
                <span className="text-muted-foreground">{item.timeline}</span>
                <span className="text-muted-foreground">{item.owner}</span>
                <span className="text-muted-foreground">{item.expectedOutcome}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 2: Roadmap */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">실행 로드맵</h3>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">{data.roadmap}</p>
        </div>
      )}

      {/* Sub 3: Conclusion */}
      {(all || subPage === 3) && (
        <div className={all ? 'mt-14' : ''}>
          <div className="border-l-2 border-indigo-600 pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">Conclusion</p>
            <p className="mt-3 text-base leading-relaxed">{data.conclusion}</p>
          </div>
        </div>
      )}
    </div>
  );
}

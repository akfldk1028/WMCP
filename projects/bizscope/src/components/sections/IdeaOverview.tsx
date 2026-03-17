import type { IdeaOverviewData } from '@/frameworks/types';

interface Props {
  data: IdeaOverviewData;
  subPage?: number;
}

export default function IdeaOverview({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Idea intro */}
      {(all || subPage === 0) && (
        <div className="space-y-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              {data.category}
            </span>
            <h3 className="mt-3 text-xl font-bold tracking-tight lg:text-2xl">
              {data.ideaName}
            </h3>
            {data.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full border px-3 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              타겟 사용자
            </h4>
            <p className="mt-2 text-[15px] leading-relaxed">{data.targetUser}</p>
          </div>
        </div>
      )}

      {/* Sub 1: Problem & Solution */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-10' : 'space-y-10'}>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              문제 정의
            </h4>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {data.problemStatement}
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              솔루션
            </h4>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {data.solution}
            </p>
          </div>
        </div>
      )}

      {/* Sub 2: Unique Value */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16' : ''}>
          <div className="border-l-2 border-indigo-600 pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Unique Value
            </p>
            <p className="mt-3 text-base leading-relaxed">{data.uniqueValue}</p>
          </div>
        </div>
      )}
    </div>
  );
}

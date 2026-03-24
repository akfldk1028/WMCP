import type { IdeaReferenceCaseData } from '@/frameworks/types';

interface Props {
  data: IdeaReferenceCaseData;
  subPage?: number;
}

export default function IdeaReferenceCase({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: 유사 스타트업 성공사례 */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            유사 스타트업 성공사례
          </h3>
          <div className="space-y-6">
            {data.successCases.map((c, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold">{c.company}</h4>
                    <span className="text-xs text-muted-foreground">{c.industry}</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">유사점</span>
                    <p className="mt-0.5 text-sm">{c.similarity}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">전략</span>
                    <p className="mt-0.5 text-sm">{c.strategy}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600">성과</span>
                    <p className="mt-0.5 text-sm">{c.outcome}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">성공까지 소요</span>
                    <p className="mt-0.5 text-sm">{c.timeToSuccess}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-indigo-600">핵심 교훈</span>
                  <p className="mt-0.5 text-sm text-indigo-600">{c.keyLesson}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 1: 실패 사례 & 교훈 */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            실패 사례 & 교훈
          </h3>
          <div className="rounded-xl border border-rose-200 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500 text-sm font-bold text-white">
                !
              </span>
              <div>
                <h4 className="font-semibold">{data.failureCase.company}</h4>
                <span className="text-xs text-muted-foreground">{data.failureCase.industry}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-500">실패 원인</span>
                <p className="mt-0.5 text-sm">{data.failureCase.reason}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">교훈</span>
                <p className="mt-0.5 text-sm">{data.failureCase.lesson}</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              시사점
            </h4>
            <div className="divide-y">
              {data.implications.map((imp, i) => (
                <div key={i} className="flex gap-4 py-3.5">
                  <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[15px] leading-relaxed">{imp}</p>
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

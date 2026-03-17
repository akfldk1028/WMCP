import type { BusinessModelData } from '@/frameworks/types';

interface Props {
  data: BusinessModelData;
  subPage?: number;
}

export default function BusinessModel({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Revenue models */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            수익 모델 비교
          </h3>
          <div className="divide-y">
            {data.models.map((m, i) => (
              <div key={i} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <h4 className="text-sm font-bold">{m.modelType}</h4>
                  {m.recommended && (
                    <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                {m.pricing && (
                  <p className="mt-1 text-sm font-medium">{m.pricing}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
                      Pros
                    </p>
                    {m.pros.map((p, j) => (
                      <p key={j} className="mt-1 text-sm text-muted-foreground">+ {p}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-500">
                      Cons
                    </p>
                    {m.cons.map((c, j) => (
                      <p key={j} className="mt-1 text-sm text-muted-foreground">- {c}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 1: Unit economics */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            단위 경제성
          </h3>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-2 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>지표</span>
              <span>값</span>
            </div>
            {data.unitEconomics.map((ue, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 py-3">
                <span className="font-medium">{ue.metric}</span>
                <span className="text-muted-foreground">{ue.value}</span>
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

import type { BusinessModelDetailData } from '@/frameworks/types';

interface Props {
  data: BusinessModelDetailData;
  subPage?: number;
}

export default function BusinessModelDetail({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Business Model Type */}
      {(all || subPage === 0) && (
        <div className="space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              {data.businessModelType}
            </span>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{data.summary}</p>
          </div>
          {data.platformComponents && data.platformComponents.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                플랫폼 구성요소
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.platformComponents.map((c, i) => (
                  <span key={i} className="rounded-full border px-3 py-1 text-sm">{c}</span>
                ))}
              </div>
            </div>
          )}
          {data.keyPartners && data.keyPartners.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                핵심 파트너
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.keyPartners.map((p, i) => (
                  <span key={i} className="rounded-full border px-3 py-1 text-sm">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub 1: Revenue Streams + Value Chain */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-14' : 'space-y-14'}>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              수익 구조
            </h3>
            <div className="mt-4 space-y-0 divide-y">
              {data.revenueStreams.map((r, i) => (
                <div key={i} className="flex items-start gap-4 py-3.5">
                  <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.name}</span>
                      {r.percentage && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">{r.percentage}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {data.commissionStructure && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                수수료 구조
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.commissionStructure}</p>
            </div>
          )}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              가치사슬
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {data.valueChain.map((v, i) => (
                <span key={i} className="flex items-center gap-2 text-sm font-medium">
                  {v}
                  {i < data.valueChain.length - 1 && <span className="text-muted-foreground/40">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

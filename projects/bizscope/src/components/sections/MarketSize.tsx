import type { MarketSizeData, MarketSizeEntry } from '@/frameworks/types';

interface Props {
  data: MarketSizeData;
  subPage?: number;
}

function FunnelBar({ label, entry, width }: { label: string; entry: MarketSizeEntry; width: string }) {
  return (
    <div className="flex items-start gap-6">
      <div className="w-16 shrink-0 pt-2 text-right">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">{label}</span>
      </div>
      <div className="flex-1">
        <div className="rounded border bg-muted/30 px-4 py-3" style={{ width }}>
          <p className="text-lg font-bold tracking-tight">{entry.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{entry.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function MarketSize({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: TAM/SAM/SOM funnel */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            TAM / SAM / SOM
          </h3>
          <div className="mt-6 space-y-3">
            <FunnelBar label="TAM" entry={data.tam} width="100%" />
            <FunnelBar label="SAM" entry={data.sam} width="66%" />
            <FunnelBar label="SOM" entry={data.som} width="36%" />
          </div>

          {data.growthRate && (
            <div className="mt-8">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                연간 성장률
              </h4>
              <p className="mt-2 text-xl font-bold tracking-tight text-indigo-600">
                {data.growthRate}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sub 1: Trends */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            시장 트렌드
          </h3>
          <div className="mt-4 divide-y">
            {data.trends.map((trend, i) => (
              <div key={i} className="flex gap-4 py-3.5">
                <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] leading-relaxed">{trend}</p>
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

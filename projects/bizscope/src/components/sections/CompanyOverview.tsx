import type { CompanyOverviewData } from '@/frameworks/types';

interface Props {
  data: CompanyOverviewData;
  subPage?: number;
}

export default function CompanyOverview({ data, subPage }: Props) {
  const all = subPage === undefined;

  const stats = [
    { label: '설립', value: data.founded },
    { label: '본사', value: data.headquarters },
    { label: '임직원', value: data.employees },
    { label: '매출', value: data.revenue },
  ].filter((s) => s.value);

  return (
    <div>
      {/* Sub 0: Intro + Stats */}
      {(all || subPage === 0) && (
        <div className="space-y-12">
          {/* Industry tag */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              {data.industry}
            </span>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          </div>

          {/* Big stats row */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                    {s.label}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-tight tracking-tight lg:text-2xl">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub 1: Products + Strengths */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-14' : 'space-y-14'}>
          {/* Products — clean horizontal list */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              주요 제품 / 서비스
            </h3>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {data.mainProducts.map((p, i) => (
                <span key={p} className="text-[15px] font-medium">
                  {p}
                  {i < data.mainProducts.length - 1 && (
                    <span className="ml-6 text-border">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Strengths — numbered with left accent */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              핵심 강점
            </h3>
            <div className="mt-4 space-y-0 divide-y">
              {data.keyStrengths.map((s, i) => (
                <div key={i} className="flex gap-4 py-3.5">
                  <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[15px] leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 2: News */}
      {(all || subPage === 2) && data.recentNews.length > 0 && (
        <div className={all ? 'mt-16' : ''}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            최근 동향
          </h3>
          <div className="mt-4 space-y-0 divide-y">
            {data.recentNews.map((n, i) => (
              <div key={i} className="py-3.5">
                <p className="text-[15px] leading-relaxed text-muted-foreground">{n}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

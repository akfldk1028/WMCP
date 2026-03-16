import type { PriorityMatrixData } from '@/frameworks/types';
import PriorityMatrixChart from '@/components/charts/PriorityMatrixChart';

interface Props {
  data: PriorityMatrixData;
  subPage?: number;
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function PriorityMatrix({ data, subPage }: Props) {
  const all = subPage === undefined;
  const topSet = new Set(data.topPicks);

  return (
    <div>
      {(all || subPage === 0) && (
        <>
          <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
            도출된 전략을 <strong className="text-foreground">실행 난이도</strong>와 <strong className="text-foreground">기대 효과</strong> 기준으로 우선순위를 산정합니다.
          </p>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <PriorityMatrixChart strategies={data.strategies} />
            </div>
            <div className="divide-y lg:col-span-2">
              {data.strategies.sort((a, b) => a.rank - b.rank).map((s, i) => {
                const isTop = topSet.has(s.strategy);
                return (
                  <div key={s.id} className="flex gap-3 py-2.5">
                    <span className={`w-6 shrink-0 text-sm font-bold tabular-nums ${isTop ? 'text-indigo-600' : 'text-muted-foreground/50'}`}>
                      {ALPHA[i]}
                    </span>
                    <span className={`text-sm leading-relaxed ${isTop ? 'font-medium' : 'text-muted-foreground'}`}>{s.strategy}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {(all || subPage === 1) && data.topPicks.length > 0 && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            Quick Win — 실행 용이 + 높은 Impact
          </h3>
          <div className="mt-4 divide-y">
            {data.strategies.filter((s) => topSet.has(s.strategy)).sort((a, b) => a.rank - b.rank).map((s, i) => (
              <div key={s.id} className="flex gap-4 py-3">
                <span className="w-6 shrink-0 text-lg font-bold tabular-nums text-indigo-600">#{i + 1}</span>
                <p className="text-[15px] font-medium leading-relaxed">{s.strategy}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

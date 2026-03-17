import type { PriorityMatrixData } from '@/frameworks/types';
import PriorityMatrixChart from '@/components/charts/PriorityMatrixChart';

interface Props {
  data: PriorityMatrixData;
  subPage?: number;
}

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
          <PriorityMatrixChart strategies={data.strategies} />
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

import type { MatrixData } from '@/frameworks/types';
import MatrixPlot from '@/components/charts/MatrixPlot';

interface Props {
  data: MatrixData;
  subPage?: number;
}

const QUAD = [
  { key: 'high-high', label: 'High Priority', color: 'text-emerald-600' },
  { key: 'low-high', label: 'Monitor', color: 'text-amber-600' },
  { key: 'high-low', label: 'Consider', color: 'text-blue-600' },
  { key: 'low-low', label: 'Low Priority', color: 'text-muted-foreground' },
] as const;

export default function PossibilityImpactMatrix({ data, subPage }: Props) {
  const all = subPage === undefined;
  const counts: Record<string, number> = { 'high-high': 0, 'high-low': 0, 'low-high': 0, 'low-low': 0 };
  for (const p of data.points) counts[p.quadrant]++;

  return (
    <div>
      {(all || subPage === 0) && (
        <>
          <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
            PEST 분석에서 도출된 요인들의 발생 가능성과 영향도를 2×2 매트릭스로 시각화합니다.
          </p>
          <MatrixPlot points={data.points} />
        </>
      )}

      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-4">
            {QUAD.map((q) => (
              <div key={q.key}>
                <p className="text-4xl font-bold tabular-nums">{counts[q.key]}</p>
                <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${q.color}`}>{q.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

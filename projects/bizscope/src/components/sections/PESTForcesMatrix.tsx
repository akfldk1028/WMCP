import type { PESTForcesMatrixData } from '@/frameworks/types';

interface Props {
  data: PESTForcesMatrixData;
  subPage?: number;
}

const AXIS_SHORT: Record<string, string> = {
  rivalry: '경쟁',
  newEntrants: '진입',
  supplierPower: '공급',
  buyerPower: '구매',
  substitutes: '대체',
};

export default function PESTForcesMatrix({ data, subPage }: Props) {
  const all = subPage === undefined;

  // Build unique axes and PEST factors for table
  const axes = [...new Set(data.cells.map(c => c.axis))];
  const pestFactors = [...new Map(data.cells.map(c => [c.pestFactorId, { id: c.pestFactorId, name: c.pestFactor, category: c.pestCategory }])).values()];

  const getCell = (factorId: string, axis: string) =>
    data.cells.find(c => c.pestFactorId === factorId && c.axis === axis);

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'political': return 'bg-blue-50 text-blue-700';
      case 'economic': return 'bg-emerald-50 text-emerald-700';
      case 'social': return 'bg-amber-50 text-amber-700';
      case 'technological': return 'bg-purple-50 text-purple-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div>
      {(all || subPage === 0) && (
        <div className="space-y-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            PEST &times; 5Forces 교차 매트릭스
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-2 text-left font-semibold">요인</th>
                  <th className="pb-2 pr-1 text-left font-semibold">분류</th>
                  {axes.map(a => (
                    <th key={a} className="pb-2 px-1 text-center font-semibold">{AXIS_SHORT[a] || a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pestFactors.map((f) => (
                  <tr key={f.id} className="border-b">
                    <td className="py-1.5 pr-2 text-xs">{f.name}</td>
                    <td className="py-1.5 pr-1">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryColor(f.category)}`}>
                        {f.category.charAt(0).toUpperCase()}
                      </span>
                    </td>
                    {axes.map(a => {
                      const cell = getCell(f.id, a);
                      const score = cell?.influenceScore ?? 0;
                      return (
                        <td key={a} className="py-1.5 px-1 text-center tabular-nums">
                          <span className={score > 0 ? 'text-emerald-600 font-medium' : score < 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                            {score > 0 ? `+${score}` : score}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-8' : 'space-y-8'}>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              PEST 요인 영향력 랭킹
            </h3>
            <div className="mt-4 space-y-0 divide-y">
              {data.priorityRanking.slice(0, 10).map((item) => (
                <div key={item.rank} className="flex items-center gap-4 py-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-[10px] font-bold text-white">
                    {item.rank}
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.pestFactor}</span>
                  <span className="text-sm font-bold tabular-nums text-indigo-600">{item.totalInfluence.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </div>
      )}
    </div>
  );
}

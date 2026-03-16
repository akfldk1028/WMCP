import type { TOWSCell } from '@/frameworks/types';

interface Props {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  cells: TOWSCell[];
}

/** PPT color scheme: SO=pink, ST=red, WO=purple, WT=dark-purple */
function getCellColor(swType: 'S' | 'W', otType: 'O' | 'T', active: boolean): string {
  if (!active) return 'bg-slate-50';
  if (swType === 'S' && otType === 'O') return 'bg-pink-200 text-pink-900';
  if (swType === 'S' && otType === 'T') return 'bg-red-200 text-red-900';
  if (swType === 'W' && otType === 'O') return 'bg-purple-200 text-purple-900';
  return 'bg-purple-400 text-white'; // WT
}

function getQuadrantLabel(swType: 'S' | 'W', otType: 'O' | 'T'): string {
  if (swType === 'S' && otType === 'O') return 'SO 전략';
  if (swType === 'S' && otType === 'T') return 'ST 전략';
  if (swType === 'W' && otType === 'O') return 'WO 전략';
  return 'WT 전략';
}

export default function TOWSHeatmap({ strengths, weaknesses, opportunities, threats, cells }: Props) {
  const cellMap = new Map<string, TOWSCell>();
  cells.forEach((c) => {
    cellMap.set(`${c.swType}${c.swIndex}-${c.otType}${c.otIndex}`, c);
  });

  const renderQuadrant = (
    swType: 'S' | 'W',
    swItems: string[],
    otType: 'O' | 'T',
    otItems: string[],
  ) => {
    const label = getQuadrantLabel(swType, otType);
    return (
      <div key={`${swType}-${otType}`}>
        <div className="mb-1 text-xs font-bold text-slate-500">{label}</div>
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-1 text-left text-slate-500" />
                {otItems.map((_, j) => (
                  <th key={j} className="p-1 text-center font-medium text-slate-600">
                    {otType}{j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {swItems.map((_, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap p-1 font-medium text-slate-600">
                    {swType}{i + 1}
                  </td>
                  {otItems.map((_, j) => {
                    const key = `${swType}${i + 1}-${otType}${j + 1}`;
                    const cell = cellMap.get(key);
                    const active = !!cell?.active;
                    return (
                      <td
                        key={j}
                        className={`p-1 text-center font-semibold ${getCellColor(swType, otType, active)}`}
                        title={cell?.strategyCode}
                      >
                        {active ? cell!.strategyCode : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-pink-200" /> SO (공격적)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-red-200" /> ST (다각화)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-purple-200" /> WO (방향전환)</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-purple-400" /> WT (방어적)</span>
      </div>

      {/* Header: O/T labels */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
            기회 (Opportunities)
          </div>
          <ul className="mb-3 space-y-0.5 text-xs text-slate-600">
            {opportunities.map((o, i) => (
              <li key={i}><span className="font-semibold text-blue-600">O{i + 1}</span>: {o}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 rounded bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
            위협 (Threats)
          </div>
          <ul className="mb-3 space-y-0.5 text-xs text-slate-600">
            {threats.map((t, i) => (
              <li key={i}><span className="font-semibold text-orange-600">T{i + 1}</span>: {t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* S/W labels */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div>
          <div className="mb-2 rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
            강점 (Strengths)
          </div>
          <ul className="mb-3 space-y-0.5 text-xs text-slate-600">
            {strengths.map((s, i) => (
              <li key={i}><span className="font-semibold text-green-600">S{i + 1}</span>: {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
            약점 (Weaknesses)
          </div>
          <ul className="mb-3 space-y-0.5 text-xs text-slate-600">
            {weaknesses.map((w, i) => (
              <li key={i}><span className="font-semibold text-red-600">W{i + 1}</span>: {w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4 Quadrant Tables */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderQuadrant('S', strengths, 'O', opportunities)}
        {renderQuadrant('S', strengths, 'T', threats)}
        {renderQuadrant('W', weaknesses, 'O', opportunities)}
        {renderQuadrant('W', weaknesses, 'T', threats)}
      </div>
    </div>
  );
}

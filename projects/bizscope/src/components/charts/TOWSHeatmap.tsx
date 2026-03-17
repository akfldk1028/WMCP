import type { TOWSCell } from '@/frameworks/types';

interface Props {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  cells: TOWSCell[];
}

function getQuadrantLabel(swType: 'S' | 'W', otType: 'O' | 'T'): { label: string; code: string } {
  if (swType === 'S' && otType === 'O') return { label: '공격적', code: 'SO' };
  if (swType === 'S' && otType === 'T') return { label: '다각화', code: 'ST' };
  if (swType === 'W' && otType === 'O') return { label: '방향전환', code: 'WO' };
  return { label: '방어적', code: 'WT' };
}

export default function TOWSHeatmap({ strengths, weaknesses, opportunities, threats, cells }: Props) {
  const cellMap = new Map<string, TOWSCell>();
  cells.forEach((c) => cellMap.set(`${c.swType}${c.swIndex}-${c.otType}${c.otIndex}`, c));

  const renderQuadrant = (swType: 'S' | 'W', swItems: string[], otType: 'O' | 'T', otItems: string[]) => {
    const { label, code } = getQuadrantLabel(swType, otType);
    return (
      <div key={`${swType}-${otType}`}>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
          {code} <span className="font-medium normal-case">{label}</span>
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              <th className="pb-1.5 text-left text-muted-foreground/50 w-8" />
              {otItems.map((_, j) => (
                <th key={j} className="pb-1.5 text-center text-[10px] font-medium text-muted-foreground/60 w-10">
                  {otType}{j + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {swItems.map((_, i) => (
              <tr key={i} className="border-b border-border/20">
                <td className="py-1.5 text-[10px] font-medium text-muted-foreground/60">{swType}{i + 1}</td>
                {otItems.map((_, j) => {
                  const key = `${swType}${i + 1}-${otType}${j + 1}`;
                  const cell = cellMap.get(key);
                  const active = !!cell?.active;
                  return (
                    <td key={j} className="py-1.5 text-center">
                      {active ? (
                        <span className="text-[10px] font-bold text-indigo-600">{cell!.strategyCode}</span>
                      ) : (
                        <span className="text-muted-foreground/20">&middot;</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* S/W and O/T labels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">Internal</p>
          <div className="divide-y divide-border/40">
            {strengths.map((s, i) => (
              <p key={i} className="py-1.5 text-xs text-muted-foreground">
                <span className="mr-2 font-bold text-sky-600">S{i + 1}</span>{s}
              </p>
            ))}
            {weaknesses.map((w, i) => (
              <p key={i} className="py-1.5 text-xs text-muted-foreground">
                <span className="mr-2 font-bold text-rose-500">W{i + 1}</span>{w}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">External</p>
          <div className="divide-y divide-border/40">
            {opportunities.map((o, i) => (
              <p key={i} className="py-1.5 text-xs text-muted-foreground">
                <span className="mr-2 font-bold text-emerald-600">O{i + 1}</span>{o}
              </p>
            ))}
            {threats.map((t, i) => (
              <p key={i} className="py-1.5 text-xs text-muted-foreground">
                <span className="mr-2 font-bold text-amber-600">T{i + 1}</span>{t}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Quadrant tables */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {renderQuadrant('S', strengths, 'O', opportunities)}
        {renderQuadrant('S', strengths, 'T', threats)}
        {renderQuadrant('W', weaknesses, 'O', opportunities)}
        {renderQuadrant('W', weaknesses, 'T', threats)}
      </div>
    </div>
  );
}

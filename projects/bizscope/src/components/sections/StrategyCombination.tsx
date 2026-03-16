import type { StrategyCombinationData } from '@/frameworks/types';
import CombinationTable from '@/components/charts/CombinationTable';

interface Props {
  data: StrategyCombinationData;
  subPage?: number;
}

const COMBO = [
  { type: 'SO' as const, label: '공격적 전략', color: 'text-emerald-600' },
  { type: 'ST' as const, label: '다각화 전략', color: 'text-blue-600' },
  { type: 'WO' as const, label: '방향전환 전략', color: 'text-amber-600' },
  { type: 'WT' as const, label: '방어적 전략', color: 'text-rose-500' },
];

export default function StrategyCombination({ data, subPage }: Props) {
  const all = subPage === undefined;
  const counts: Record<string, number> = { SO: 0, ST: 0, WO: 0, WT: 0 };
  for (const s of data.strategies) counts[s.combination]++;

  return (
    <div>
      {(all || subPage === 0) && (
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-4">
          {COMBO.map((c) => (
            <div key={c.type}>
              <p className="text-4xl font-bold tabular-nums">{counts[c.type]}</p>
              <p className="mt-0.5 text-sm font-bold">{c.type}</p>
              <p className={`text-[11px] font-semibold ${c.color}`}>{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}><CombinationTable strategies={data.strategies} /></div>
      )}

      {(all || subPage === 2) && (
        <div className={all ? 'mt-14' : ''}>
          <div className="border-l-2 border-indigo-600 pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">Key Takeaway</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

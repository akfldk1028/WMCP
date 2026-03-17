'use client';

import type { StrategyItem } from '@/frameworks/types';

interface CombinationTableProps {
  strategies: StrategyItem[];
}

type Combination = 'SO' | 'ST' | 'WO' | 'WT';

const COMBO_ORDER: Combination[] = ['SO', 'ST', 'WO', 'WT'];

const COMBO_META: Record<Combination, { label: string; desc: string }> = {
  SO: { label: 'SO', desc: '강점으로 기회 활용' },
  ST: { label: 'ST', desc: '강점으로 위협 대응' },
  WO: { label: 'WO', desc: '약점 보완하여 기회 활용' },
  WT: { label: 'WT', desc: '약점 보완하여 위협 최소화' },
};

export default function CombinationTable({ strategies }: CombinationTableProps) {
  const grouped: Record<Combination, StrategyItem[]> = { SO: [], ST: [], WO: [], WT: [] };
  for (const s of strategies) grouped[s.combination as Combination]?.push(s);

  return (
    <div className="space-y-8">
      {/* 2x2 Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-foreground/20">
              <th className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-28" />
              <th className="pb-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Opportunities (O)
              </th>
              <th className="pb-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-rose-500">
                Threats (T)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/40">
              <th className="py-3 pr-3 text-left text-[10px] font-semibold uppercase tracking-wider text-sky-600 align-top">
                Strengths (S)
              </th>
              <MatrixCell items={grouped.SO} combo="SO" />
              <MatrixCell items={grouped.ST} combo="ST" />
            </tr>
            <tr className="border-b border-border/40">
              <th className="py-3 pr-3 text-left text-[10px] font-semibold uppercase tracking-wider text-amber-600 align-top">
                Weaknesses (W)
              </th>
              <MatrixCell items={grouped.WO} combo="WO" />
              <MatrixCell items={grouped.WT} combo="WT" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strategy details */}
      {COMBO_ORDER.map((combo) => {
        const items = grouped[combo];
        if (items.length === 0) return null;
        const meta = COMBO_META[combo];
        return (
          <div key={combo}>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-sm font-bold">{meta.label}</span>
              <span className="text-[11px] text-muted-foreground/60">{meta.desc}</span>
            </div>
            <div className="divide-y divide-border/40">
              {items.map((item) => (
                <div key={item.id} className="py-3">
                  <p className="text-sm font-medium">{item.strategy}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  {(item.relatedSW || item.relatedOT) && (
                    <div className="mt-1.5 flex gap-2">
                      {item.relatedSW && <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">{item.relatedSW}</code>}
                      {item.relatedOT && <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">{item.relatedOT}</code>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatrixCell({ items, combo }: { items: StrategyItem[]; combo: Combination }) {
  return (
    <td className="px-3 py-3 align-top w-1/2">
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground/30">&mdash;</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, idx) => (
            <li key={item.id} className="text-xs leading-relaxed">
              <span className="mr-1 font-bold text-muted-foreground/60">{combo}{idx + 1}.</span>
              {item.strategy}
            </li>
          ))}
        </ul>
      )}
    </td>
  );
}

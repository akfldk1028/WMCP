'use client';

import type { StrategyItem } from '@/frameworks/types';

interface CombinationTableProps {
  strategies: StrategyItem[];
}

type Combination = 'SO' | 'ST' | 'WO' | 'WT';

const COMBO_CONFIG: Record<Combination, { label: string; desc: string; bg: string; border: string; headerBg: string }> = {
  SO: {
    label: 'SO 전략',
    desc: '강점으로 기회 활용',
    bg: 'bg-green-50',
    border: 'border-green-200',
    headerBg: 'bg-green-100',
  },
  ST: {
    label: 'ST 전략',
    desc: '강점으로 위협 대응',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    headerBg: 'bg-blue-100',
  },
  WO: {
    label: 'WO 전략',
    desc: '약점 보완하여 기회 활용',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    headerBg: 'bg-yellow-100',
  },
  WT: {
    label: 'WT 전략',
    desc: '약점 보완하여 위협 최소화',
    bg: 'bg-red-50',
    border: 'border-red-200',
    headerBg: 'bg-red-100',
  },
};

export default function CombinationTable({ strategies }: CombinationTableProps) {
  const grouped: Record<Combination, StrategyItem[]> = {
    SO: strategies.filter((s) => s.combination === 'SO'),
    ST: strategies.filter((s) => s.combination === 'ST'),
    WO: strategies.filter((s) => s.combination === 'WO'),
    WT: strategies.filter((s) => s.combination === 'WT'),
  };

  return (
    <div className="space-y-6">
      {/* 2x2 Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 w-28" />
              <th className="border border-gray-300 bg-emerald-100 px-3 py-2 text-center font-semibold text-emerald-800">
                Opportunities (O)
              </th>
              <th className="border border-gray-300 bg-rose-100 px-3 py-2 text-center font-semibold text-rose-800">
                Threats (T)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border border-gray-300 bg-sky-100 px-3 py-2 text-center font-semibold text-sky-800 align-middle">
                Strengths (S)
              </th>
              <MatrixCell items={grouped.SO} combo="SO" />
              <MatrixCell items={grouped.ST} combo="ST" />
            </tr>
            <tr>
              <th className="border border-gray-300 bg-amber-100 px-3 py-2 text-center font-semibold text-amber-800 align-middle">
                Weaknesses (W)
              </th>
              <MatrixCell items={grouped.WO} combo="WO" />
              <MatrixCell items={grouped.WT} combo="WT" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed strategy cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(['SO', 'ST', 'WO', 'WT'] as Combination[]).map((combo) => {
          const items = grouped[combo];
          const config = COMBO_CONFIG[combo];
          if (items.length === 0) return null;
          return (
            <div key={combo} className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${config.headerBg}`}>
                  {combo}
                </span>
                <span className="text-xs text-slate-600">{config.desc}</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id}>
                    <p className="text-sm font-medium text-gray-800">{item.strategy}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.relatedSW && (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700">
                          {item.relatedSW}
                        </span>
                      )}
                      {item.relatedOT && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                          {item.relatedOT}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatrixCell({ items, combo }: { items: StrategyItem[]; combo: Combination }) {
  const config = COMBO_CONFIG[combo];
  return (
    <td className={`border ${config.border} ${config.bg} p-3 align-top w-1/2`}>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic">-</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={item.id}>
              <p className="text-sm font-medium text-gray-800">
                <span className="mr-1 text-xs font-bold text-slate-500">{combo}{idx + 1}.</span>
                {item.strategy}
              </p>
            </li>
          ))}
        </ul>
      )}
    </td>
  );
}

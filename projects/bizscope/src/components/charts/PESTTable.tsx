'use client';

import type { PESTFactor, PESTCategory } from '@/frameworks/types';

interface PESTTableProps {
  factors: PESTFactor[];
}

const CATEGORY_CONFIG: Record<
  PESTCategory,
  { label: string; fullLabel: string; prefix: string; color: string; headerBg: string; rowBg: string }
> = {
  political: {
    label: 'P',
    fullLabel: 'Politics',
    prefix: 'P',
    color: 'text-blue-800',
    headerBg: 'bg-blue-50 border-blue-200',
    rowBg: 'bg-blue-50/30',
  },
  economic: {
    label: 'E',
    fullLabel: 'Economics',
    prefix: 'E',
    color: 'text-amber-800',
    headerBg: 'bg-amber-50 border-amber-200',
    rowBg: 'bg-amber-50/30',
  },
  social: {
    label: 'S',
    fullLabel: 'Social',
    prefix: 'S',
    color: 'text-green-800',
    headerBg: 'bg-green-50 border-green-200',
    rowBg: 'bg-green-50/30',
  },
  technological: {
    label: 'T',
    fullLabel: 'Technical',
    prefix: 'T',
    color: 'text-purple-800',
    headerBg: 'bg-purple-50 border-purple-200',
    rowBg: 'bg-purple-50/30',
  },
};

const CATEGORY_ORDER: PESTCategory[] = [
  'political',
  'economic',
  'social',
  'technological',
];

const FORCE_KEYS = [
  { key: 'rivalry' as const, label: '경쟁' },
  { key: 'newEntrants' as const, label: '신규' },
  { key: 'supplierPower' as const, label: '공급' },
  { key: 'buyerPower' as const, label: '구매' },
  { key: 'substitutes' as const, label: '대체' },
];

function ScoreCircle({ value, highlight }: { value: number; highlight?: boolean }) {
  const pct = Math.round((value / 5) * 100);
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold
        ${highlight
          ? 'bg-red-400 text-white'
          : 'border border-red-300 bg-white text-red-600'
        }`}
    >
      {pct}%
    </span>
  );
}

function PossibilityBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    HIGH: 'text-red-700 font-bold',
    'MIDDLE HIGH': 'text-orange-600 font-semibold',
    MIDDLE: 'text-amber-600 font-medium',
    LOW: 'text-slate-500',
  };
  return (
    <span className={`text-xs ${styles[level] ?? 'text-slate-600'}`}>
      {level}
    </span>
  );
}

function getPossibilityLevel(probability: number): string {
  if (probability >= 0.8) return 'HIGH';
  if (probability >= 0.6) return 'MIDDLE HIGH';
  if (probability >= 0.4) return 'MIDDLE';
  return 'LOW';
}

function getCompositeScore(factor: PESTFactor): number {
  const forces = factor.fiveForces;
  const avg = (forces.rivalry + forces.newEntrants + forces.supplierPower + forces.buyerPower + forces.substitutes) / 5;
  return Math.round((avg / 5) * 100);
}

export default function PESTTable({ factors }: PESTTableProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    config: CATEGORY_CONFIG[cat],
    items: factors.filter((f) => f.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        {/* Header */}
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-left font-semibold w-16">
              Factor
            </th>
            <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-left font-semibold w-28">
              Details
            </th>
            <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-left font-semibold">
              Implication
            </th>
            <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-center font-semibold w-20">
              Possibility
            </th>
            {FORCE_KEYS.map((fk) => (
              <th
                key={fk.key}
                className="border border-gray-300 bg-red-50 px-1 py-2 text-center font-semibold w-10 text-red-700"
              >
                {fk.label}
              </th>
            ))}
            <th className="border-2 border-sky-400 bg-sky-50 px-1 py-2 text-center font-bold w-10 text-sky-700">
              종합
            </th>
            <th className="border border-gray-300 bg-gray-100 px-2 py-2 text-center font-semibold w-10">
              OT
            </th>
          </tr>
        </thead>

        <tbody>
          {grouped.map(({ category, config, items }) => (
            <CategoryRows
              key={category}
              config={config}
              items={items}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryRows({
  config,
  items,
}: {
  config: (typeof CATEGORY_CONFIG)[PESTCategory];
  items: PESTFactor[];
}) {
  return (
    <>
      {items.map((factor, idx) => {
        const composite = getCompositeScore(factor);
        const possLevel = getPossibilityLevel(factor.probability);
        return (
          <tr key={factor.id} className={config.rowBg}>
            {/* Category label - only on first row, rowSpan */}
            {idx === 0 && (
              <td
                rowSpan={items.length}
                className={`border border-gray-300 px-2 py-2 text-center align-middle ${config.headerBg}`}
              >
                <div className={`text-lg font-bold ${config.color}`}>{config.label}</div>
                <div className={`text-[10px] ${config.color}`}>{config.fullLabel}</div>
              </td>
            )}
            {/* Factor details */}
            <td className="border border-gray-300 px-2 py-2 align-top">
              <span className="font-bold text-gray-800">
                {config.prefix}{idx + 1}.
              </span>{' '}
              <span className="text-gray-700">{factor.factor}</span>
            </td>
            {/* Implication */}
            <td className="border border-gray-300 px-2 py-2 text-gray-600 align-top leading-relaxed">
              {factor.implication || factor.description}
            </td>
            {/* Possibility */}
            <td className="border border-gray-300 px-2 py-2 text-center align-middle">
              <PossibilityBadge level={possLevel} />
            </td>
            {/* 5 Forces scores */}
            {FORCE_KEYS.map((fk) => (
              <td key={fk.key} className="border border-gray-300 px-1 py-2 text-center align-middle">
                <ScoreCircle value={factor.fiveForces[fk.key]} />
              </td>
            ))}
            {/* Composite */}
            <td className="border-2 border-sky-400 px-1 py-2 text-center align-middle">
              <ScoreCircle value={composite / 20} highlight />
            </td>
            {/* O/T */}
            <td className="border border-gray-300 px-2 py-2 text-center align-middle font-bold">
              {factor.classification === 'opportunity' ? (
                <span className="text-green-700">O</span>
              ) : (
                <span className="text-red-600">T</span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

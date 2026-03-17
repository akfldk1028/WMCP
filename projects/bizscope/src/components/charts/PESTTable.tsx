'use client';

import type { PESTFactor, PESTCategory } from '@/frameworks/types';

interface PESTTableProps {
  factors: PESTFactor[];
}

const CATEGORY_CONFIG: Record<PESTCategory, { label: string; full: string; accent: string }> = {
  political: { label: 'P', full: 'Political', accent: 'border-l-blue-600' },
  economic: { label: 'E', full: 'Economic', accent: 'border-l-amber-600' },
  social: { label: 'S', full: 'Social', accent: 'border-l-emerald-600' },
  technological: { label: 'T', full: 'Technological', accent: 'border-l-violet-600' },
};

const CATEGORY_ORDER: PESTCategory[] = ['political', 'economic', 'social', 'technological'];

const FORCE_KEYS = [
  { key: 'rivalry' as const, label: '경쟁' },
  { key: 'newEntrants' as const, label: '신규' },
  { key: 'supplierPower' as const, label: '공급' },
  { key: 'buyerPower' as const, label: '구매' },
  { key: 'substitutes' as const, label: '대체' },
];

function getPossibilityLevel(probability: number): string {
  if (probability >= 0.8) return 'HIGH';
  if (probability >= 0.6) return 'MID-H';
  if (probability >= 0.4) return 'MID';
  return 'LOW';
}

function getCompositeScore(factor: PESTFactor): number {
  const f = factor.fiveForces;
  return Math.round(((f.rivalry + f.newEntrants + f.supplierPower + f.buyerPower + f.substitutes) / 25) * 100);
}

export default function PESTTable({ factors }: PESTTableProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    config: CATEGORY_CONFIG[cat],
    items: factors.filter((f) => f.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b-2 border-foreground/20">
            <th className="pb-2.5 pl-3 pr-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-14">
              Factor
            </th>
            <th className="pb-2.5 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-28">
              Details
            </th>
            <th className="pb-2.5 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Implication
            </th>
            <th className="pb-2.5 px-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-14">
              Prob.
            </th>
            {FORCE_KEYS.map((fk) => (
              <th
                key={fk.key}
                className="pb-2.5 px-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-9"
              >
                {fk.label}
              </th>
            ))}
            <th className="pb-2.5 px-1 text-center text-[10px] font-bold uppercase tracking-wider text-indigo-600 w-10">
              종합
            </th>
            <th className="pb-2.5 px-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-8">
              O/T
            </th>
          </tr>
        </thead>
        <tbody>
          {grouped.flatMap(({ config, items }) =>
            items.map((factor, idx) => {
              const composite = getCompositeScore(factor);
              const probLevel = getPossibilityLevel(factor.probability);
              return (
                <tr key={factor.id} className="border-b border-border/40">
                  {idx === 0 && (
                    <td
                      rowSpan={items.length}
                      className={`border-l-2 ${config.accent} pl-2 pr-2 py-2 text-center align-middle`}
                    >
                      <span className="text-base font-bold">{config.label}</span>
                      <span className="block text-[9px] text-muted-foreground/50">{config.full}</span>
                    </td>
                  )}
                  <td className="px-2 py-2.5 align-top font-medium">
                    {config.label}{idx + 1}. {factor.factor}
                  </td>
                  <td className="px-2 py-2.5 text-muted-foreground align-top leading-relaxed">
                    {factor.implication || factor.description}
                  </td>
                  <td className="px-2 py-2.5 text-center align-middle">
                    <span
                      className={`text-[10px] font-semibold ${
                        probLevel === 'HIGH'
                          ? 'text-rose-500'
                          : probLevel === 'MID-H'
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {probLevel}
                    </span>
                  </td>
                  {FORCE_KEYS.map((fk) => (
                    <td
                      key={fk.key}
                      className="px-1 py-2.5 text-center align-middle tabular-nums text-muted-foreground"
                    >
                      {factor.fiveForces[fk.key]}
                    </td>
                  ))}
                  <td className="px-1 py-2.5 text-center align-middle">
                    <span className="text-sm font-bold tabular-nums text-indigo-600">{composite}%</span>
                  </td>
                  <td className="px-2 py-2.5 text-center align-middle font-bold">
                    {factor.classification === 'opportunity' ? (
                      <span className="text-emerald-600">O</span>
                    ) : (
                      <span className="text-rose-500">T</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

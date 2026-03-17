'use client';

import type { SevenSItem, SevenSElement } from '@/frameworks/types';

interface SevenSPyramidProps {
  items: SevenSItem[];
}

/** Consulting-style stacked pyramid with Strategy at top, Shared Value at bottom */
const PYRAMID_LAYERS: { element: SevenSElement; label: string; color: string; textColor: string }[] = [
  { element: 'strategy', label: 'Strategy', color: '#e0e7ff', textColor: '#4338ca' },
  { element: 'structure', label: 'Structure', color: '#eef2ff', textColor: '#4338ca' },
  { element: 'staff', label: 'Staff', color: '#f1f5f9', textColor: '#334155' },
  { element: 'skills', label: 'Skill', color: '#f1f5f9', textColor: '#334155' },
  { element: 'systems', label: 'System', color: '#f8fafc', textColor: '#334155' },
  { element: 'style', label: 'Style', color: '#f8fafc', textColor: '#334155' },
  { element: 'shared-values', label: 'Shared Value', color: '#4f46e5', textColor: '#ffffff' },
];

function getDifficultyImpactLabel(difficulty: number, impact: number): { dLabel: string; iLabel: string } {
  const toLabel = (v: number) => {
    if (v >= 4) return 'High';
    if (v >= 3) return 'Middle';
    return 'Low';
  };
  return { dLabel: toLabel(difficulty), iLabel: toLabel(impact) };
}

export default function SevenSPyramid({ items }: SevenSPyramidProps) {
  const itemMap = new Map<SevenSElement, SevenSItem>();
  for (const item of items) {
    itemMap.set(item.element, item);
  }

  const svgW = 500;
  const svgH = 380;
  const pyramidLeft = 40;
  const pyramidW = 180;
  const topY = 20;
  const layerH = (svgH - topY - 20) / PYRAMID_LAYERS.length;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[600px]">
        {PYRAMID_LAYERS.map((layer, i) => {
          const item = itemMap.get(layer.element);
          const y = topY + i * layerH;
          // Trapezoid: narrower at top, wider at bottom
          const topWidth = pyramidW * (0.3 + (i * 0.7) / PYRAMID_LAYERS.length);
          const bottomWidth = pyramidW * (0.3 + ((i + 1) * 0.7) / PYRAMID_LAYERS.length);
          const cx = pyramidLeft + pyramidW / 2;
          const topLeft = cx - topWidth / 2;
          const topRight = cx + topWidth / 2;
          const bottomLeft = cx - bottomWidth / 2;
          const bottomRight = cx + bottomWidth / 2;

          const points = `${topLeft},${y} ${topRight},${y} ${bottomRight},${y + layerH} ${bottomLeft},${y + layerH}`;

          return (
            <g key={layer.element}>
              {/* Pyramid layer */}
              <polygon
                points={points}
                fill={layer.color}
                stroke="#cbd5e1"
                strokeWidth={1}
              />
              <text
                x={cx}
                y={y + layerH / 2 + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight="600"
                fill={layer.textColor}
              >
                {layer.label}
              </text>

              {/* Right side: strategy info */}
              {item && (
                <>
                  {/* Connector line */}
                  <line
                    x1={bottomRight + 5}
                    y1={y + layerH / 2}
                    x2={250}
                    y2={y + layerH / 2}
                    stroke="#cbd5e1"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                  {/* Strategy codes */}
                  <g>
                    {item.relatedStrategies.slice(0, 3).map((strat, si) => (
                      <g key={si}>
                        <rect
                          x={255 + si * 52}
                          y={y + layerH / 2 - 10}
                          width={48}
                          height={20}
                          rx={3}
                          fill="#eef2ff"
                          stroke="#c7d2fe"
                          strokeWidth={0.5}
                        />
                        <text
                          x={255 + si * 52 + 24}
                          y={y + layerH / 2 + 4}
                          textAnchor="middle"
                          fontSize={9}
                          fill="#4338ca"
                          fontWeight="600"
                        >
                          {strat.length > 7 ? strat.slice(0, 7) : strat}
                        </text>
                      </g>
                    ))}
                  </g>
                  {/* Difficulty / Impact */}
                  {(() => {
                    const { dLabel, iLabel } = getDifficultyImpactLabel(item.difficulty, item.impact);
                    return (
                      <text
                        x={440}
                        y={y + layerH / 2 + 4}
                        textAnchor="start"
                        fontSize={9}
                        fill="#94a3b8"
                      >
                        D:{dLabel} I:{iLabel}
                      </text>
                    );
                  })()}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Details table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Element
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Current State
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Required Change
              </th>
              <th className="w-20 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Difficulty
              </th>
              <th className="w-20 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Impact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.map((item) => (
              <tr key={item.element}>
                <td className="px-3 py-2 font-medium">
                  {item.label}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {item.currentState}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {item.requiredChange}
                </td>
                <td className="px-3 py-2 text-center tabular-nums">
                  {item.difficulty}/5
                </td>
                <td className="px-3 py-2 text-center tabular-nums">
                  {item.impact}/5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

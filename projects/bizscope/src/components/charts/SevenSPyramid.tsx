'use client';

import type { SevenSItem, SevenSElement } from '@/frameworks/types';

interface SevenSPyramidProps {
  items: SevenSItem[];
}

/** PPT style: stacked pyramid with Strategy at top, Shared Value at bottom */
const PYRAMID_LAYERS: { element: SevenSElement; label: string; color: string; textColor: string }[] = [
  { element: 'strategy', label: 'Strategy', color: '#fbbf24', textColor: '#92400e' },
  { element: 'structure', label: 'Structure', color: '#fcd34d', textColor: '#92400e' },
  { element: 'staff', label: 'Staff', color: '#fde68a', textColor: '#78350f' },
  { element: 'skills', label: 'Skill', color: '#fef3c7', textColor: '#78350f' },
  { element: 'systems', label: 'System', color: '#fef9c3', textColor: '#713f12' },
  { element: 'style', label: 'Style', color: '#fffbeb', textColor: '#713f12' },
  { element: 'shared-values', label: 'Shared Value', color: '#f59e0b', textColor: '#fff' },
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
    <div className="w-full flex flex-col items-center gap-4">
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
          const isHighlighted = item && item.impact >= 4;

          return (
            <g key={layer.element}>
              {/* Pyramid layer */}
              <polygon
                points={points}
                fill={layer.color}
                stroke="#d4a017"
                strokeWidth={1}
                opacity={isHighlighted ? 1 : 0.8}
              />
              <text
                x={cx}
                y={y + layerH / 2 + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
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
                    stroke="#d1d5db"
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
                          fill="#e0e7ff"
                          stroke="#818cf8"
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
                        fill="#6b7280"
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
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-1.5 text-left font-semibold">
                Element
              </th>
              <th className="border border-gray-200 px-3 py-1.5 text-left font-semibold">
                Current State
              </th>
              <th className="border border-gray-200 px-3 py-1.5 text-left font-semibold">
                Required Change
              </th>
              <th className="border border-gray-200 px-3 py-1.5 text-center font-semibold w-20">
                Difficulty
              </th>
              <th className="border border-gray-200 px-3 py-1.5 text-center font-semibold w-20">
                Impact
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.element} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-3 py-1.5 font-medium">
                  {item.label}
                </td>
                <td className="border border-gray-200 px-3 py-1.5 text-gray-700">
                  {item.currentState}
                </td>
                <td className="border border-gray-200 px-3 py-1.5 text-gray-700">
                  {item.requiredChange}
                </td>
                <td className="border border-gray-200 px-3 py-1.5 text-center">
                  {item.difficulty}/5
                </td>
                <td className="border border-gray-200 px-3 py-1.5 text-center">
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

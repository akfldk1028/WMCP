'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';
import type { PrioritizedStrategy } from '@/frameworks/types';

interface PriorityMatrixChartProps {
  strategies: PrioritizedStrategy[];
}

const QUADRANT_COLORS: Record<PrioritizedStrategy['quadrant'], string> = {
  'quick-win': '#16a34a',
  'major-project': '#2563eb',
  'fill-in': '#ca8a04',
  'thankless': '#9ca3af',
};

const QUADRANT_LABELS = [
  { label: 'Quick Win', x: 4, y: 4, color: '#16a34a' },
  { label: 'Major Project', x: 2, y: 4, color: '#2563eb' },
  { label: 'Fill-in', x: 4, y: 2, color: '#ca8a04' },
  { label: 'Thankless', x: 2, y: 2, color: '#9ca3af' },
];

interface DotPayload extends PrioritizedStrategy {
  ease: number;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: DotPayload;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (cx == null || cy == null || !payload) return null;
  const fill = QUADRANT_COLORS[payload.quadrant];
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={fill} opacity={0.85} stroke="#fff" strokeWidth={1} />
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fontSize={10}
        fill="#374151"
        fontWeight={500}
      >
        {payload.strategy.length > 15
          ? payload.strategy.slice(0, 14) + '...'
          : payload.strategy}
      </text>
    </g>
  );
}

function CustomTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DotPayload }>;
}) {
  if (!active || !payload?.[0]) return null;
  const s = payload[0].payload;
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2 shadow-sm text-sm">
      <p className="font-semibold">{s.strategy}</p>
      <p>Impact: {s.impact}/5</p>
      <p>Difficulty: {s.difficulty}/5</p>
      <p>Ease: {s.ease}/5</p>
      <p style={{ color: QUADRANT_COLORS[s.quadrant] }} className="font-medium">
        {s.quadrant.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </p>
    </div>
  );
}

export default function PriorityMatrixChart({ strategies }: PriorityMatrixChartProps) {
  const data: DotPayload[] = strategies.map((s) => ({
    ...s,
    ease: 6 - s.difficulty,
  }));

  return (
    <div className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" dataKey="ease" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}>
            <Label value="실행 용이성 (Ease)" position="bottom" offset={20} />
          </XAxis>
          <YAxis type="number" dataKey="impact" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}>
            <Label value="영향력 (Impact)" angle={-90} position="left" offset={0} />
          </YAxis>
          <ReferenceLine x={3} stroke="#9ca3af" strokeDasharray="4 4" />
          <ReferenceLine y={3} stroke="#9ca3af" strokeDasharray="4 4" />
          {QUADRANT_LABELS.map((q) => (
            <ReferenceLine
              key={q.label}
              y={q.y}
              x={q.x}
              ifOverflow="visible"
              label={{
                value: q.label,
                position: 'center',
                fill: q.color,
                fontSize: 13,
                fontWeight: 600,
                opacity: 0.4,
              }}
              stroke="transparent"
            />
          ))}
          <Tooltip content={<CustomTooltipContent />} />
          <Scatter data={data} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

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
import type { MatrixPoint } from '@/frameworks/types';

interface MatrixPlotProps {
  points: MatrixPoint[];
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: MatrixPoint;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (cx == null || cy == null || !payload) return null;
  const fill = payload.classification === 'opportunity' ? '#16a34a' : '#dc2626';
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={fill} opacity={0.8} />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fontSize={11}
        fill="#374151"
      >
        {payload.label}
      </text>
    </g>
  );
}

function CustomTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MatrixPoint }>;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2 shadow-sm text-sm">
      <p className="font-semibold">{point.label}</p>
      <p>Possibility: {(point.possibility * 100).toFixed(0)}%</p>
      <p>Impact: {point.impact}/5</p>
      <p
        className={
          point.classification === 'opportunity'
            ? 'text-green-600'
            : 'text-red-600'
        }
      >
        {point.classification === 'opportunity' ? 'Opportunity' : 'Threat'}
      </p>
    </div>
  );
}

const QUADRANT_LABELS = [
  { label: 'High Priority', x: 0.75, y: 4, color: '#16a34a' },
  { label: 'Monitor', x: 0.25, y: 4, color: '#ca8a04' },
  { label: 'Consider', x: 0.75, y: 2, color: '#2563eb' },
  { label: 'Low Priority', x: 0.25, y: 2, color: '#9ca3af' },
];

export default function MatrixPlot({ points }: MatrixPlotProps) {
  const data = points.map((p) => ({
    ...p,
    x: p.possibility,
    y: p.impact,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 1]}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          >
            <Label value="Possibility" position="bottom" offset={20} />
          </XAxis>
          <YAxis type="number" dataKey="y" domain={[1, 5]}>
            <Label value="Impact" angle={-90} position="left" offset={0} />
          </YAxis>
          <ReferenceLine x={0.5} stroke="#9ca3af" strokeDasharray="4 4" />
          <ReferenceLine y={3} stroke="#9ca3af" strokeDasharray="4 4" />
          {QUADRANT_LABELS.map((q) => (
            <ReferenceLine
              key={q.label}
              x={q.x}
              y={q.y}
              ifOverflow="visible"
              label={{
                value: q.label,
                position: 'center',
                fill: q.color,
                fontSize: 12,
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

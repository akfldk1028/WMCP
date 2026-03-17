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
  'quick-win': '#4f46e5',
  'major-project': '#6366f1',
  'fill-in': '#94a3b8',
  'thankless': '#cbd5e1',
};

const QUADRANT_LABEL_TEXT: Record<PrioritizedStrategy['quadrant'], string> = {
  'quick-win': 'Quick Win',
  'major-project': 'Major Project',
  'fill-in': 'Fill-in',
  'thankless': 'Thankless',
};

const QUADRANT_LABELS = [
  { label: 'Quick Win', x: 4.5, y: 4.5, color: '#4f46e5' },
  { label: 'Major Project', x: 1.5, y: 4.5, color: '#6b7280' },
  { label: 'Fill-in', x: 4.5, y: 1.5, color: '#6b7280' },
  { label: 'Thankless', x: 1.5, y: 1.5, color: '#9ca3af' },
];

interface DotPayload extends PrioritizedStrategy {
  ease: number;
  idx: number;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: DotPayload;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (cx == null || cy == null || !payload) return null;
  const fill = QUADRANT_COLORS[payload.quadrant];
  const letter = String.fromCharCode(65 + payload.idx); // A, B, C...
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill={fill} opacity={0.85} />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#fff"
      >
        {letter}
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
    <div className="rounded border border-border bg-background px-3 py-2 text-sm">
      <p className="font-semibold">{s.strategy}</p>
      <p className="text-muted-foreground">Impact: {s.impact}/5</p>
      <p className="text-muted-foreground">Difficulty: {s.difficulty}/5</p>
      <p className="font-medium text-indigo-600">
        {QUADRANT_LABEL_TEXT[s.quadrant]}
      </p>
    </div>
  );
}

export default function PriorityMatrixChart({ strategies }: PriorityMatrixChartProps) {
  const data: DotPayload[] = strategies.map((s, i) => ({
    ...s,
    ease: 6 - s.difficulty,
    idx: i,
  }));

  return (
    <div className="space-y-6">
      <div className="w-full h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid stroke="#f1f5f9" />
            <XAxis type="number" dataKey="ease" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#6b7280' }}>
              <Label value="실행 용이성 (Ease)" position="bottom" offset={20} style={{ fontSize: 11, fill: '#6b7280' }} />
            </XAxis>
            <YAxis type="number" dataKey="impact" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#6b7280' }}>
              <Label value="영향력 (Impact)" angle={-90} position="left" offset={0} style={{ fontSize: 11, fill: '#6b7280' }} />
            </YAxis>
            <ReferenceLine x={3} stroke="#cbd5e1" strokeDasharray="4 4" />
            <ReferenceLine y={3} stroke="#cbd5e1" strokeDasharray="4 4" />
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
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: 0.3,
                }}
                stroke="transparent"
              />
            ))}
            <Tooltip content={<CustomTooltipContent />} />
            <Scatter data={data} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="divide-y divide-border/40 text-sm">
        {strategies.map((s, i) => {
          const letter = String.fromCharCode(65 + i);
          const color = QUADRANT_COLORS[s.quadrant];
          return (
            <div key={s.id} className="flex items-center gap-3 py-2">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {letter}
              </span>
              <span className="flex-1">{s.strategy}</span>
              <span className="shrink-0 tabular-nums text-xs text-muted-foreground/60">
                I:{s.impact} D:{s.difficulty}
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                {QUADRANT_LABEL_TEXT[s.quadrant]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

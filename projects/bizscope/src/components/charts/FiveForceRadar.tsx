'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { PESTFactor } from '@/frameworks/types';

interface FiveForceRadarProps {
  factors: PESTFactor[];
}

const FORCE_KEYS = [
  { key: 'buyerPower', label: 'Buyer Power' },
  { key: 'supplierPower', label: 'Supplier Power' },
  { key: 'newEntrants', label: 'New Entrants' },
  { key: 'substitutes', label: 'Substitutes' },
  { key: 'rivalry', label: 'Rivalry' },
] as const;

export default function FiveForceRadar({ factors }: FiveForceRadarProps) {
  if (factors.length === 0) return null;

  const data = FORCE_KEYS.map(({ key, label }) => {
    const sum = factors.reduce((acc, f) => acc + f.fiveForces[key], 0);
    return {
      force: label,
      score: Math.round((sum / factors.length) * 100) / 100,
    };
  });

  return (
    <div className="w-full h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#c7d2fe" />
          <PolarAngleAxis
            dataKey="force"
            tick={{ fontSize: 12, fill: '#4b5563' }}
          />
          <Radar
            name="Five Forces"
            dataKey="score"
            stroke="#6366f1"
            fill="#818cf8"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number) => [value.toFixed(2), 'Score']}
            contentStyle={{ fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

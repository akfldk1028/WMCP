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
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="force"
            tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
          />
          <Radar
            name="Five Forces"
            dataKey="score"
            stroke="#4f46e5"
            fill="#6366f1"
            fillOpacity={0.12}
            strokeWidth={1.5}
          />
          <Tooltip
            formatter={(value: number) => [value.toFixed(2), 'Score']}
            contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #e2e8f0' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IncomeYear {
  year: string;
  revenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
}

interface Props {
  data: IncomeYear[];
  currency?: string;
}

function formatAxis(value: number, currency: string) {
  const abs = Math.abs(value);
  // Auto-detect KRW: explicit currency or magnitude > 10B (typical KRW revenues)
  const isKRW = currency === 'KRW' || abs >= 1e10;
  if (isKRW) {
    if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}조`;
    if (abs >= 1e8) return `${Math.round(value / 1e8).toLocaleString()}억`;
    if (abs >= 1e4) return `${Math.round(value / 1e4).toLocaleString()}만`;
    return value.toLocaleString();
  }
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

export default function IncomeChart({ data, currency = 'USD' }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map(d => ({
    year: d.year,
    매출: d.revenue ?? 0,
    영업이익: d.operatingIncome ?? 0,
    순이익: d.netIncome ?? 0,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatAxis(v, currency)} width={70} />
          <Tooltip formatter={(value: number) => formatAxis(value, currency)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="매출" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="영업이익" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="순이익" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

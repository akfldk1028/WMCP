'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BalanceYear {
  year: string;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
}

interface Props {
  data: BalanceYear[];
  currency?: string;
}

function formatAxis(value: number, currency: string) {
  const isKRW = currency === 'KRW';
  if (Math.abs(value) >= 1e12) return isKRW ? `${(value / 1e12).toFixed(0)}조` : `${(value / 1e9).toFixed(0)}B`;
  if (Math.abs(value) >= 1e9) return isKRW ? `${(value / 1e8).toFixed(0)}억` : `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return isKRW ? `${(value / 1e6).toFixed(0)}백만` : `${(value / 1e6).toFixed(0)}M`;
  return value.toLocaleString();
}

export default function BalanceSheetChart({ data, currency = 'USD' }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map(d => ({
    year: d.year,
    총자산: d.totalAssets ?? 0,
    부채: d.totalLiabilities ?? 0,
    자본: d.totalEquity ?? 0,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatAxis(v, currency)} width={70} />
          <Tooltip formatter={(value: number) => formatAxis(value, currency)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="총자산" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="부채" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="자본" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

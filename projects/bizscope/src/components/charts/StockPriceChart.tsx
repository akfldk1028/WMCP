'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PricePoint {
  date: string;
  close: number;
}

interface Props {
  data: PricePoint[];
  currency?: string;
}

export default function StockPriceChart({ data, currency = 'USD' }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map(d => ({
    date: d.date.slice(0, 7), // YYYY-MM
    가격: d.close,
  }));

  const isKRW = currency === 'KRW';
  const prefix = isKRW ? '' : '$';
  const suffix = isKRW ? '원' : '';

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${prefix}${v.toLocaleString()}${suffix}`} width={80} />
          <Tooltip formatter={(value: number) => `${prefix}${value.toLocaleString()}${suffix}`} />
          <Line type="monotone" dataKey="가격" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

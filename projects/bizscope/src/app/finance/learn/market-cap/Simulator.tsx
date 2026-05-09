'use client';

import { useState } from 'react';
import { Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';
import { formatKrwCompact } from '@/lib/finance/corp';

export default function MarketCapSimulator() {
  const [shares, setShares] = useState(101_278_725);
  const [price, setPrice] = useState(20_450);
  const cap = shares * price;

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <h2 className="text-base font-bold">직접 계산 — 시가총액 산출기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberInput label="주식수" value={shares} onChange={setShares} step={1_000_000} suffix="주" />
        <NumberInput label="주가" value={price} onChange={setPrice} step={1000} suffix="원" />
      </div>
      <Stat label="시가총액" value={formatKrwCompact(cap)} sub={`${cap.toLocaleString('ko-KR')}원`} />
    </section>
  );
}

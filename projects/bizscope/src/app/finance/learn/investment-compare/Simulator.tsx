'use client';

import { useMemo, useState } from 'react';
import { Callout, Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';
import { npv } from '@/lib/finance/corp';

const INV1 = [-1300, 700, 600, 400];
const INV2 = [-1400, 450, 600, 800];

export default function InvestmentCompareSimulator() {
  const [rate, setRate] = useState(0.12);

  const npv1 = useMemo(() => npv(rate, INV1.map((cf, t) => ({ t, cf }))), [rate]);
  const npv2 = useMemo(() => npv(rate, INV2.map((cf, t) => ({ t, cf }))), [rate]);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <h2 className="text-base font-bold">할인율을 바꾸면 결론이 어떻게 바뀌는가</h2>
      <NumberInput label="할인율" value={rate * 100} onChange={(n) => setRate(n / 100)} step={0.5} suffix="%" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Investment #1 NPV" value={npv1.toFixed(2)} sub={npv1 >= 0 ? '채택 가능' : '기각'} />
        <Stat label="Investment #2 NPV" value={npv2.toFixed(2)} sub={npv2 >= 0 ? '채택 가능' : '기각'} />
      </div>
      <Callout tone="note">
        현재 우위: <strong>{npv1 >= npv2 ? 'Investment #1' : 'Investment #2'}</strong>. 할인율을 충분히 낮추면
        후반부 수익이 큰 #2가 우위로 바뀐다 — 다음 챕터(WACC)에서 직접 확인.
      </Callout>
    </section>
  );
}

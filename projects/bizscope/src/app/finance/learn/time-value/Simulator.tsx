'use client';

import { useState } from 'react';
import { CashflowTable, Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';

/**
 * Single client island — covers both the FV and PV simulators because they
 * share `(pv, rate, years)` state in the original lecture flow.
 */
export default function TimeValueSimulator() {
  const [pv, setPv] = useState(100);
  const [rate, setRate] = useState(0.1);
  const [years, setYears] = useState(2);

  const fv = pv * Math.pow(1 + rate, years);
  const fvSeries = Array.from({ length: years + 1 }, (_, t) => pv * Math.pow(1 + rate, t));
  const pvBack = fv / Math.pow(1 + rate, years);

  return (
    <>
      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-base font-bold">직접 계산해보기 — 미래가치</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberInput label="원금 (PV)" value={pv} onChange={setPv} step={10} suffix="원" />
          <NumberInput label="이자율 (r)" value={rate * 100} onChange={(n) => setRate(n / 100)} step={0.5} suffix="%" />
          <NumberInput label="기간 (t)" value={years} onChange={setYears} step={1} min={0} max={30} suffix="년" />
        </div>
        <CashflowTable
          columns={Array.from({ length: years + 1 }, (_, i) => `Time ${i}`)}
          rows={[
            {
              label: 'FV',
              cells: fvSeries.map((v) => v.toLocaleString('ko-KR', { maximumFractionDigits: 2 })),
            },
          ]}
        />
        <Stat label={`Time ${years} 미래가치`} value={fv.toLocaleString('ko-KR', { maximumFractionDigits: 2 })} sub="원" />
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6" id="pv-back">
        <h2 className="text-base font-bold">역산해보기 — 현재가치</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          앞에서 입력한 미래가치({fv.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원)를 같은 할인율로 끌어오면 정확히 원금과 같아진다.
        </p>
        <Stat
          label={`Time ${years}의 ${Math.round(fv).toLocaleString('ko-KR')}원 → 현재가치`}
          value={pvBack.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
          sub="원"
        />
      </section>
    </>
  );
}

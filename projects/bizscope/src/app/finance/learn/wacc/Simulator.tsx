'use client';

import { useMemo, useState } from 'react';
import { Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';
import { wacc as waccCalc } from '@/lib/finance/corp';

export default function WaccSimulator() {
  const [E, setE] = useState(70);
  const [D, setD] = useState(30);
  const [Re, setRe] = useState(0.1);
  const [Rd, setRd] = useState(0.05);
  const [t, setT] = useState(0);

  const result = useMemo(() => waccCalc({ E, D, Re, Rd, t }), [E, D, Re, Rd, t]);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <h2 className="text-base font-bold">직접 계산 — WACC 시뮬레이터</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NumberInput label="자기자본 (E)" value={E} onChange={setE} step={5} suffix="단위" />
        <NumberInput label="타인자본 (D)" value={D} onChange={setD} step={5} suffix="단위" />
        <NumberInput label="자기자본비용 Re" value={Re * 100} onChange={(n) => setRe(n / 100)} step={0.5} suffix="%" />
        <NumberInput label="타인자본비용 Rd" value={Rd * 100} onChange={(n) => setRd(n / 100)} step={0.5} suffix="%" />
        <NumberInput label="법인세율 t" value={t * 100} onChange={(n) => setT(n / 100)} step={1} min={0} max={50} suffix="%" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="자기자본 비중" value={`${(result.weightE * 100).toFixed(1)}%`} />
        <Stat label="타인자본 비중" value={`${(result.weightD * 100).toFixed(1)}%`} />
        <Stat label="세후 Rd" value={`${(result.afterTaxRd * 100).toFixed(2)}%`} />
        <Stat label="WACC" value={`${(result.wacc * 100).toFixed(2)}%`} sub="이걸 할인율로 사용" />
      </div>
    </section>
  );
}

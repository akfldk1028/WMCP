'use client';

import { useState } from 'react';
import { Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';
import { formatKrwCompact, terminalValue, type TerminalMethod } from '@/lib/finance/corp';

const METHODS: { method: TerminalMethod; name: string; formula: string }[] = [
  { method: 'growing-perpetuity', name: 'Growing Perpetuity', formula: 'CV = FCF_T+1 / (WACC − g)' },
  { method: 'value-driver', name: 'Value Driver', formula: 'CV = NOPLAT × (1 − g/ROIC) / (WACC − g)' },
  { method: 'convergence', name: 'Convergence', formula: 'CV = NOPLAT / WACC' },
  { method: 'aggressive', name: 'Aggressive', formula: 'CV = NOPLAT / (WACC − g)' },
  { method: 'pe-multiple', name: 'P/E Multiple', formula: 'CV = Net Income × P/E' },
  { method: 'ebitda-multiple', name: 'EBITDA Multiple', formula: 'CV = EBITDA × EV/EBITDA' },
];

export default function TerminalValueSimulator() {
  const [fcf, setFcf] = useState(100);
  const [waccRate, setWaccRate] = useState(0.1);
  const [growth, setGrowth] = useState(0.03);
  const [noplat, setNoplat] = useState(80);
  const [roic, setRoic] = useState(0.15);
  const [netIncome, setNetIncome] = useState(70);
  const [peMultiple, setPeMultiple] = useState(20);
  const [ebitda, setEbitda] = useState(120);
  const [ebitdaMultiple, setEbitdaMultiple] = useState(9);

  const results = METHODS.map((m) => ({
    ...m,
    value: terminalValue({
      method: m.method,
      fcfNext: fcf,
      waccRate,
      growth,
      noplat,
      roic,
      netIncome,
      peMultiple,
      ebitda,
      ebitdaMultiple,
    }),
  }));

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <h2 className="text-base font-bold">동일 입력값에 6가지 방식 동시 적용</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NumberInput label="FCF (예측 종료 다음 해)" value={fcf} onChange={setFcf} step={10} suffix="억" />
        <NumberInput label="WACC" value={waccRate * 100} onChange={(n) => setWaccRate(n / 100)} step={0.5} suffix="%" />
        <NumberInput label="영구성장률 g" value={growth * 100} onChange={(n) => setGrowth(n / 100)} step={0.5} suffix="%" />
        <NumberInput label="NOPLAT" value={noplat} onChange={setNoplat} step={5} suffix="억" />
        <NumberInput label="ROIC" value={roic * 100} onChange={(n) => setRoic(n / 100)} step={0.5} suffix="%" />
        <NumberInput label="Net Income" value={netIncome} onChange={setNetIncome} step={5} suffix="억" />
        <NumberInput label="P/E Multiple" value={peMultiple} onChange={setPeMultiple} step={1} suffix="배" />
        <NumberInput label="EBITDA" value={ebitda} onChange={setEbitda} step={10} suffix="억" />
        <NumberInput label="EV/EBITDA" value={ebitdaMultiple} onChange={setEbitdaMultiple} step={0.5} suffix="배" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <Stat key={r.method} label={r.name} value={formatKrwCompact(r.value * 1e8)} sub={r.formula} />
        ))}
      </div>
    </section>
  );
}

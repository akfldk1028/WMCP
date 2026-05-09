'use client';

import { useMemo, useState } from 'react';
import { CashflowTable, Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';
import { npv, pvTable } from '@/lib/finance/corp';

export default function NpvBasicsSimulator() {
  const [investment, setInvestment] = useState(1000);
  const [annual, setAnnual] = useState(500);
  const [years, setYears] = useState(3);
  const [rate, setRate] = useState(0.12);

  const flows = useMemo(() => {
    const arr = [{ t: 0, cf: -investment }];
    for (let i = 1; i <= years; i++) arr.push({ t: i, cf: annual });
    return arr;
  }, [investment, annual, years]);

  const result = useMemo(() => npv(rate, flows), [rate, flows]);
  const table = useMemo(() => pvTable(rate, flows), [rate, flows]);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <h2 className="text-base font-bold">직접 풀어보기 — 입력값을 바꾸면 모든 셀이 갱신됨</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumberInput label="초기 투자액" value={investment} onChange={setInvestment} step={100} suffix="원" />
        <NumberInput label="연간 회수액" value={annual} onChange={setAnnual} step={50} suffix="원" />
        <NumberInput label="기간" value={years} onChange={setYears} step={1} min={1} max={20} suffix="년" />
        <NumberInput label="할인율" value={rate * 100} onChange={(n) => setRate(n / 100)} step={0.5} suffix="%" />
      </div>
      <CashflowTable
        columns={['Time 0', ...Array.from({ length: years }, (_, i) => `Time ${i + 1}`)]}
        rows={[
          { label: 'Cash Flow', cells: flows.map((r) => r.cf.toLocaleString('ko-KR')) },
          { label: 'Discount Factor', cells: table.map((r) => r.df.toFixed(3)) },
          { label: 'Present Value', cells: table.map((r) => r.pv.toFixed(2)) },
        ]}
      />
      <Stat
        label="Net Present Value (NPV)"
        value={result.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
        sub={result >= 0 ? '양수 — 투자할 가치 있음' : '음수 — 비용 회수 안 됨'}
      />
    </section>
  );
}

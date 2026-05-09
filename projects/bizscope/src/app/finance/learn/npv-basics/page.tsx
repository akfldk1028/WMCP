'use client';

import { useMemo, useState } from 'react';
import { Body, CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { npv, pvTable } from '@/lib/finance/corp';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'npv-basics')!;

export default function NpvBasicsPage() {
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
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>올해 1,000원을 투자해서 향후 3년간 500원이 나오는 프로젝트의 가치는 현가로 얼마인가? 단 할인율 12%</Headline>
        <Body>
          <p>
            미래의 현금흐름은 그대로 더하면 안 된다. 각 연도의 현금흐름을 할인율로 현재가치로 변환한 뒤, 초기 투자액을
            차감해 「순현재가치(NPV)」를 구한다. NPV가 양수이면 투자할 가치가 있는 사업.
          </p>
        </Body>
        <Formula>NPV = Σ CF_t / (1 + r)^t</Formula>
        <CashflowTable
          caption="원본 슬라이드 표 — 12%로 할인한 현재가치 합"
          columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
          rows={[
            { label: 'Cash Flow', cells: ['(1,000)', '500', '500', '500'] },
            { label: 'Discount Factor', cells: ['(1.12)⁰=1', '(1.12)¹=1.12', '(1.12)²=1.25', '(1.12)³=1.40'] },
            { label: 'Present Value', cells: ['(1,000)', '446', '399', '356'] },
            { label: 'Net Present Value', cells: ['200', '', '', ''], emphasize: true },
          ]}
        />
        <Callout>따라서, 이러한 투자 (혹은 사업)의 「가치」는 200으로 계산됨.</Callout>
      </section>

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
    </ChapterShell>
  );
}

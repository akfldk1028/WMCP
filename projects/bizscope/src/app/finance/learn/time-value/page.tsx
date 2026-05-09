'use client';

import { useState } from 'react';
import { Body, CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'time-value')!;

export default function TimeValuePage() {
  const [pv, setPv] = useState(100);
  const [rate, setRate] = useState(0.1);
  const [years, setYears] = useState(2);

  const fv = pv * Math.pow(1 + rate, years);
  const fvSeries = Array.from({ length: years + 1 }, (_, t) => pv * Math.pow(1 + rate, t));
  const pvBack = fv / Math.pow(1 + rate, years);

  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          100원을 은행에 이자율 10%로 2년간 예치한다면 2년후에는 얼마가 될까?
        </Headline>
        <Body>
          <p>
            오늘의 100원과 1년 후의 100원의 가치는 다르다. 매년 이자가 붙어 복리로 증가하므로, 1년 후 110원, 2년 후
            121원이 된다. 모든 가치 평가의 출발점은 이 단순한 사실이다.
          </p>
        </Body>
        <Formula>FV_t = PV × (1 + r)^t</Formula>
        <CashflowTable
          caption="원본 슬라이드 표 — 원금 + 이자 공식"
          columns={['Time 0', 'Time 1', 'Time 2']}
          rows={[
            { label: 'Cash Flow (원금+이자)', cells: ['100', '110', '121'] },
            { label: '이자 (10%)', cells: ['', '100×0.1=10', '110×0.1=11'] },
            { label: '원금 + 이자 공식', cells: ['0', '100×(1+0.1)', '100×(1+0.1)²'], emphasize: true },
          ]}
        />
        <Callout>즉, 100원을 10% 이자율로 2년 동안 예금하면 121원이 됨.</Callout>
      </section>

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

      <section className="space-y-4">
        <Headline>그러면 1년 후 110원이나 2년 후 121원은 현재 가치로 얼마인가? 단 할인율은 이자율과 같은 10%로 가정</Headline>
        <Body>
          <p>거꾸로 미래의 현금을 같은 할인율로 끌어오면 모두 현재가치 100원으로 수렴한다.</p>
        </Body>
        <Formula>PV = FV_t / (1 + r)^t</Formula>
        <CashflowTable
          caption="원본 슬라이드 표 — 할인율 공식"
          columns={['Time 0', 'Time 1', 'Time 2']}
          rows={[
            { label: 'Cash Flow', cells: ['100', '110', '121'] },
            { label: '할인율 공식', cells: ['', '110/(1+0.1)', '121/(1+0.1)²'] },
            { label: 'Present Value (현재 가치)', cells: ['100', '100', '100'], emphasize: true },
          ]}
        />
        <Callout>즉, 1년 후 110원의 현재 가치는 100원, 2년 후 121원의 현재 가치는 100원임.</Callout>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-base font-bold">역산해보기 — 현재가치</h2>
        <Body>
          <p>
            앞에서 입력한 미래가치({fv.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원)를 같은 할인율로 끌어오면
            정확히 원금과 같아진다.
          </p>
        </Body>
        <Stat
          label={`Time ${years}의 ${Math.round(fv).toLocaleString('ko-KR')}원 → 현재가치`}
          value={pvBack.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
          sub="원"
        />
      </section>
    </ChapterShell>
  );
}

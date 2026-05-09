'use client';

import { useMemo, useState } from 'react';
import { Body, CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { irr, npv } from '@/lib/finance/corp';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'irr-basics')!;

const TRIAL_STEPS = [
  { rate: 0.2, sum: 417 + 347 + 289, total: 1053 },
  { rate: 0.23, sum: 407 + 330 + 269, total: 1006 },
  { rate: 0.24, sum: 403 + 325 + 262, total: 991 },
];

export default function IrrBasicsPage() {
  const [investment, setInvestment] = useState(1000);
  const [y1, setY1] = useState(1000);
  const [y2, setY2] = useState(500);
  const [y3, setY3] = useState(0);

  const flows = useMemo(
    () => [
      { t: 0, cf: -investment },
      { t: 1, cf: y1 },
      { t: 2, cf: y2 },
      { t: 3, cf: y3 },
    ],
    [investment, y1, y2, y3],
  );

  const calculatedIrr = useMemo(() => irr(flows), [flows]);
  const npvAt12 = useMemo(() => npv(0.12, flows), [flows]);

  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          순현재가치(NPV)와 종종 같이 쓰이는 내부수익률(IRR)은 투자 소요 금액의 현가와 미래 현금흐름의 현가를 같게 해주는 수익률.
        </Headline>
        <Body>
          <p>
            IRR은 NPV를 정확히 0으로 만드는 할인율이다. 자본조달비용(WACC)보다 IRR이 높으면 투자할 가치가 있다. 메이커
            관점에서는 「내가 투입한 시간/돈의 연환산 수익률」.
          </p>
        </Body>
        <Formula>0 = Σ CF_t / (1 + IRR)^t</Formula>
      </section>

      <section className="space-y-4">
        <Headline>예제 1 — 1,000 투자, 1년 후 1,500</Headline>
        <CashflowTable
          columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
          rows={[
            { label: 'Cash Flow', cells: ['(1,000)', '1,500', '0', '0'] },
            { label: 'Discount Factor', cells: ['(1+IRR)⁰=1', '(1+IRR)¹', '(1+IRR)²', '(1+IRR)³'] },
            { label: 'Present Value', cells: ['(1,000)', '1500/(1+IRR)¹', '0', '0'], emphasize: true },
          ]}
        />
        <Callout>1,000 = 1,500/(1+IRR) → IRR = 50%.</Callout>
      </section>

      <section className="space-y-4">
        <Headline>예제 2 — 1,000 투자, 매년 500씩 3년 (시행착오 풀이)</Headline>
        <CashflowTable
          columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
          rows={[
            { label: 'Cash Flow', cells: ['(1,000)', '500', '500', '500'] },
            { label: 'Discount Factor', cells: ['(1+IRR)⁰=1', '(1+IRR)¹', '(1+IRR)²', '(1+IRR)³'] },
            { label: 'Present Value', cells: ['(1,000)', '500/(1+IRR)¹', '500/(1+IRR)²', '500/(1+IRR)³'] },
          ]}
        />
        <Callout>
          12%일 때 NPV가 200이었으므로 약 20%부터 시도 → 23% → 24% 순서대로 좁혀나간다.
        </Callout>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs">
                <th className="px-3 py-2 text-left font-semibold">시도 할인율</th>
                <th className="px-3 py-2 text-right font-semibold">500/(1+r) + 500/(1+r)² + 500/(1+r)³</th>
                <th className="px-3 py-2 text-right font-semibold">1,000과의 차이</th>
              </tr>
            </thead>
            <tbody>
              {TRIAL_STEPS.map((s, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-3 py-2 font-mono text-xs">{(s.rate * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{s.total.toLocaleString('ko-KR')}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {s.total - 1000 > 0 ? '+' : ''}
                    {s.total - 1000}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Formula>
          선형보간: 23 + (1006 − 1000) / (1006 − 991) = 23 + (6 / 15) = 23.4
          <br />
          → IRR ≈ <span className="text-amber-300">23.35%</span>
        </Formula>
        <Callout tone="note">
          사업 승인은 23.35%와 WACC의 비교로 결론. 본 도구의 IRR 계산은 시행착오 대신 이분법(bisection)으로 즉시 수렴한다.
        </Callout>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-base font-bold">직접 풀어보기 — IRR 자동 계산</h2>
        <Body>
          <p>원본 슬라이드의 연습문제: 1,000 투자, 1년 후 1,000, 2년 후 500, 3년 후 0. 입력값을 바꿔보세요.</p>
        </Body>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumberInput label="초기 투자" value={investment} onChange={setInvestment} step={100} suffix="원" />
          <NumberInput label="1년 후" value={y1} onChange={setY1} step={50} suffix="원" />
          <NumberInput label="2년 후" value={y2} onChange={setY2} step={50} suffix="원" />
          <NumberInput label="3년 후" value={y3} onChange={setY3} step={50} suffix="원" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat
            label="IRR (자동 계산)"
            value={Number.isFinite(calculatedIrr) ? `${(calculatedIrr * 100).toFixed(2)}%` : '계산 불가'}
            sub={Number.isFinite(calculatedIrr) ? '이분법, 200회 이내 수렴' : '현금흐름이 부호를 바꾸지 않음'}
          />
          <Stat
            label="NPV @ 12% (참고)"
            value={npvAt12.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
            sub={npvAt12 >= 0 ? '12%보다 높은 IRR' : '12%보다 낮은 IRR'}
          />
        </div>
      </section>
    </ChapterShell>
  );
}

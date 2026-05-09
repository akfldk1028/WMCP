'use client';

import { useMemo, useState } from 'react';
import { Body, CashflowTable, Callout, ChapterShell, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { irr, npv } from '@/lib/finance/corp';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'wacc-application')!;

const INV1 = [-1300, 700, 600, 400];
const INV2 = [-1400, 450, 600, 800];

export default function WaccApplicationPage() {
  const [waccA, setWaccA] = useState(0.085);
  const [investAdjusted, setInvestAdjusted] = useState(1300);

  const npv1At12 = npv(0.12, INV1.map((cf, t) => ({ t, cf })));
  const npv2AtA = useMemo(() => npv(waccA, INV2.map((cf, t) => ({ t, cf }))), [waccA]);
  const npv1AtA = useMemo(() => npv(waccA, INV1.map((cf, t) => ({ t, cf }))), [waccA]);

  // What rate makes Inv #1 NPV = npv2AtA?
  const minRate = useMemo(() => {
    // Search rate in [0, 1] where npv(r, INV1) === target
    const target = npv2AtA;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 100; i++) {
      const m = (lo + hi) / 2;
      const v = npv(m, INV1.map((cf, t) => ({ t, cf })));
      if (v > target) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  }, [npv2AtA]);

  // What initial investment for #1 makes #1 NPV at 12% match #2 NPV at A?
  const adjustedInv = useMemo(() => {
    // PV of (700, 600, 400) at 12% is fixed
    const flowsPv = npv(0.12, [
      { t: 1, cf: 700 },
      { t: 2, cf: 600 },
      { t: 3, cf: 400 },
    ]);
    // Need flowsPv − newInvest = npv2AtA → newInvest = flowsPv − npv2AtA
    return flowsPv - npv2AtA;
  }, [npv2AtA]);

  const adjustedFlows = useMemo(
    () => [{ t: 0, cf: -investAdjusted }, { t: 1, cf: 700 }, { t: 2, cf: 600 }, { t: 3, cf: 400 }],
    [investAdjusted],
  );
  const npvAdjusted = useMemo(() => npv(0.12, adjustedFlows), [adjustedFlows]);
  const irrAdjusted = useMemo(() => irr(adjustedFlows), [adjustedFlows]);

  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          WACC 개념을 적용해 투자안 2의 할인율이 12%가 아니라 8.5%가 된다면, 두 투자안 비교 결론은 어떻게 바뀌는가?
        </Headline>
        <Body>
          <p>
            앞 챕터에서 회사 A의 WACC를 8.5%로 구했다. 회사 A가 투자안을 평가할 때 정작 사용해야 할 할인율은 12%가 아니라
            8.5%. 투자안 #2를 8.5%로 다시 할인하면 NPV가 크게 올라간다.
          </p>
        </Body>
        <CashflowTable
          caption="Investment #2를 회사 A의 WACC(8.5%)로 다시 할인"
          columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
          rows={[
            { label: 'Cash Flow', cells: ['(1,400)', '450', '600', '800'] },
            { label: 'Discount Factor', cells: ['1.000', '1.085', '1.18', '1.28'] },
            { label: 'Present Value', cells: ['(1,400)', '415', '508', '625'] },
            { label: 'Net Present Value', cells: ['148', '', '', ''], emphasize: true },
          ]}
        />
        <Callout>
          1,400원 투자해 1,850원 회수하는 동일 프로젝트의 가치가 할인율을 8.5%로 바꾸자 NPV 49 → 148로 약 3배 증가.
          이제 투자안 비교 결론은 #2 우위로 뒤집힌다 (Inv #1 NPV @ 12% = 88).
        </Callout>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-base font-bold">시뮬레이터 — A사 WACC를 바꾸면</h2>
        <NumberInput label="A사 WACC" value={waccA * 100} onChange={(n) => setWaccA(n / 100)} step={0.1} suffix="%" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Investment #1 NPV @ 12% (고정)" value={npv1At12.toFixed(2)} />
          <Stat
            label={`Investment #2 NPV @ ${(waccA * 100).toFixed(1)}%`}
            value={npv2AtA.toFixed(2)}
            sub={npv2AtA > npv1At12 ? '#2 우위' : '#1 우위'}
          />
          <Stat
            label={`Investment #1 NPV @ ${(waccA * 100).toFixed(1)}% (참고)`}
            value={npv1AtA.toFixed(2)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <Headline>연습 1 — 투자안 1을 다시 채택되게 하려면 할인율을 얼마나 낮춰야 하는가?</Headline>
        <Body>
          <p>
            투자안 1의 채택 조건: NPV(#1) ≥ NPV(#2 @ {(waccA * 100).toFixed(1)}%) = {npv2AtA.toFixed(2)}.
            현재 입력된 WACC 기준, 투자안 1의 NPV가 #2와 같아지는 최소 할인율을 자동 계산.
          </p>
        </Body>
        <Stat
          label={`Investment #1 채택을 위한 최소 할인율`}
          value={`${(minRate * 100).toFixed(2)}%`}
          sub={`이 할인율 이하에서만 #1이 #2를 이김`}
        />
      </section>

      <section className="space-y-4">
        <Headline>연습 2 — 할인율 조정이 어렵다면, 초기 투자액은 얼마나 줄여야 하는가?</Headline>
        <Body>
          <p>
            할인율 12%를 그대로 두되 초기 투자액을 줄여서 NPV를 끌어올리는 시나리오. 입력값을 바꿔보면 자동으로 NPV·IRR
            재계산.
          </p>
        </Body>
        <Callout tone="note">
          공식적으로는 NPV(#1 @12%, X) = {npv2AtA.toFixed(2)}이 되어야 하므로 X ≈ {adjustedInv.toFixed(2)}원.
        </Callout>
        <NumberInput label="조정 후 초기 투자액" value={investAdjusted} onChange={setInvestAdjusted} step={50} suffix="원" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="조정 후 #1 NPV @ 12%" value={npvAdjusted.toFixed(2)} />
          <Stat
            label="조정 후 #1 IRR"
            value={Number.isFinite(irrAdjusted) ? `${(irrAdjusted * 100).toFixed(2)}%` : '계산 불가'}
          />
        </div>
      </section>
    </ChapterShell>
  );
}

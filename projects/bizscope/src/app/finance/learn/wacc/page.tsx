'use client';

import { useMemo, useState } from 'react';
import { Body, CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { wacc } from '@/lib/finance/corp';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'wacc')!;

export default function WaccPage() {
  const [E, setE] = useState(70);
  const [D, setD] = useState(30);
  const [Re, setRe] = useState(0.1);
  const [Rd, setRd] = useState(0.05);
  const [t, setT] = useState(0);

  const result = useMemo(() => wacc({ E, D, Re, Rd, t }), [E, D, Re, Rd, t]);

  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>WACC은 Cost of Debt와 Cost of Equity의 조합으로 구성됨.</Headline>
        <Body>
          <p>
            자본비용은 일반적인 투자자가 자금을 투자하면서 기대하는 필수 수익률 — 투자에 따른 리스크를 감수하는 대가.
            은행·채권투자자 몫인 <strong>타인자본비용</strong>과 주주 몫인 <strong>자기자본비용</strong>을 가중평균한 것이 WACC.
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>타인자본비용은 타인자본을 조달함으로써 부담하게 되는 이자율</li>
            <li>자기자본비용은 주주가 투자자금에 대해 기대하는 최저요구 수익률</li>
          </ul>
        </Body>
        <Formula>
          WACC = (E/V) × Re + (D/V) × Rd × (1 − t)
          <br />
          Re = 무위험이자율 + (위험보상률 × β)
        </Formula>
        <Callout tone="note">
          무위험이자율 = 지급이 보증되는 3년만기 은행보증부 채권 수익률. 위험보상률 = (종합주가지수 수익률 − 무위험이자율)의
          평균. β = 업종위험계수.
        </Callout>
      </section>

      <section className="space-y-4">
        <Headline>슬라이드 13 — 70/30 자본구조 회사의 WACC 계산 (Tax shield 미반영 단순화)</Headline>
        <CashflowTable
          caption="Balance Sheet Data"
          columns={['Assets', 'Liabilities + SE']}
          rows={[
            { label: 'Total', cells: ['Tot Assets 100', 'Debt 30 / Equity 70 / Tot D+E 100'] },
          ]}
        />
        <CashflowTable
          caption="Capital Structure Weights"
          columns={['Equity', 'Debt']}
          rows={[
            { label: '비중', cells: ['E/(D+E) = 70/(30+70) = 70%', 'D/(D+E) = 30/(30+70) = 30%'] },
          ]}
        />
        <Formula>
          WACC = (E/(D+E)) × Re + (D/(D+E)) × Rd × (1 − t)
          <br />
          WACC = 70% × 10% + 30% × 5% = <span className="text-amber-300">8.5%</span>
        </Formula>
        <Callout>
          이 8.5%를 회사의 WACC로 활용하면, 대출 원금·이자 갚고 주주 기대수익률 만족시키고도 프로젝트가 남기는 가치가 얼마인지를 NPV로 구할 수 있다.
        </Callout>
      </section>

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
    </ChapterShell>
  );
}

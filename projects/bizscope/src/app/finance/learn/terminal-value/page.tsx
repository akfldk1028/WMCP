'use client';

import { useState } from 'react';
import { Body, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { formatKrwCompact, terminalValue, type TerminalMethod } from '@/lib/finance/corp';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'terminal-value')!;

const METHODS: { method: TerminalMethod; group: 'DCF' | 'Multiple' | 'Others'; name: string; formula: string; assumption: string; modeled: boolean }[] = [
  {
    method: 'growing-perpetuity',
    group: 'DCF',
    name: 'Growing Perpetuity',
    formula: 'CV = FCF_T+1 / (WACC − g)',
    assumption: 'FCF는 NOPLAT보다 변동폭이 커서 normalize한 FCF 추정 필요',
    modeled: true,
  },
  {
    method: 'value-driver',
    group: 'DCF',
    name: 'Value Driver Formula',
    formula: 'CV = NOPLAT × (1 − g/ROIC) / (WACC − g)',
    assumption: 'Growing 공식을 ROIC와 g로 표시 — 동일 결과',
    modeled: true,
  },
  {
    method: 'convergence',
    group: 'DCF',
    name: 'Convergence Formula',
    formula: 'CV = NOPLAT / WACC',
    assumption: '모든 초과수익이 사라지는 시장균형 (ROIC = WACC)',
    modeled: true,
  },
  {
    method: 'aggressive',
    group: 'DCF',
    name: 'Aggressive Formula',
    formula: 'CV = NOPLAT / (WACC − g)',
    assumption: 'ROIC가 무한대로 증가하는 가정 — 가치 과대평가 주의',
    modeled: true,
  },
  {
    method: 'pe-multiple',
    group: 'Multiple',
    name: 'P/E Multiple Method',
    formula: 'CV = Net Income × P/E (예측 multiple)',
    assumption: '일정 기간 후의 P/E 예측이 어려움',
    modeled: true,
  },
  {
    method: 'ebitda-multiple',
    group: 'Multiple',
    name: 'EBITDA Multiple Method',
    formula: 'CV = EBITDA × EV/EBITDA (예측 multiple)',
    assumption: '예측 multiple 자체에 대한 예측 어려움',
    modeled: true,
  },
];

const NON_MODELED = [
  {
    name: 'Liquidation-value Approach',
    formula: '예측기간 종료 후 자산매각 수익 추정 − 부채 상환',
    assumption: '회사의 liquidation이 확실한 경우에 국한',
  },
  {
    name: 'Replacement-cost Approach',
    formula: '회사 자산을 대체하는 데 필요한 cost',
    assumption: '유형자산에 국한 · 대체 가능 자산이 일부에 해당',
  },
];

export default function TerminalValuePage() {
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
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>Terminal Value(=Continuing Value)는 명시적 예측 이후의 영구 가치를 한 숫자로 압축한다. 산출 방식은 8가지.</Headline>
        <Body>
          <p>
            DCF 기업가치의 50~80%를 Terminal Value가 차지하는 경우가 많기 때문에, 어떤 방식을 선택하느냐에 따라 결과가 크게
            달라진다. 본 페이지의 시뮬레이터로 같은 입력값에 6가지 방식을 동시 적용해 비교해본다.
          </p>
        </Body>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold">8가지 방식 — 슬라이드 16 원본 표</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs">
                <th className="px-3 py-2 text-left font-semibold">Approach</th>
                <th className="px-3 py-2 text-left font-semibold">방식</th>
                <th className="px-3 py-2 text-left font-semibold">공식</th>
                <th className="px-3 py-2 text-left font-semibold">가정</th>
              </tr>
            </thead>
            <tbody>
              {METHODS.map((m, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-xs">{m.group}</td>
                  <td className="px-3 py-2 text-xs font-medium">{m.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{m.formula}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{m.assumption}</td>
                </tr>
              ))}
              {NON_MODELED.map((m, i) => (
                <tr key={`o-${i}`} className="border-b last:border-b-0 bg-muted/20">
                  <td className="px-3 py-2 text-xs">Others</td>
                  <td className="px-3 py-2 text-xs font-medium">{m.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{m.formula}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{m.assumption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="note">
          본 시뮬레이터는 Liquidation·Replacement-cost를 제외한 6가지 방식만 모델링. 두 방식은 회사·자산별 특수 케이스라
          숫자만으로 자동화하기 어려움.
        </Callout>
      </section>

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

      <Formula>
        선택 가이드: 가장 보수적 = Convergence (ROIC=WACC) · 가장 공격적 = Aggressive · 일반적 권장 = Value Driver
      </Formula>
    </ChapterShell>
  );
}

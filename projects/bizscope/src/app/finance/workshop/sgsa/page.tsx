'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Body, CashflowTable, Callout, Formula, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { cagr, formatKrwCompact, terminalValue, wacc } from '@/lib/finance/corp';

/* Slide 18 — 서강사 financials (단위: 억). */
const SGSA = {
  income: {
    매출: [100, 500, 1000],
    매출원가: [20, 300, 700],
    매출이익: [80, 200, 300],
    판관비: [40, 100, 200],
    영업익: [40, 100, 100],
    이자: [2.5, 15, 20],
    세금: [7.5, 17, 16],
    순이익: [30, 68, 64],
  },
  balance: {
    자산: [200, 700, 1000],
    유동자산: [130, 540, 720],
    현금: [100, 400, 300],
    외상매출금: [20, 100, 120],
    재고자산: [10, 40, 300],
    고정자산: [70, 160, 280],
    부채: [50, 300, 400],
    유동부채: [20, 200, 100],
    자본: [150, 400, 600],
  },
};

/* 슬라이드 18은 「현재 / 1년후 / 2년후」 표기지만, DCF 할인 흐름에서는 「1년차 / 2년차 / 3년차」로 본다.
 * 손익·재무상태표 표시는 원본 표기를 유지하고, FCF/PV 표만 「N년차」로 라벨링.
 */
const COLS = ['현재', '1년후', '2년후'];
const PROJ_COLS = ['1년차', '2년차', '3년차'];

export default function SgsaWorkshop() {
  const [shares, setShares] = useState(1_000_000);
  const [waccOverride, setWaccOverride] = useState<number | null>(null);

  /* Slide 19 — WACC 도출
   * Re ≈ ROE = 순이익 / 자본
   * Rd ≈ 이자 / 부채
   * t  ≈ 세금 / 세전이익(영업익 − 이자)
   */
  const waccByYear = COLS.map((_, i) => {
    const Re = SGSA.income.순이익[i] / SGSA.balance.자본[i];
    const Rd = SGSA.income.이자[i] / SGSA.balance.부채[i];
    const preTax = SGSA.income.영업익[i] - SGSA.income.이자[i];
    const t = preTax > 0 ? SGSA.income.세금[i] / preTax : 0;
    return wacc({
      E: SGSA.balance.자본[i],
      D: SGSA.balance.부채[i],
      Re,
      Rd,
      t,
    });
  });
  const yr2Wacc = waccOverride ?? waccByYear[2].wacc;

  /* Slide 20 — FCF의 PV 합. 강의에서 FCF = EBIT 가정 (감가/△WC/CAPEX 무시).
   * 데이터 컬럼은 「현재 / 1년후 / 2년후」지만 강의의 PV 200.5는 1/2/3년차로 할인한 값
   * (현재 시점부터 한 해씩 미래로 흘러간다고 보는 표준 DCF 관행).
   * 따라서 인덱스 t에 대해 (t+1) 거듭제곱으로 할인.
   */
  const fcfNominal = SGSA.income.영업익;
  const pvFcfYear = fcfNominal.map((cf, t) => cf / Math.pow(1 + yr2Wacc, t + 1));
  const sumPv = pvFcfYear.reduce((a, b) => a + b, 0);

  /* Slide 21 — Terminal Value
   * CAGR = (FCF2/FCF0)^(1/2) − 1
   * FCF4 = FCF2 × (1+CAGR)² (강의는 「3년차 FCF를 CAGR로 추정」 = 인덱스 t+1 기준 4년차)
   * TV = FCF4 / (WACC − g) (g≥WACC면 WACC만 사용)
   * PV(TV) = TV / (1+WACC)^N where N = projection 마지막 해(=3)
   */
  const g = cagr(fcfNominal[0], fcfNominal[2], 2);
  const fcfNext = fcfNominal[2] * Math.pow(1 + g, 2);
  const tv = useMemo(
    () => terminalValue({ method: 'growing-perpetuity', fcfNext, waccRate: yr2Wacc, growth: g }),
    [fcfNext, yr2Wacc, g],
  );
  const pvTv = tv / Math.pow(1 + yr2Wacc, fcfNominal.length);

  /* Slide 22 — Equity value = Σ PV(FCF) + PV(TV) − 순부채 + 유휴자산 */
  const netDebt = SGSA.balance.부채[0] - SGSA.balance.현금[0]; // 50 − 100 = −50 (현금이 더 많음)
  const enterpriseValue = sumPv + pvTv;
  const equityValue = enterpriseValue - netDebt;
  const sharePrice = equityValue / shares;

  return (
    <article className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/finance/workshop"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        워크샵 목록으로
      </Link>
      <header className="mt-4">
        <div className="text-xs font-mono uppercase tracking-wider text-indigo-500">Workshop · 비상장사</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">서강사 DCF 워크샵</h1>
        <div className="mt-2 text-xs text-muted-foreground">자료: 재무_기업가치 · slide 18~22 · 주식수 100만주(비상장)</div>
      </header>

      <section className="mt-8 space-y-4">
        <h2 className="text-base font-bold">1단계 — 재무자료 (slide 18)</h2>
        <CashflowTable
          caption="손익계산서 (억)"
          columns={COLS}
          rows={Object.entries(SGSA.income).map(([k, v]) => ({
            label: k,
            cells: v.map((n) => n.toLocaleString('ko-KR')),
            emphasize: k === '영업익',
          }))}
        />
        <CashflowTable
          caption="재무상태표 (억)"
          columns={COLS}
          rows={Object.entries(SGSA.balance).map(([k, v]) => ({
            label: k,
            cells: v.map((n) => n.toLocaleString('ko-KR')),
            emphasize: k === '부채' || k === '자본',
          }))}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">2단계 — WACC 계산 (slide 19)</h2>
        <Body>
          <p>Re는 ROE(순이익/자본)로 대체. Rd는 이자/부채. t는 세금/세전이익.</p>
        </Body>
        <CashflowTable
          columns={COLS}
          rows={[
            { label: 'Re (≈ROE)', cells: COLS.map((_, i) => `${((SGSA.income.순이익[i] / SGSA.balance.자본[i]) * 100).toFixed(2)}%`) },
            { label: 'Rd (이자율)', cells: COLS.map((_, i) => `${((SGSA.income.이자[i] / SGSA.balance.부채[i]) * 100).toFixed(2)}%`) },
            { label: 't', cells: COLS.map((_, i) => {
              const pre = SGSA.income.영업익[i] - SGSA.income.이자[i];
              return pre > 0 ? `${((SGSA.income.세금[i] / pre) * 100).toFixed(0)}%` : '0%';
            }) },
            { label: 'E/(D+E)', cells: waccByYear.map((w) => `${(w.weightE * 100).toFixed(0)}%`) },
            { label: 'D/(D+E)', cells: waccByYear.map((w) => `${(w.weightD * 100).toFixed(0)}%`) },
            { label: 'WACC', cells: waccByYear.map((w) => `${(w.wacc * 100).toFixed(2)}%`), emphasize: true },
          ]}
        />
        <Callout>
          2년차 WACC ≈ <strong>{(yr2Wacc * 100).toFixed(2)}%</strong> — 이를 할인율로 사용. (강의 예시 값: 8%)
        </Callout>
        <NumberInput
          label="WACC 수동 조정 (선택)"
          value={(waccOverride ?? yr2Wacc) * 100}
          onChange={(n) => setWaccOverride(n / 100)}
          step={0.5}
          suffix="%"
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">3단계 — FCF의 PV 합 (slide 20)</h2>
        <Formula>FCF ≈ EBIT 가정 — 감가상각 / △WC / CAPEX 단순화</Formula>
        <CashflowTable
          caption="원본 슬라이드의 「현재/1년후/2년후」를 DCF 표기인 「1/2/3년차」로 환산"
          columns={PROJ_COLS}
          rows={[
            { label: 'FCF (= 영업익)', cells: fcfNominal.map((n) => n.toLocaleString('ko-KR')) },
            { label: `PV @ WACC ${(yr2Wacc * 100).toFixed(2)}%`, cells: pvFcfYear.map((n) => n.toFixed(2)) },
          ]}
        />
        <Stat label="Σ PV(FCF)" value={`${sumPv.toFixed(2)} 억원`} sub="강의 예시 200.5" />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">4단계 — Terminal Value 산정 (slide 21)</h2>
        <Formula>
          CAGR = (FCF₂ / FCF₀)^(1/2) − 1 = {(g * 100).toFixed(2)}%
          <br />
          FCF₃ = FCF₂ × (1 + g) = {fcfNext.toFixed(2)}
          <br />
          {g >= yr2Wacc ? 'g ≥ WACC → TV = FCF₃ / WACC' : 'TV = FCF₃ / (WACC − g)'}
          <br />
          TV = {tv.toFixed(2)} → PV(TV) = TV / (1+WACC)³ = {pvTv.toFixed(2)}
        </Formula>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="CAGR (g)" value={`${(g * 100).toFixed(2)}%`} />
          <Stat label="Terminal Value" value={`${tv.toFixed(2)} 억`} sub="강의 예시 988.2" />
          <Stat label="PV(TV)" value={`${pvTv.toFixed(2)} 억`} sub="강의 예시 633.1" />
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">5단계 — 기업가치(주주가치) 산출 (slide 22)</h2>
        <Formula>
          기업가치(EV) = Σ PV(FCF) + PV(TV) = {enterpriseValue.toFixed(2)}
          <br />
          주주가치 = EV − 순부채 (이자부부채 − 현금) + 유휴부동산
          <br />
          순부채 = 부채 50 − 현금 100 = -50 → 차감 시 +50 가산
          <br />
          주주가치 = {enterpriseValue.toFixed(2)} − ({netDebt.toFixed(2)}) = <strong>{equityValue.toFixed(2)} 억</strong>
        </Formula>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="기업가치 EV" value={`${enterpriseValue.toFixed(2)} 억`} />
          <Stat label="주주가치 Equity" value={`${equityValue.toFixed(2)} 억`} sub="강의 예시 883.6" />
          <Stat label="주당가치" value={`${formatKrwCompact(sharePrice * 1e8)} / 주`} />
        </div>
        <NumberInput label="주식수" value={shares} onChange={setShares} step={100_000} suffix="주" />
        <Callout>
          입력값을 바꿔보면 5단계 모두 즉시 재계산. 강의 예시값 883.6억은 WACC 8%·CAGR 58% 가정에서 도출.
        </Callout>
      </section>
    </article>
  );
}

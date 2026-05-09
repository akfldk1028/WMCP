'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Body, CashflowTable, Callout, Formula, Headline, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { cagr, formatKrwCompact, terminalValue } from '@/lib/finance/corp';

/* Slide 23 — FCF 추정 (단위: 십억) */
const FCF_ESTIMATE = {
  years: ['2019', '2020', '2021E', '2022E', '2023E'],
  ocf: [816, 1386, 1301, 1437, 1543],
  netIncome: [224, 363, 357, 487, 592],
  ebitda: [1033, 1223, 1444, 1592, 1706],
  fcf: [-106, 881, 513, 393, 492],
};

export default function EmartWorkshop() {
  const [waccPct, setWaccPct] = useState(2.64);
  const [growthPct, setGrowthPct] = useState(-2.07);
  const [shares, setShares] = useState(27_875_819);

  const wacc = waccPct / 100;
  const g = growthPct / 100;

  /* FCF 1~3 = 2021E, 2022E, 2023E (인덱스 2,3,4). FCF0 reference = 2020 (881) */
  const projectionFcf = FCF_ESTIMATE.fcf.slice(2);
  const pvProjection = projectionFcf.map((cf, i) => cf / Math.pow(1 + wacc, i + 1));
  const sumPvProjection = pvProjection.reduce((a, b) => a + b, 0);

  /* CAGR — slide 23 ends with g = -2.07% derived from FCF series. */
  const computedCagr = useMemo(() => cagr(FCF_ESTIMATE.fcf[1], FCF_ESTIMATE.fcf[4], 3), []);

  /* Terminal Value — slide 24 example uses FCF_T+1 = 492 × (1 + g) = 492 × (1 − 2.07%) */
  const fcfNext = projectionFcf[projectionFcf.length - 1] * (1 + g);
  const tv = terminalValue({ method: 'growing-perpetuity', fcfNext, waccRate: wacc, growth: g });
  const pvTv = tv / Math.pow(1 + wacc, projectionFcf.length);

  /* 5단계 — Slide 25
   * 2020 말 순부채 = -5,279 (보고된 값, 부호는 가산 의미)
   * 합산: Σ PV(FCF) + PV(TV) − 순부채 + 유휴부동산
   */
  const netDebt2020 = -5279;
  const idleAssets = 0;
  const enterpriseValue = sumPvProjection + pvTv;
  const equityValue = enterpriseValue + Math.abs(netDebt2020) + idleAssets; // 순부채가 음수면 가산
  const sharePrice = (equityValue * 1e9) / shares; // value in won

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
        <div className="text-xs font-mono uppercase tracking-wider text-indigo-500">Workshop · 상장사</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">이마트 DCF 워크샵</h1>
        <div className="mt-2 text-xs text-muted-foreground">자료: 재무_기업가치 · slide 23~26 · 코스피 60위</div>
      </header>

      <section className="mt-8 space-y-4">
        <h2 className="text-base font-bold">전략 3축 — 슬라이드 23 본문</h2>
        <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">오프라인 차별화:</strong> 할인점 트래픽 회복과 트레이더스의 고성장; 주요
            종속회사 실적 개선; 복합쇼핑몰 사업 확장
          </li>
          <li>
            <strong className="text-foreground">온라인 고속 성장:</strong> SSG닷컴 순매출 증가와 영업적자 폭 감소; W컨셉 인수;
            네이버와 플랫폼/AI/중소셀러 협력
          </li>
          <li>
            <strong className="text-foreground">투자 확대:</strong> 인력 충원 / PP센터 / NeO 자동화 물류센터 신설 / 이베이코리아
            인수 등 대규모 CAPEX
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">1단계 — FCF 추정 (slide 23)</h2>
        <CashflowTable
          caption="영업활동 / 투자활동 현금흐름 → FCF (단위: 십억원)"
          columns={FCF_ESTIMATE.years}
          rows={[
            { label: '영업활동 OCF', cells: FCF_ESTIMATE.ocf.map((n) => n.toLocaleString('ko-KR')) },
            { label: '당기순이익', cells: FCF_ESTIMATE.netIncome.map((n) => n.toLocaleString('ko-KR')) },
            { label: 'EBITDA', cells: FCF_ESTIMATE.ebitda.map((n) => n.toLocaleString('ko-KR')) },
            { label: 'Free Cash Flow', cells: FCF_ESTIMATE.fcf.map((n) => n.toLocaleString('ko-KR')), emphasize: true },
          ]}
        />
        <Callout tone="note">
          FCF의 CAGR (2020 → 2023E, 3년) = <strong>{(computedCagr * 100).toFixed(2)}%</strong> · 강의 예시 −2.07%.
          현재 시뮬레이터 값 {growthPct.toFixed(2)}%.
        </Callout>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">2단계 — WACC 산출 (slide 24)</h2>
        <Formula>
          K_E = (5.5% + 2.8% + 4.0%) / 3 = 4.1% &nbsp; (3년 ROE 평균)
          <br />
          K_D = 244 / 11,223 = 2.17% &nbsp; (금융비용 / 부채총계)
          <br />t = 259 / 622 = 41.64% &nbsp; (법인세비용 / 세전이익)
          <br />
          WACC = (10,492/21,714) × 4.1% + (11,223/21,714) × 2.17% × (1 − 41.64%) ≈ 2.64%
        </Formula>
        <NumberInput label="WACC (수동 조정)" value={waccPct} onChange={setWaccPct} step={0.1} suffix="%" />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">3단계 — FCF 현가화 (slide 24)</h2>
        <CashflowTable
          columns={FCF_ESTIMATE.years.slice(2)}
          rows={[
            { label: 'FCF (십억)', cells: projectionFcf.map((n) => n.toLocaleString('ko-KR')) },
            { label: `PV @ ${waccPct.toFixed(2)}%`, cells: pvProjection.map((n) => n.toFixed(2)) },
          ]}
        />
        <Stat label="Σ PV(FCF) — 명시 예측 기간" value={`${sumPvProjection.toFixed(2)} 십억`} />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">4단계 — Terminal Value (slide 24)</h2>
        <Formula>
          TV = FCF₃ × (1 + g) / (WACC − g)
          <br />= 492 × (1 − 2.07%) / (2.64% − (−2.07%))
          <br />= 492 × {(1 + g).toFixed(4)} / {(wacc - g).toFixed(4)} = <strong>{tv.toFixed(2)} 십억</strong>
          <br />
          PV(TV) = TV / (1 + WACC)⁴ = {pvTv.toFixed(2)} 십억
        </Formula>
        <NumberInput label="영구성장률 g" value={growthPct} onChange={setGrowthPct} step={0.1} suffix="%" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Terminal Value" value={`${tv.toFixed(2)} 십억`} sub="강의 예시 10,229.72" />
          <Stat label="PV(Terminal Value)" value={`${pvTv.toFixed(2)} 십억`} />
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">5단계 — 기업가치(주주가치) 산출 (slide 25)</h2>
        <Formula>
          기업가치 = Σ PV(FCF) + PV(TV) = {enterpriseValue.toFixed(2)} 십억
          <br />
          주주가치 = 기업가치 − 순부채 (= −5,279) + 유휴부동산 (= 0)
          <br />
          = {enterpriseValue.toFixed(2)} + 5,279 = <strong>{equityValue.toFixed(2)} 십억</strong>
        </Formula>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="기업가치 EV" value={`${formatKrwCompact(enterpriseValue * 1e9)}`} sub={`${enterpriseValue.toFixed(2)} 십억`} />
          <Stat label="주주가치 Equity" value={`${formatKrwCompact(equityValue * 1e9)}`} sub="강의 예시 4조 4,551억" />
          <Stat label="이론 주가" value={formatKrwCompact(sharePrice)} sub={`${shares.toLocaleString('ko-KR')}주`} />
        </div>
        <NumberInput label="발행주식수" value={shares} onChange={setShares} step={100_000} suffix="주" />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-base font-bold">6단계 — 3가지 평가법 비교 (slide 26)</h2>
        <CashflowTable
          columns={['시가총액법', 'Multiple Method', 'DCF Method']}
          rows={[
            { label: '추정치', cells: ['4조 5,019억', '3조 1,490억 ~ 6조 6,087억', '4조 4,551억'], emphasize: true },
            { label: '주된 고려사항', cells: ['현재 주가', '동일업종 유사기업 비율', '추정 FCF + 전략'] },
            { label: '미반영 요인', cells: ['미공개 정보', '회사 간 객관적 유사도', 'TV/FCF 성장률 변동'] },
          ]}
        />
        <Callout>
          DCF가 시총보다 낮게 나오는 이유: 인력 확충, PP센터, NeO 물류센터, 카테고리 M&A 등 미래 대규모 투자로 명시 예측
          기간의 FCF가 마이너스 → CAGR도 마이너스. 시장은 미래 매출·영업이익 고성장에 베팅하지만 단순 DCF는 그것을 충분히
          반영하지 못함.
        </Callout>
      </section>
    </article>
  );
}

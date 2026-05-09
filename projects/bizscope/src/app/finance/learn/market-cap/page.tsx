'use client';

import { useState } from 'react';
import { Body, CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { formatKrwCompact } from '@/lib/finance/corp';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'market-cap')!;

export default function MarketCapPage() {
  const [shares, setShares] = useState(101_278_725);
  const [price, setPrice] = useState(20_450);
  const cap = shares * price;

  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          첫번째 기업가치(주주가치) 평가 방법은 시가총액법. 시장의 수요·공급으로 결정되는 주가와 주식수의 곱.
        </Headline>
        <Formula>시가총액 = 주가 × 발행주식수(또는 유통주식수)</Formula>
      </section>

      <section className="space-y-4">
        <Headline>예제 — 제일기획 (기준일: 2017년 6월 30일)</Headline>
        <CashflowTable
          caption="제일기획 주식의 총수 (단위: 주)"
          columns={['보통주', '우선주', '합계', '비고']}
          rows={[
            { label: 'I. 발행할 주식의 총수', cells: ['300,000,000', '100,000,000', '400,000,000', ''] },
            { label: 'II. 현재까지 발행한 주식의 총수', cells: ['115,041,225', '–', '115,041,225', ''] },
            { label: 'IV. 발행주식의 총수 (II–III)', cells: ['115,041,225', '–', '115,041,225', ''] },
            { label: 'V. 자기주식수', cells: ['13,762,500', '–', '13,762,500', ''] },
            { label: 'VI. 유통주식수 (IV–V)', cells: ['101,278,725', '–', '101,278,725', ''], emphasize: true },
          ]}
        />
        <Callout>
          제일기획 시총 = 101,278,725주 × 20,450원 = <strong>약 2.07조원</strong> (보고서 기재값 2.27조 — 보통/우선
          포함 또는 평가시점 차이).
        </Callout>
      </section>

      <section className="space-y-4">
        <Headline>예제 — 이마트</Headline>
        <CashflowTable
          columns={['지표', '값']}
          rows={[
            { label: '시가총액', cells: ['4조 5,019억원', ''] },
            { label: '시가총액순위', cells: ['코스피 60위', ''] },
            { label: '상장주식수', cells: ['27,875,819', ''] },
            { label: '액면가 / 매매단위', cells: ['5,000원 / 1주', ''] },
            { label: '주가 (기준)', cells: ['161,500원', ''] },
            { label: '시가총액 = 161,500 × 27,875,819', cells: ['4,501,944,768,500원', '≈ 4조 5,019억'], emphasize: true },
          ]}
        />
        <CashflowTable
          caption="주요 주주 구성"
          columns={['보유주식수(보통)', '보유지분(%)']}
          rows={[
            { label: '정용진 외 1인', cells: ['7,960,493', '28.56'] },
            { label: '정용진', cells: ['5,172,911', '18.56'] },
            { label: '이명희', cells: ['2,787,582', '10.00'] },
            { label: '국민연금공단', cells: ['3,116,712', '11.18'] },
            { label: '자사주', cells: ['87,464', '0.31'] },
            { label: '외국인지분율', cells: ['', '31.59%'] },
          ]}
        />
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-base font-bold">직접 계산 — 시가총액 산출기</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberInput label="주식수" value={shares} onChange={setShares} step={1_000_000} suffix="주" />
          <NumberInput label="주가" value={price} onChange={setPrice} step={1000} suffix="원" />
        </div>
        <Stat label="시가총액" value={formatKrwCompact(cap)} sub={`${cap.toLocaleString('ko-KR')}원`} />
      </section>

      <Callout tone="warn">
        <strong>한계</strong>: 비상장사는 시가가 없다. 또한 내부정보·미래 잠재력이 시장에 충분히 반영되지 않을 때 시총은
        실제 가치를 과대 또는 과소평가할 수 있다 — Multiple Method와 DCF로 보완해야 하는 이유.
      </Callout>
    </ChapterShell>
  );
}

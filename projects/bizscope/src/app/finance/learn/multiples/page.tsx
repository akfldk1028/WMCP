'use client';

import { useState } from 'react';
import { Body, CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS, NumberInput, Stat } from '@/modules/finance-learn/primitives';
import { evEbitdaValuation, formatKrwCompact, pbrValuation, perValuation, psrValuation } from '@/lib/finance/corp';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'multiples')!;

export default function MultiplesPage() {
  const [netIncome, setNetIncome] = useState(90_648);
  const [bookEquity, setBookEquity] = useState(776_285);
  const [revenue, setRevenue] = useState(220_330);
  const [ebitda, setEbitda] = useState(12_234);
  const [netDebt, setNetDebt] = useState(49_760);

  const [perPeer, setPerPeer] = useState(20);
  const [pbrPeer, setPbrPeer] = useState(1.5);
  const [psrPeer, setPsrPeer] = useState(0.18);
  const [evePeer, setEvePeer] = useState(9.54);

  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          Multiple Method는 유사한 기업을 선정하여 그 기업의 순이익·현금흐름·장부가·매출액에 대비시킴으로써 기업가치를
          산정하는 방법.
        </Headline>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">PER (주가수익률)</h2>
        <Body>
          <p>주가에 대비한 기업의 경영성과(주가수준에 비해 성과가 얼마나 좋은가). PER이 낮을수록 주가의 상승여력이 강한 것이 일반적.</p>
        </Body>
        <Formula>PER = 주가 / 주당순이익 → 기업가치 = 대상회사 순이익 × 유사기업 PER</Formula>
        <CashflowTable
          caption="제일기획 손익 — 슬라이드 8 원본 표"
          columns={['2016', '2015', '2014']}
          rows={[
            { label: '연결 당기순이익', cells: ['90,648', '81,741', '102,022'] },
            { label: '자본총계', cells: ['776,285', '800,340', '882,690'] },
            { label: '기업가치 (PER 20×)', cells: ['1,812,960', '1,634,820', '2,040,440'] },
            { label: '경쟁사 PER 25× 적용', cells: ['2,266,200', '2,043,525', '2,550,550'], emphasize: true },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">PBR (시장가치 대 장부가액)</h2>
        <Body>
          <p>회사가 보유한 순자산의 주당 가치(일종의 청산가치). PBR이 1 이상이면 자산가치가 주가에 비해 낮은 것.</p>
        </Body>
        <Formula>PBR = 주가 / 주당순자산 → 기업가치 = 대상회사 자본 × 유사기업 PBR</Formula>
        <CashflowTable
          caption="제일기획 PBR 적용 — 슬라이드 9"
          columns={['2016', '2015', '2014']}
          rows={[
            { label: '자본총계', cells: ['776,285', '800,340', '882,690'] },
            { label: '기업가치 (PBR 1.5×)', cells: ['1,164,427', '1,200,510', '1,324,035'] },
            { label: '경쟁사 PBR 2× 적용', cells: ['1,552,570', '1,600,680', '1,765,380'], emphasize: true },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">PSR (시장가치 대 매출액)</h2>
        <Body>
          <p>당장의 수익성보다 미래가치가 중시되는 벤처기업 등에 주로 활용. PSR이 높을수록 매출 성장 가능성이 강함.</p>
        </Body>
        <Formula>PSR = 시가총액 / 매출액 → 기업가치 = 대상회사 매출 × 유사기업 PSR</Formula>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">EV / EBITDA</h2>
        <Body>
          <p>EBITDA가 Cash Flow의 척도로 대부분의 M&A 투자자가 가장 관심을 갖는 지표. EV는 시총 + 순차입금.</p>
        </Body>
        <Formula>
          EV = 주가 × 주식수 + 순차입금
          <br />
          기업가치(주주가치) = (대상회사 EBITDA × 유사기업 EV/EBITDA) − 순부채
        </Formula>
        <CashflowTable
          caption="이마트 vs 롯데쇼핑 — 슬라이드 10 (단위: 억원)"
          columns={['이마트', '롯데쇼핑']}
          rows={[
            { label: '매출액', cells: ['220,330', '161,844'] },
            { label: '당기순이익', cells: ['3,626', '−6,866'] },
            { label: 'EBITDA', cells: ['12,234', '16,208'] },
            { label: '자본총계', cells: ['104,966', '110,888'] },
            { label: '순차입금', cells: ['49,760', '118,945'] },
            { label: '발행주식수', cells: ['27,875,819', '28,288,755'] },
          ]}
        />
        <Callout>
          롯데쇼핑 기준 산정된 이마트 적용 배수: PER 11.7배 / PBR 0.3배 / PSR 0.18배 / EV·EBITDA 9.54배. (롯데 PER이
          N/A이므로 GS리테일 PER 사용)
        </Callout>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-base font-bold">직접 계산 — 4가지 Multiple 동시 산출</h2>
        <Body>
          <p>슬라이드 10의 이마트 입력값이 기본. 본인 회사 숫자를 넣으면 4가지 결과가 동시에 갱신.</p>
        </Body>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NumberInput label="순이익" value={netIncome} onChange={setNetIncome} step={100} hint="(억)" />
          <NumberInput label="자본총계" value={bookEquity} onChange={setBookEquity} step={1000} hint="(억)" />
          <NumberInput label="매출액" value={revenue} onChange={setRevenue} step={1000} hint="(억)" />
          <NumberInput label="EBITDA" value={ebitda} onChange={setEbitda} step={100} hint="(억)" />
          <NumberInput label="순차입금" value={netDebt} onChange={setNetDebt} step={1000} hint="(억)" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumberInput label="유사기업 PER" value={perPeer} onChange={setPerPeer} step={0.5} suffix="배" />
          <NumberInput label="유사기업 PBR" value={pbrPeer} onChange={setPbrPeer} step={0.1} suffix="배" />
          <NumberInput label="유사기업 PSR" value={psrPeer} onChange={setPsrPeer} step={0.05} suffix="배" />
          <NumberInput label="유사기업 EV/EBITDA" value={evePeer} onChange={setEvePeer} step={0.5} suffix="배" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="PER 가치" value={formatKrwCompact(perValuation(netIncome, perPeer) * 1e8)} sub={`${perValuation(netIncome, perPeer).toLocaleString('ko-KR')} (억)`} />
          <Stat label="PBR 가치" value={formatKrwCompact(pbrValuation(bookEquity, pbrPeer) * 1e8)} sub={`${pbrValuation(bookEquity, pbrPeer).toLocaleString('ko-KR')} (억)`} />
          <Stat label="PSR 가치" value={formatKrwCompact(psrValuation(revenue, psrPeer) * 1e8)} sub={`${psrValuation(revenue, psrPeer).toLocaleString('ko-KR')} (억)`} />
          <Stat label="EV/EBITDA 가치" value={formatKrwCompact(evEbitdaValuation(ebitda, evePeer, netDebt) * 1e8)} sub={`${evEbitdaValuation(ebitda, evePeer, netDebt).toLocaleString('ko-KR')} (억)`} />
        </div>
        <Callout tone="note">
          입력값을 「억원」 단위로 받기 때문에, 단위 환산은 결과 카드에서 자동으로 「조/억」 표기로 변환됨.
        </Callout>
      </section>
    </ChapterShell>
  );
}

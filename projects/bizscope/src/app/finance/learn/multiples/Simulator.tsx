'use client';

import { useState } from 'react';
import { Callout, Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';
import { evEbitdaValuation, formatKrwCompact, pbrValuation, perValuation, psrValuation } from '@/lib/finance/corp';

export default function MultiplesSimulator() {
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
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <h2 className="text-base font-bold">직접 계산 — 4가지 Multiple 동시 산출</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        슬라이드 10의 이마트 입력값이 기본. 본인 회사 숫자를 넣으면 4가지 결과가 동시에 갱신.
      </p>
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
  );
}

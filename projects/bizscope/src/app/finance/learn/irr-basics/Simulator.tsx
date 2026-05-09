'use client';

import { useMemo, useState } from 'react';
import { Stat } from '@/modules/finance-learn/primitives';
import { NumberInput } from '@/modules/finance-learn/client-fields';
import { irr, npv } from '@/lib/finance/corp';

export default function IrrBasicsSimulator() {
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
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <h2 className="text-base font-bold">직접 풀어보기 — IRR 자동 계산</h2>
      <p className="text-sm text-muted-foreground">
        원본 슬라이드의 연습문제: 1,000 투자, 1년 후 1,000, 2년 후 500, 3년 후 0. 입력값을 바꿔보세요.
      </p>
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
  );
}

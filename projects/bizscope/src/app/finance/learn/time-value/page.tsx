import { CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import TimeValueSimulator from './Simulator';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'time-value')!;

export default function TimeValuePage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>100원을 은행에 이자율 10%로 2년간 예치한다면 2년후에는 얼마가 될까?</Headline>
        <p className="text-sm leading-relaxed text-muted-foreground">
          오늘의 100원과 1년 후의 100원의 가치는 다르다. 매년 이자가 붙어 복리로 증가하므로, 1년 후 110원, 2년 후 121원이
          된다. 모든 가치 평가의 출발점은 이 단순한 사실이다.
        </p>
        <Formula>FV_t = PV × (1 + r)^t</Formula>
        <CashflowTable
          caption="원본 슬라이드 표 — 원금 + 이자 공식"
          columns={['Time 0', 'Time 1', 'Time 2']}
          rows={[
            { label: 'Cash Flow (원금+이자)', cells: ['100', '110', '121'] },
            { label: '이자 (10%)', cells: ['', '100×0.1=10', '110×0.1=11'] },
            { label: '원금 + 이자 공식', cells: ['0', '100×(1+0.1)', '100×(1+0.1)²'], emphasize: true },
          ]}
        />
        <Callout>즉, 100원을 10% 이자율로 2년 동안 예금하면 121원이 됨.</Callout>
      </section>

      <section className="space-y-4">
        <Headline>그러면 1년 후 110원이나 2년 후 121원은 현재 가치로 얼마인가? 단 할인율은 이자율과 같은 10%로 가정</Headline>
        <p className="text-sm leading-relaxed text-muted-foreground">
          거꾸로 미래의 현금을 같은 할인율로 끌어오면 모두 현재가치 100원으로 수렴한다.
        </p>
        <Formula>PV = FV_t / (1 + r)^t</Formula>
        <CashflowTable
          caption="원본 슬라이드 표 — 할인율 공식"
          columns={['Time 0', 'Time 1', 'Time 2']}
          rows={[
            { label: 'Cash Flow', cells: ['100', '110', '121'] },
            { label: '할인율 공식', cells: ['', '110/(1+0.1)', '121/(1+0.1)²'] },
            { label: 'Present Value (현재 가치)', cells: ['100', '100', '100'], emphasize: true },
          ]}
        />
        <Callout>즉, 1년 후 110원의 현재 가치는 100원, 2년 후 121원의 현재 가치는 100원임.</Callout>
      </section>

      <TimeValueSimulator />
    </ChapterShell>
  );
}

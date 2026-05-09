import { CashflowTable, Callout, ChapterShell, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import InvestmentCompareSimulator from './Simulator';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'investment-compare')!;

export default function InvestmentComparePage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>NPV 분석으로 어떤 투자안이 나은 투자안인지 판단하시오.</Headline>
        <p className="text-sm leading-relaxed text-muted-foreground">
          산업은행으로부터 12% 대출이자율로 펀딩을 받아 투자해야 하는 입장 — 즉, 프로젝트 수익으로 원금과 이자를 갚아야
          한다.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          투자안 1은 투자금이 더 적고(1,300) 회수가 초기에 몰린 구조, 투자안 2는 투자금이 더 많지만(1,400) 후반부에 큰
          수익이 실현된다. 단순 합계로는 투자안 2가 1,850으로 더 크지만, 시간가치를 반영하면 결론이 바뀐다.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-bold">Investment #1</h2>
          <CashflowTable
            columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
            rows={[
              { label: 'Cash Flow', cells: ['(1,300)', '700', '600', '400'] },
              { label: 'Discount Factor', cells: ['1.00', '1.12', '1.25', '1.40'] },
              { label: 'Present Value', cells: ['(1,300)', '625', '478', '284'] },
              { label: 'Net Present Value', cells: ['88', '', '', ''], emphasize: true },
            ]}
          />
          <Callout>1,300원 투자 → 1,700원 회수 (단순합). 현가 개념으로는 대출 갚고 88원 남는 프로젝트.</Callout>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-bold">Investment #2</h2>
          <CashflowTable
            columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
            rows={[
              { label: 'Cash Flow', cells: ['(1,400)', '450', '600', '800'] },
              { label: 'Discount Factor', cells: ['1.00', '1.12', '1.25', '1.40'] },
              { label: 'Present Value', cells: ['(1,400)', '402', '478', '569'] },
              { label: 'Net Present Value', cells: ['49', '', '', ''], emphasize: true },
            ]}
          />
          <Callout>1,400원 투자 → 1,850원 회수. 현가 개념으로는 49원 남는 프로젝트.</Callout>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <Headline>
          투자 1안의 미래 현금흐름 단순 합계는 2안에 비해 적음에도 현재가치로 환산하면 더 유익한 투자로 나타난다.
        </Headline>
        <p className="mt-3 text-sm text-muted-foreground">
          이게 바로 NPV의 핵심 — 「얼마를 받느냐」가 아니라 「언제 받느냐」가 중요하다.
        </p>
      </section>

      <InvestmentCompareSimulator />
    </ChapterShell>
  );
}

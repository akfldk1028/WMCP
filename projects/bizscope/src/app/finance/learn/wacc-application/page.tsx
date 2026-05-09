import { CashflowTable, Callout, ChapterShell, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import WaccApplicationSimulator from './Simulator';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'wacc-application')!;

export default function WaccApplicationPage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          WACC 개념을 적용해 투자안 2의 할인율이 12%가 아니라 8.5%가 된다면, 두 투자안 비교 결론은 어떻게 바뀌는가?
        </Headline>
        <p className="text-sm leading-relaxed text-muted-foreground">
          앞 챕터에서 회사 A의 WACC를 8.5%로 구했다. 회사 A가 투자안을 평가할 때 정작 사용해야 할 할인율은 12%가 아니라
          8.5%. 투자안 #2를 8.5%로 다시 할인하면 NPV가 크게 올라간다.
        </p>
        <CashflowTable
          caption="Investment #2를 회사 A의 WACC(8.5%)로 다시 할인"
          columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
          rows={[
            { label: 'Cash Flow', cells: ['(1,400)', '450', '600', '800'] },
            { label: 'Discount Factor', cells: ['1.000', '1.085', '1.18', '1.28'] },
            { label: 'Present Value', cells: ['(1,400)', '415', '508', '625'] },
            { label: 'Net Present Value', cells: ['148', '', '', ''], emphasize: true },
          ]}
        />
        <Callout>
          1,400원 투자해 1,850원 회수하는 동일 프로젝트의 가치가 할인율을 8.5%로 바꾸자 NPV 49 → 148로 약 3배 증가.
          이제 투자안 비교 결론은 #2 우위로 뒤집힌다 (Inv #1 NPV @ 12% = 88).
        </Callout>
      </section>

      <WaccApplicationSimulator />
    </ChapterShell>
  );
}

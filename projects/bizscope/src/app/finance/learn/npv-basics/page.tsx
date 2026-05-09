import { CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import NpvBasicsSimulator from './Simulator';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'npv-basics')!;

export default function NpvBasicsPage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>올해 1,000원을 투자해서 향후 3년간 500원이 나오는 프로젝트의 가치는 현가로 얼마인가? 단 할인율 12%</Headline>
        <p className="text-sm leading-relaxed text-muted-foreground">
          미래의 현금흐름은 그대로 더하면 안 된다. 각 연도의 현금흐름을 할인율로 현재가치로 변환한 뒤, 초기 투자액을
          차감해 「순현재가치(NPV)」를 구한다. NPV가 양수이면 투자할 가치가 있는 사업.
        </p>
        <Formula>NPV = Σ CF_t / (1 + r)^t</Formula>
        <CashflowTable
          caption="원본 슬라이드 표 — 12%로 할인한 현재가치 합"
          columns={['Time 0', 'Time 1', 'Time 2', 'Time 3']}
          rows={[
            { label: 'Cash Flow', cells: ['(1,000)', '500', '500', '500'] },
            { label: 'Discount Factor', cells: ['(1.12)⁰=1', '(1.12)¹=1.12', '(1.12)²=1.25', '(1.12)³=1.40'] },
            { label: 'Present Value', cells: ['(1,000)', '446', '399', '356'] },
            { label: 'Net Present Value', cells: ['200', '', '', ''], emphasize: true },
          ]}
        />
        <Callout>따라서, 이러한 투자 (혹은 사업)의 「가치」는 200으로 계산됨.</Callout>
      </section>

      <NpvBasicsSimulator />
    </ChapterShell>
  );
}

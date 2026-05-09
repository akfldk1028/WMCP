import { Body, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'dcf-process')!;

const STEPS = [
  {
    letter: 'A',
    title: 'Forecast Free Cash Flow (FCF)',
    body: '회사의 미래 영업현금흐름을 5~10년치 직접 추정. 매출 증가, 영업이익률, 운전자본·CAPEX 변동을 반영.',
    formula: 'FCF = EBIT × (1 − t) + Depreciation − ΔWC − CAPEX',
  },
  {
    letter: 'B',
    title: 'Estimate WACC',
    body: '자기자본·타인자본의 비중과 비용으로 가중평균을 산출. 할인율의 정석.',
    formula: 'WACC = R_e × E/(D+E) + (1 − t) × R_d × D/(D+E)',
  },
  {
    letter: 'C',
    title: 'Use WACC to Discount FCF',
    body: '각 연도의 FCF를 WACC로 현가화하여 합산. 명시적 예측 기간 동안의 가치.',
    formula: 'PV(FCF) = FCF₀ + FCF₁/(1+r)¹ + FCF₂/(1+r)² + … + FCFₙ/(1+r)ⁿ',
  },
  {
    letter: 'D',
    title: 'Estimate Residual (Terminal) Value',
    body: '명시적 예측 이후 영구히 발생하는 가치를 한 숫자로 압축. 일반적으로 Gordon Growth 사용.',
    formula: 'TV = FCF_T+1 / (WACC − g)',
  },
  {
    letter: 'E',
    title: 'Estimate Total Present Value of FCF',
    body: 'PV(FCF 명시기간) + PV(TV)를 합산해 기업가치(EV)를 구하고, 순부채 차감 시 주주가치.',
    formula: 'EV = Σ FCF_t / (1+WACC)^t + TV / (1+WACC)^N',
  },
];

export default function DcfProcessPage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          기업가치는 미래의 사업 Cash Flow를 가중평균자본비용(WACC)으로 할인한 것으로 다음의 5단계 과정을 통해 산출됨.
        </Headline>
        <Body>
          <p>
            DCF는 본질가치 측정의 정석이지만, 5개 단계 어디 하나가 무너지면 결과가 크게 흔들린다. 각 단계의 가정이 무엇이고
            어디가 약점인지 인식하면서 진행하는 것이 핵심.
          </p>
        </Body>
      </section>

      <section className="space-y-4">
        {STEPS.map((s) => (
          <div key={s.letter} className="rounded-2xl border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-base font-bold text-indigo-500">
                {s.letter}
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-base font-bold">{s.title}</h2>
                <p className="text-sm text-muted-foreground">{s.body}</p>
                <Formula>{s.formula}</Formula>
              </div>
            </div>
          </div>
        ))}
      </section>

      <Callout tone="note">
        D 단계의 Terminal Value는 전체 가치의 50~80%를 차지하는 경우가 많다 — 다음 챕터에서 8가지 방식과 가정을 별도로
        다룸.
      </Callout>

      <section className="rounded-2xl border bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-6">
        <h3 className="font-bold">5단계를 케이스에 적용</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          서강사(비상장)와 이마트(상장) 두 케이스를 단계별로 따라가며 직접 계산.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/finance/workshop/sgsa"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            서강사 워크샵
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/finance/workshop/emart"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            이마트 워크샵
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </ChapterShell>
  );
}

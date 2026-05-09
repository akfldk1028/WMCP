import { Body, Callout, ChapterShell, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import Link from 'next/link';
import { ArrowRight, Building2, LineChart, Receipt } from 'lucide-react';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'valuation-methods')!;

const METHODS = [
  {
    icon: LineChart,
    name: '시가총액법 (Market Capitalization)',
    summary: '주가 × 발행주식수. 상장사라면 시장이 매기는 가격.',
    pros: '시장에 즉시 반영, 가장 객관적',
    cons: '비상장사에 적용 불가 · 내부정보·미래 가치 미반영',
    href: '/finance/learn/market-cap',
  },
  {
    icon: Receipt,
    name: 'Multiple Method',
    summary: '유사 기업의 재무지표 대비 거래 배수를 적용. PER, PBR, PSR, EV/EBITDA.',
    pros: '빠르고 직관적',
    cons: '비교군 선택이 결정적 · 성장성·체질 차이 무시 가능',
    href: '/finance/learn/multiples',
  },
  {
    icon: Building2,
    name: 'Discount Cash Flow (DCF)',
    summary: '미래 FCF를 WACC로 할인. 본질가치 측정의 정석.',
    pros: '본질 가치, 시나리오 반영 가능',
    cons: 'FCF 예측·종가성장률에 민감',
    href: '/finance/learn/dcf-process',
  },
];

export default function ValuationMethodsPage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          기업가치 평가는 ① 누가, ② 어떤 목적으로, ③ 무엇을 평가하느냐에 따라서 동일한 회사라 하더라도 평가금액이 달라질
          수 있음 — <strong>절대적인 기업가치는 있을 수 없음</strong>.
        </Headline>
        <Body>
          <p>
            기업가치를 산출하는 정통적인 방법은 크게 3가지. 각각 보는 관점이 다르고, 보통 셋을 모두 산출해 범위로 비교한다.
          </p>
        </Body>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {METHODS.map(({ icon: Icon, ...m }, i) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border bg-card p-5 transition hover:border-indigo-500/40"
          >
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10">
                <Icon className="size-4 text-indigo-500" />
              </div>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{i + 1}</span>
            </div>
            <h3 className="mt-3 text-sm font-bold">{m.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.summary}</p>
            <div className="mt-4 space-y-1.5 text-[11px]">
              <div>
                <span className="font-semibold text-emerald-600">강점:</span>{' '}
                <span className="text-muted-foreground">{m.pros}</span>
              </div>
              <div>
                <span className="font-semibold text-rose-600">한계:</span>{' '}
                <span className="text-muted-foreground">{m.cons}</span>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-500">
              자세히
              <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <Callout tone="note">
        세 방법은 서로 다른 답을 낸다. 이마트 사례에서는 시총 4조 5,019억 / Multiple 3조 1,490억 ~ 6조 6,087억 / DCF 4조
        4,551억 — 차이의 이유 자체가 분석의 핵심. 워크샵에서 직접 확인.
      </Callout>
    </ChapterShell>
  );
}

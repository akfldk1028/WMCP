import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata = {
  title: '핵심 개념 — Maker Finance',
  description: 'NPV / IRR / DCF / WACC / Multiple — 5개 개념으로 정리한 기업가치 평가의 뼈대.',
};

interface Concept {
  id: string;
  title: string;
  oneLiner: string;
  body: string;
  formula?: string;
  example: string;
  cite: string;
}

const CONCEPTS: Concept[] = [
  {
    id: 'time-value',
    title: '시간가치 (Time Value of Money)',
    oneLiner: '오늘의 100원과 1년 후 100원의 가치는 다르다.',
    body: '오늘 100원을 이자율 10%로 예치하면 1년 후 110원, 2년 후 121원이 된다. 거꾸로, 미래의 110원은 현재가치 기준 100원이다. 모든 가치 평가의 출발점이 이 단순한 사실이다.',
    formula: 'PV = FV / (1 + r)^t',
    example: '2년 후 받을 121원의 현재가치 = 121 / (1.1)² = 100원.',
    cite: '재무 101 handout, p.2~3',
  },
  {
    id: 'npv',
    title: 'NPV (Net Present Value)',
    oneLiner: '미래 현금흐름을 모두 현재가치로 끌어와 합한 값.',
    body: '투자안의 모든 미래 현금흐름을 현재가치로 환산해 더한다. NPV가 0보다 크면 비용 대비 가치가 있는 투자, 0보다 작으면 손실. 단순하지만 모든 평가 모델이 이 위에 올라간다.',
    formula: 'NPV = Σ CF_t / (1 + r)^t',
    example: '초기 투자 1,000을 들여 매년 400씩 3년간 회수, 할인율 10% → NPV ≈ -1,000 + 400/1.1 + 400/1.21 + 400/1.331 ≈ -5원 (살짝 손실).',
    cite: '재무 101 handout, p.4~7 / 재무_기업가치 §2 Valuation',
  },
  {
    id: 'irr',
    title: 'IRR (Internal Rate of Return)',
    oneLiner: 'NPV를 0으로 만드는 할인율 = 투자안의 기대 수익률.',
    body: '투자안의 NPV가 정확히 0이 되도록 만드는 할인율. 자본조달비용보다 IRR이 높으면 투자할 가치가 있다. 메이커 입장에서는 "내가 투입한 시간/돈의 연 환산 수익률"로 이해하면 직관적.',
    formula: '0 = Σ CF_t / (1 + IRR)^t',
    example: '초기 1,000 투자, 1년 후 1,000, 2년 후 500 회수 → IRR ≈ 28%.',
    cite: '재무 101 handout, p.8~10',
  },
  {
    id: 'dcf',
    title: 'DCF (Discounted Cash Flow)',
    oneLiner: '미래 현금흐름을 할인해 기업가치를 산출하는 정통 방법.',
    body: '5~10년치 잉여현금흐름(FCF)을 예측하고 WACC로 할인. 마지막 해 이후는 영구성장 가정의 Terminal Value로 처리한다. 본 도구는 5년 명시 + Gordon Growth(g=3%) 종가치 모델을 사용한다.',
    formula: 'V = Σ FCF_t / (1+WACC)^t + TV / (1+WACC)^N,  TV = FCF_N × (1+g) / (WACC - g)',
    example: '연 매출 12억(ARR), 70% 마진, 연 80% 성장, 할인율 15%, 종가성장 3% → DCF ≈ 75~90억.',
    cite: '재무_기업가치 §2 Valuation, §3 Workshop',
  },
  {
    id: 'wacc',
    title: 'WACC (Weighted Average Cost of Capital)',
    oneLiner: '자본 조달의 가중평균 비용 = DCF 할인율의 정석.',
    body: '자기자본 비용과 타인자본 비용을 비중으로 가중평균. 메이커/스타트업은 부채가 적어 사실상 자기자본 비용(요구수익률)에 가깝다. 본 도구는 초기 단계 메이커를 위해 15% 기본값을 사용한다.',
    formula: 'WACC = (E/V) × Re + (D/V) × Rd × (1 − T)',
    example: '자본 100% 자기자본 + 요구수익률 15% → WACC = 15%.',
    cite: '재무_기업가치 §2 Valuation',
  },
  {
    id: 'multiple',
    title: 'Multiple (배수 평가)',
    oneLiner: '비슷한 회사가 ARR의 몇 배에 거래되는지 → 내 배수 추정.',
    body: '동종업계의 거래/상장 배수(EV/Revenue, EV/EBITDA 등)를 내 회사에 적용. 빠르고 직관적이지만 비교군 선택이 결정적. 본 도구는 카테고리별 베이스라인에 성장률 가산(+) · 이탈률 감산(−)을 적용한다.',
    formula: 'EV ≈ ARR × (Base × (1 + growth_uplift) × (1 − churn_penalty))',
    example: 'SaaS 베이스 6× × (1 + 0.4) × (1 − 0.16) ≈ 7×. ARR 12억 × 7 = 84억.',
    cite: '재무_기업가치 §3 Valuation Workshop',
  },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <BookOpen className="size-3.5 text-indigo-500" />
          5분 정복 · 6개 개념
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">기업가치 평가의 뼈대</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          서강대 이석근 교수의 「재무 (기업가치 평가를 중심으로)」와 「재무 101」 핸드아웃을 바탕으로, 비전공
          메이커가 5분 안에 익혀야 할 6개 개념만 추렸습니다. 인용 출처는 각 카드 하단에 표기.
        </p>
      </div>

      <div className="space-y-5">
        {CONCEPTS.map((c) => (
          <article
            key={c.id}
            id={c.id}
            className="scroll-mt-24 rounded-2xl border bg-card p-6"
          >
            <h2 className="text-lg font-bold">{c.title}</h2>
            <p className="mt-1 text-sm font-medium text-indigo-500">{c.oneLiner}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            {c.formula ? (
              <div className="mt-4 rounded-lg border bg-zinc-950 px-4 py-3 font-mono text-xs text-zinc-100">
                {c.formula}
              </div>
            ) : null}
            <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">예시.</strong> {c.example}
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-wide text-muted-foreground/70">자료: {c.cite}</div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between rounded-2xl border bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-6">
        <div>
          <h3 className="font-bold">개념을 내 숫자에 바로 적용</h3>
          <p className="mt-1 text-sm text-muted-foreground">자가평가에서 NPV / DCF / Multiple이 자동 계산됩니다.</p>
        </div>
        <Link
          href="/finance/valuate"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          평가하기
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

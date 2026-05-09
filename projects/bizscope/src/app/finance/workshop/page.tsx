import Link from 'next/link';
import { ArrowRight, Beaker, Building2 } from 'lucide-react';

export const metadata = {
  title: '워크샵 — Maker Finance',
  description: '비상장사(서강사)와 상장사(이마트) 케이스로 DCF 5단계를 직접 적용해보는 인터랙티브 워크샵.',
};

const WORKSHOPS = [
  {
    href: '/finance/workshop/sgsa',
    icon: Beaker,
    name: '서강사 워크샵',
    sub: '비상장사 · 주식수 100만주',
    body: '강의 슬라이드 18~22번을 그대로 따라가며, WACC → FCF → Terminal Value → 기업가치(883.6억) 단계별 산출.',
    source: '재무_기업가치 · slide 18~22',
  },
  {
    href: '/finance/workshop/emart',
    icon: Building2,
    name: '이마트 워크샵',
    sub: '상장사 · 코스피 60위',
    body: 'FY2020 실적 기반 FCF 추정, WACC 2.64% 산출, Growing Perpetuity Terminal Value, 최종 4조 4,551억 도출 흐름.',
    source: '재무_기업가치 · slide 23~26',
  },
];

export default function WorkshopIndex() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Valuation Workshop</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          학습한 5단계 DCF 프로세스를 두 케이스에 적용한다. 첫째는 가상의 비상장사(서강사) — 슬라이드 18~22번 그대로. 둘째는
          이마트 — 슬라이드 23~26번. 각 단계가 별도 페이지가 아닌 하나의 흐름으로 이어져 있어 입력 변경의 누적 효과를
          관찰할 수 있다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {WORKSHOPS.map((w) => {
          const Icon = w.icon;
          return (
            <Link
              key={w.href}
              href={w.href}
              className="group rounded-2xl border bg-card p-6 transition hover:border-indigo-500/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Icon className="size-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold">{w.name}</h2>
                  <div className="text-xs text-muted-foreground">{w.sub}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{w.source}</span>
                <ArrowRight className="size-4 text-indigo-500 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

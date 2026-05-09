import Link from 'next/link';
import { ArrowRight, Calculator, GraduationCap, ListOrdered, Sparkles, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Maker Finance — 내 앱 가치, 숫자로 증빙',
  description: 'AI로 빠르게 만드는 시대. 당신의 앱·SaaS·콘텐츠의 재무적 가치를 정량적으로 증빙하세요.',
};

const PILLARS = [
  {
    href: '/finance/valuate',
    icon: Calculator,
    title: '자가평가',
    body: 'MAU·MRR·이탈률만 입력하면 DCF + Multiple 두 방식으로 가치를 자동 산출합니다.',
    cta: '내 앱 평가하기',
  },
  {
    href: '/finance/ranking',
    icon: ListOrdered,
    title: '벤치마크',
    body: '비슷한 카테고리 사례와 비교해 내 위치를 확인합니다. 공유 가능한 증빙 카드 포함.',
    cta: '벤치마크 보기',
  },
  {
    href: '/finance/learn',
    icon: GraduationCap,
    title: '핵심 개념',
    body: 'NPV / IRR / DCF / WACC / Multiple — 비전공자도 한 화면에 이해하는 핵심.',
    cta: '5분 정복',
  },
  {
    href: '/finance/playbook',
    icon: TrendingUp,
    title: '가치 증대 플레이북',
    body: '같은 매출이라도 가치가 3배 차이 나는 이유. 메이커가 당장 적용할 7가지 레버.',
    cta: '레버 보기',
  },
];

export default function FinanceLanding() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-indigo-500" />
          AI 메이커를 위한 재무 도구
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          만들기는 빨라졌다.
          <br />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            증빙은 어떻게 할 건가?
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          누구나 앱·SaaS·AI 에이전트를 만드는 시대. &ldquo;재밌어요&rdquo;는 이제 차별화가 아닙니다. 당신이 만든 것의
          가치를 <strong className="text-foreground">DCF · Multiple · 단위경제</strong>로 정량 증빙하세요.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/finance/valuate"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            지금 평가받기
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/finance/learn"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            먼저 5분 학습
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-4 sm:grid-cols-2">
        {PILLARS.map(({ href, icon: Icon, title, body, cta }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border bg-card p-6 transition hover:border-indigo-500/40 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <Icon className="size-5 text-indigo-500" />
              </div>
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-500">
              {cta}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-20 rounded-2xl border bg-muted/30 p-8 text-sm leading-relaxed text-muted-foreground">
        <h3 className="mb-3 text-base font-bold text-foreground">왜 이 도구인가?</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          <li>• 모든 계산은 브라우저에서만 — 입력값은 서버로 전송되지 않습니다.</li>
          <li>• 인증·결제 없이 무료로 사용. 어뷰징·비용 폭증 위험 없음.</li>
          <li>• PPT 강의자료가 아닌 실전 입력(MAU·MRR·Churn) 기반 평가.</li>
          <li>• 결과는 단일 숫자가 아닌 신뢰 구간(low/mid/high)으로 제시.</li>
        </ul>
      </section>
    </div>
  );
}

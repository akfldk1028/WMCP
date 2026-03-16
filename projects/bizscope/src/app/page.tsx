import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, Shield, Target } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { NumberTicker } from '@/components/ui/number-ticker';

const FRAMEWORKS = [
  {
    icon: BarChart3,
    name: 'PEST + 5 Forces',
    sections: '1-3',
    desc: '정치·경제·사회·기술 외부 환경 분석과 산업 경쟁 강도 평가',
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    icon: Shield,
    name: 'SWOT + TOWS',
    sections: '4-6',
    desc: '강점/약점/기회/위협 종합 및 교차 매트릭스 전략 도출',
    gradient: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    icon: Brain,
    name: '7S + 우선순위',
    sections: '7-9',
    desc: '맥킨지 7S 조직 정렬 진단 및 실행 우선순위 매트릭스',
    gradient: 'from-violet-500/10 to-purple-500/10',
  },
  {
    icon: Target,
    name: '경쟁사 비교 + 시사점',
    sections: '10-12',
    desc: '경쟁 포지셔닝 분석, 현행 전략 대비 및 실행 로드맵',
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
];

const STATS = [
  { value: 12, label: '분석 프레임워크', suffix: '개' },
  { value: 4, label: 'AI 프로바이더', suffix: '개' },
  { value: 50, label: '전략 도출 항목', suffix: '+' },
  { value: 3, label: '보고서 생성 시간', suffix: '분' },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/logo.png" alt="BS" className="h-9 w-auto" />
            BizScope
          </span>
          <Link
            href="/history"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            분석 기록
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-32">
          <div className="flex flex-col items-center text-center">
            <BlurFade delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Claude · GPT-4o · Grok · Gemini 지원
              </div>
            </BlurFade>

            <BlurFade delay={0.1}>
              <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                AI가 생성하는{' '}
                <AnimatedGradientText
                  colorFrom="#6366f1"
                  colorTo="#a855f7"
                  speed={1.5}
                  className="text-4xl font-extrabold sm:text-5xl md:text-6xl"
                >
                  컨설팅급 전략 보고서
                </AnimatedGradientText>
              </h1>
            </BlurFade>

            <BlurFade delay={0.2}>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                12가지 프레임워크로 기업의 외부 환경, 내부 역량, 경쟁 구도를 분석하고
                <br className="hidden sm:inline" />
                실행 가능한 전략을 자동으로 도출합니다.
              </p>
            </BlurFade>

            <BlurFade delay={0.3}>
              <Link
                href="/report/new"
                className="mt-10 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl"
              >
                분석 시작하기
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </BlurFade>

            {/* Stats */}
            <BlurFade delay={0.4}>
              <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold tabular-nums sm:text-4xl">
                      <NumberTicker value={stat.value} delay={0.5} />
                      <span className="text-muted-foreground">{stat.suffix}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                12개 분석 프레임워크
              </h2>
              <p className="mt-3 text-muted-foreground">
                맥킨지·BCG·HBR에서 사용하는 전략 프레임워크를 AI가 자동 적용
              </p>
            </div>
          </BlurFade>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FRAMEWORKS.map((fw, i) => (
              <BlurFade key={fw.name} delay={0.1 + i * 0.1} inView>
                <div className={`group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br ${fw.gradient}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                      <fw.icon className="size-5 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{fw.name}</h3>
                        <span className="rounded-md bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
                          섹션 {fw.sections}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {fw.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <BlurFade delay={0.1} inView>
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              지금 바로 시작하세요
            </h2>
            <p className="mt-3 text-muted-foreground">
              기업명만 입력하면 3분 안에 전략 보고서가 완성됩니다.
            </p>
            <Link
              href="/report/new"
              className="mt-8 inline-flex h-12 items-center rounded-lg bg-foreground px-8 text-base font-semibold text-background transition hover:bg-foreground/90"
            >
              무료 분석 시작
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        BizScope &copy; {new Date().getFullYear()} &middot; Powered by AI
      </footer>
    </div>
  );
}

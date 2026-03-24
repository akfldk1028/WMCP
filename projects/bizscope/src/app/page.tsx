import Link from 'next/link';
import { headers } from 'next/headers';
import { ArrowRight, BarChart3, Brain, DollarSign, Gauge, Lightbulb, Search, Shield, Target } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { NumberTicker } from '@/components/ui/number-ticker';
import { getMessages, detectLocale } from '@/i18n';
import LocaleSwitcher from '@/components/LocaleSwitcher';

const COMPANY_ICONS = [BarChart3, Shield, Brain, Target];
const COMPANY_GRADIENTS = [
  'from-blue-500/10 to-cyan-500/10',
  'from-emerald-500/10 to-teal-500/10',
  'from-violet-500/10 to-purple-500/10',
  'from-amber-500/10 to-orange-500/10',
];

const IDEA_ICONS = [Lightbulb, Search, DollarSign, Gauge];
const IDEA_GRADIENTS = [
  'from-rose-500/10 to-pink-500/10',
  'from-sky-500/10 to-blue-500/10',
  'from-lime-500/10 to-green-500/10',
  'from-red-500/10 to-orange-500/10',
];

export default async function LandingPage() {
  const hdrs = await headers();
  const locale = detectLocale(null, hdrs.get('accept-language'), hdrs.get('cookie'));
  const { ui } = getMessages(locale);
  const { landing, frameworks, stats, nav } = ui;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/logo.png" alt="BS" className="h-9 w-auto" />
            {ui.appName}
          </span>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {nav.pricing}
            </Link>
            <Link href="/history" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {nav.history}
            </Link>
            <LocaleSwitcher />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
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
                {landing.badge}
              </div>
            </BlurFade>

            <BlurFade delay={0.1}>
              <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                {landing.heroTitle}
                <AnimatedGradientText colorFrom="#6366f1" colorTo="#a855f7" speed={1.5} className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
                  {landing.heroHighlight}
                </AnimatedGradientText>
              </h1>
            </BlurFade>

            <BlurFade delay={0.2}>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                {landing.heroSubtitle.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br className="hidden sm:inline" />}</span>
                ))}
              </p>
            </BlurFade>

            <BlurFade delay={0.3}>
              <Link href="/report/new" className="mt-10 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl">
                {landing.heroCta}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
                {stats.map((stat) => (
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

      {/* Company Frameworks */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{landing.companyFrameworksTitle}</h2>
              <p className="mt-3 text-muted-foreground">{landing.companyFrameworksSubtitle}</p>
            </div>
          </BlurFade>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {frameworks.company.map((fw, i) => {
              const Icon = COMPANY_ICONS[i];
              return (
                <BlurFade key={fw.name} delay={0.1 + i * 0.1} inView>
                  <div className={`group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br ${COMPANY_GRADIENTS[i]}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                        <Icon className="size-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{fw.name}</h3>
                          <span className="rounded-md bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">{fw.sections}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{fw.desc}</p>
                      </div>
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section>

      {/* Idea Frameworks */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{landing.ideaFrameworksTitle}</h2>
              <p className="mt-3 text-muted-foreground">{landing.ideaFrameworksSubtitle}</p>
            </div>
          </BlurFade>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {frameworks.idea.map((fw, i) => {
              const Icon = IDEA_ICONS[i];
              return (
                <BlurFade key={fw.name} delay={0.1 + i * 0.1} inView>
                  <div className={`group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br ${IDEA_GRADIENTS[i]}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                        <Icon className="size-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{fw.name}</h3>
                          <span className="rounded-md bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">{fw.sections}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{fw.desc}</p>
                      </div>
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scorecard */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{landing.scorecardTitle}</h2>
              <p className="mt-3 text-muted-foreground">{landing.scorecardSubtitle}</p>
            </div>
          </BlurFade>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-3">
            {frameworks.scorecardDimensions.map((dim, i) => (
              <BlurFade key={dim} delay={0.05 + i * 0.05} inView>
                <div className="rounded-lg border bg-card px-4 py-3 text-center transition-colors hover:bg-accent">
                  <p className="text-sm font-medium">{dim}</p>
                  <p className="mt-1 text-xs text-muted-foreground">1-10</p>
                </div>
              </BlurFade>
            ))}
          </div>
          <BlurFade delay={0.6} inView>
            <div className="mt-8 rounded-xl border bg-card p-6 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-600">{ui.verdicts.strongGo}</span>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 font-medium text-blue-600">{ui.verdicts.go}</span>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 font-medium text-amber-600">{ui.verdicts.conditional}</span>
                <span className="rounded-full bg-red-500/10 px-3 py-1 font-medium text-red-600">{ui.verdicts.noGo}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{landing.scorecardNote}</p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <BlurFade delay={0.1} inView>
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{landing.ctaTitle}</h2>
            <p className="mt-3 text-muted-foreground">
              {landing.ctaSubtitle}
              <br />
              <span className="text-xs">{landing.ctaPricing}</span>
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/report/new" className="inline-flex h-12 items-center rounded-lg bg-foreground px-8 text-base font-semibold text-background transition hover:bg-foreground/90">
                {landing.ctaButton}
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="/pricing" className="inline-flex h-12 items-center rounded-lg border px-6 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:border-foreground/30">
                {landing.ctaPricingLink}
              </Link>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        {ui.appName} &copy; {new Date().getFullYear()} &middot; {landing.footer}
      </footer>
    </div>
  );
}

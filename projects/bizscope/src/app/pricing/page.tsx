'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { getLicenseKey, setLicenseKey } from '@/lib/license-client';
import { useLocale } from '@/i18n';
import LocaleSwitcher from '@/components/LocaleSwitcher';

const CHECKOUT_URLS = {
  perReport: 'https://clickaround.lemonsqueezy.com/checkout/buy/f9a4d916-d88b-4636-9117-51e501f0853c',
  proMonthly: 'https://clickaround.lemonsqueezy.com/checkout/buy/b09a8984-e55e-4aa3-9537-4ecc66d22933',
  proAnnual: 'https://clickaround.lemonsqueezy.com/checkout/buy/b6ab7191-2259-4e20-892a-ef4d04321dd1',
};

export default function PricingPage() {
  const { t } = useLocale();
  const { ui } = t;
  const p = ui.pricing;

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [keyInput, setKeyInput] = useState('');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [keyInfo, setKeyInfo] = useState<{ plan: string; credits: number } | null>(null);

  const existingKey = typeof window !== 'undefined' ? getLicenseKey() : null;

  async function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setKeyStatus('checking');
    try {
      const res = await fetch('/api/license/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: keyInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setLicenseKey(keyInput.trim());
        setKeyStatus('valid');
        setKeyInfo({ plan: data.plan, credits: data.credits });
      } else {
        setKeyStatus('invalid');
      }
    } catch {
      setKeyStatus('invalid');
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/logo.png" alt="BS" className="h-9 w-auto" />
            {ui.appName}
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/report/new" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {p.startAnalysis}
            </Link>
            <Link href="/history" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {ui.nav.history}
            </Link>
            <LocaleSwitcher />
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{p.title}</h1>
            <p className="mt-3 text-muted-foreground">{p.subtitle}</p>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl border bg-muted/50 p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  billing === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.monthly}
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  billing === 'annual'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.annual} <span className="text-xs text-emerald-600">{p.annualDiscount}</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border bg-card p-8">
              <h3 className="text-lg font-semibold">{p.freePlan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.freePlan.desc}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">$0</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                {p.freePlan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 ${i === p.freePlan.features.length - 1 ? 'text-muted-foreground' : ''}`}>
                    <Check className={`mt-0.5 size-4 shrink-0 ${i === p.freePlan.features.length - 1 ? 'opacity-30' : 'text-emerald-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/report/new"
                className="mt-8 flex w-full items-center justify-center rounded-lg border px-6 py-2.5 text-sm font-semibold transition hover:bg-accent"
              >
                {p.freePlan.cta}
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-indigo-500 bg-card p-8">
              <div className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                {p.proPlan.badge}
              </div>
              <h3 className="text-lg font-semibold">{p.proPlan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.proPlan.desc}</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">
                  ${billing === 'annual' ? '19' : '29'}
                </span>
                <span className="text-muted-foreground">{p.proPlan.perMonth}</span>
                {billing === 'annual' && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">$29{p.proPlan.perMonth}</span>
                )}
              </div>
              {billing === 'annual' && (
                <p className="mt-1 text-xs text-muted-foreground">{p.proPlan.billedAnnually('228')}</p>
              )}
              <ul className="mt-8 space-y-3 text-sm">
                {p.proPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-indigo-500" />
                    <span dangerouslySetInnerHTML={{ __html: f.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>
              <a
                href={billing === 'annual' ? CHECKOUT_URLS.proAnnual : CHECKOUT_URLS.proMonthly}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Zap className="size-4" />
                {p.proPlan.cta}
              </a>
            </div>
          </div>

          {/* Per-report option */}
          <div className="mt-8 rounded-xl border bg-card p-6 text-center">
            <h3 className="font-semibold">{p.perReport.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.perReport.desc}</p>
            <a
              href={CHECKOUT_URLS.perReport}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-5 py-2 text-sm font-medium transition hover:bg-accent"
            >
              {p.perReport.cta}
              <ArrowRight className="size-3.5" />
            </a>
          </div>

          {/* License key input */}
          <div className="mt-12 rounded-xl border bg-muted/30 p-6">
            <h3 className="font-semibold">{p.licenseSection.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {p.licenseSection.desc}
              {existingKey && (
                <span className="ml-1 text-emerald-600">
                  ({p.licenseSection.currentKey}: {existingKey.slice(0, 12)}...)
                </span>
              )}
            </p>
            <form onSubmit={handleKeySubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setKeyStatus('idle'); }}
                placeholder="bsai_..."
                className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={keyStatus === 'checking' || !keyInput.trim()}
                className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/90 disabled:opacity-50"
              >
                {keyStatus === 'checking' ? ui.license.checking : ui.license.confirm}
              </button>
            </form>
            {keyStatus === 'valid' && keyInfo && (
              <p className="mt-2 text-sm text-emerald-600">
                {p.licenseSection.validKey(keyInfo.plan, keyInfo.credits)}
              </p>
            )}
            {keyStatus === 'invalid' && (
              <p className="mt-2 text-sm text-destructive">{p.licenseSection.invalidKey}</p>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        {ui.appName} &copy; {new Date().getFullYear()} &middot; {ui.landing.footer}
      </footer>
    </div>
  );
}

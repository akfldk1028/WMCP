'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { getLicenseKey, setLicenseKey } from '@/lib/license-client';

const CHECKOUT_URLS = {
  perReport: 'https://clickaround.lemonsqueezy.com/checkout/buy/f9a4d916-d88b-4636-9117-51e501f0853c',
  proMonthly: 'https://clickaround.lemonsqueezy.com/checkout/buy/b09a8984-e55e-4aa3-9537-4ecc66d22933',
  proAnnual: 'https://clickaround.lemonsqueezy.com/checkout/buy/b6ab7191-2259-4e20-892a-ef4d04321dd1',
};

export default function PricingPage() {
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
            BizScope AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/report/new" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              분석 시작
            </Link>
            <Link href="/history" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              분석 기록
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">가격 정책</h1>
            <p className="mt-3 text-muted-foreground">
              무료로 시작하고, 필요할 때 업그레이드하세요
            </p>
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
                월간
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  billing === 'annual'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                연간 <span className="text-xs text-emerald-600">34% 할인</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border bg-card p-8">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-1 text-sm text-muted-foreground">빠르게 체험해보세요</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">$0</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  보고서 2건 무료 생성
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  기업 분석 12개 프레임워크
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  아이디어 분석 8개 프레임워크
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 opacity-30" />
                  <span>단일 AI 모델 (앙상블 미지원)</span>
                </li>
              </ul>
              <Link
                href="/report/new"
                className="mt-8 flex w-full items-center justify-center rounded-lg border px-6 py-2.5 text-sm font-semibold transition hover:bg-accent"
              >
                무료로 시작
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-indigo-500 bg-card p-8">
              <div className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                추천
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">무제한 분석 + 앙상블</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">
                  ${billing === 'annual' ? '19' : '29'}
                </span>
                <span className="text-muted-foreground">/월</span>
                {billing === 'annual' && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">$29/월</span>
                )}
              </div>
              {billing === 'annual' && (
                <p className="mt-1 text-xs text-muted-foreground">연 $228 결제</p>
              )}
              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-indigo-500" />
                  <strong>무제한</strong> 보고서 생성
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-indigo-500" />
                  기업 분석 12개 + 아이디어 8개 프레임워크
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-indigo-500" />
                  <span><strong>멀티모델 앙상블</strong> (4개 AI 교차검증)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-indigo-500" />
                  9차원 스코어카드 (앙상블 전용)
                </li>
              </ul>
              <a
                href={billing === 'annual' ? CHECKOUT_URLS.proAnnual : CHECKOUT_URLS.proMonthly}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Zap className="size-4" />
                Pro 시작하기
              </a>
            </div>
          </div>

          {/* Per-report option */}
          <div className="mt-8 rounded-xl border bg-card p-6 text-center">
            <h3 className="font-semibold">건당 구매</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              구독 없이 필요할 때만 — <strong>$5/건</strong> (단일 모델)
            </p>
            <a
              href={CHECKOUT_URLS.perReport}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-5 py-2 text-sm font-medium transition hover:bg-accent"
            >
              1건 구매하기
              <ArrowRight className="size-3.5" />
            </a>
          </div>

          {/* License key input */}
          <div className="mt-12 rounded-xl border bg-muted/30 p-6">
            <h3 className="font-semibold">라이선스 키 입력</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              구매 후 이메일로 받은 라이선스 키를 입력하세요.
              {existingKey && (
                <span className="ml-1 text-emerald-600">
                  (현재 키: {existingKey.slice(0, 12)}...)
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
                {keyStatus === 'checking' ? '확인 중...' : '확인'}
              </button>
            </form>
            {keyStatus === 'valid' && keyInfo && (
              <p className="mt-2 text-sm text-emerald-600">
                유효한 키입니다 — {keyInfo.plan === 'pro' ? 'Pro (무제한)' : `${keyInfo.credits}건 남음`}
              </p>
            )}
            {keyStatus === 'invalid' && (
              <p className="mt-2 text-sm text-destructive">
                유효하지 않은 키입니다. 다시 확인해주세요.
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        BizScope AI &copy; {new Date().getFullYear()} &middot; Powered by AI
      </footer>
    </div>
  );
}

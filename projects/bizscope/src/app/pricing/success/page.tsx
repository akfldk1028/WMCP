'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Copy, Loader2, Key, ArrowRight } from 'lucide-react';
import { setLicenseKey } from '@/lib/license-client';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const session = searchParams.get('session');

  const [status, setStatus] = useState<'polling' | 'complete' | 'timeout' | 'error'>('polling');
  const [licenseKey, setKey] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollCount = useRef(0);

  useEffect(() => {
    if (!session) {
      setStatus('error');
      return;
    }

    const interval = setInterval(async () => {
      pollCount.current++;

      // Timeout after 30 polls (60 seconds)
      if (pollCount.current > 30) {
        clearInterval(interval);
        setStatus('timeout');
        return;
      }

      try {
        const res = await fetch('/api/checkout/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session }),
        });
        const data = await res.json();

        if (data.status === 'complete' && data.licenseKey) {
          clearInterval(interval);
          setKey(data.licenseKey);
          setPlan(data.plan);
          setStatus('complete');
          // Auto-save to localStorage
          setLicenseKey(data.licenseKey);
        }
      } catch {
        // Keep polling on network errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [session]);

  async function handleCopy() {
    if (!licenseKey) return;
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {status === 'polling' && (
          <>
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Loader2 className="size-8 animate-spin text-indigo-500" />
            </div>
            <h1 className="text-2xl font-bold">결제가 완료되었습니다!</h1>
            <p className="mt-3 text-muted-foreground">
              API 키를 생성하고 있습니다... 잠시만 기다려주세요.
            </p>
          </>
        )}

        {status === 'complete' && licenseKey && (
          <>
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Key className="size-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold">API 키가 준비되었습니다!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan === 'pro' ? 'Pro 무제한' : '크레딧'} 플랜이 활성화되었습니다.
              이 키를 안전하게 보관하세요.
            </p>

            {/* Key display */}
            <div className="mt-6 rounded-xl border bg-muted/30 p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Your API Key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-background px-3 py-2.5 text-left font-mono text-sm break-all">
                  {licenseKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg border transition hover:bg-muted"
                >
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                <Check className="size-3.5" />
                자동으로 브라우저에 저장되었습니다
              </p>
            </div>

            {/* Usage instructions */}
            <div className="mt-6 space-y-3 text-left">
              <h3 className="text-sm font-semibold">사용 방법</h3>
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5 text-xs">
                <p className="font-medium">웹앱</p>
                <p className="text-muted-foreground">이미 저장됨 — 바로 분석을 시작하세요</p>
              </div>
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5 text-xs">
                <p className="font-medium">Claude Code (MCP)</p>
                <code className="mt-1 block text-[10px] text-muted-foreground break-all">
                  claude mcp add bizscope --transport http --header &quot;Authorization:Bearer {licenseKey.slice(0, 12)}...&quot; https://bizscope-rho.vercel.app/api/mcp
                </code>
              </div>
              <div className="rounded-lg border bg-muted/20 px-3 py-2.5 text-xs">
                <p className="font-medium">REST API</p>
                <code className="mt-1 block text-[10px] text-muted-foreground">
                  Authorization: Bearer {licenseKey.slice(0, 12)}...
                </code>
              </div>
            </div>

            <Link
              href="/report/new"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              분석 시작하기 <ArrowRight className="size-4" />
            </Link>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10">
              <Key className="size-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold">키 생성이 지연되고 있습니다</h1>
            <p className="mt-3 text-muted-foreground">
              결제는 완료되��습니다. 키 생성에 시간이 걸리고 있습니다.
              아래에서 결제 이메일로 키를 조회할 수 있습니다.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              가격 페이지에서 키 찾기
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold">잘못된 접근입니다</h1>
            <p className="mt-3 text-muted-foreground">
              유효한 체크아웃 세션이 없습니다.
            </p>
            <Link href="/pricing" className="mt-4 text-sm text-indigo-600 underline">
              가격 페이지로 이동
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

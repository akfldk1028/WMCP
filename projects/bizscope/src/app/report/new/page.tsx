'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Loader2, Building2, Lightbulb, FileText, Type, Settings, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ReportViewer from '@/components/report/ReportViewer';
import { useGeneration } from '@/hooks/useGeneration';
import type { ReportMode, IdeaInput } from '@/frameworks/types';
import { getLicenseKey, setLicenseKey, removeLicenseKey, getFreeRemaining } from '@/lib/license-client';
import { useLocale } from '@/i18n';
import LocaleSwitcher from '@/components/LocaleSwitcher';

// SSR disabled — @base-ui/react Popover generates random IDs that cause hydration mismatch
const CompanyInput = dynamic(() => import('@/components/ui/CompanyInput'), {
  ssr: false,
  loading: () => <div className="h-12 w-full max-w-xl animate-pulse rounded-lg bg-muted" />,
});

/** Reads URL search params and auto-starts analysis from Chrome extension deep-links */
function DeepLinkHandler({ setMode, setIdeaName, setIdeaDescription, startGeneration, router }: {
  setMode: (m: ReportMode) => void;
  setIdeaName: (s: string) => void;
  setIdeaDescription: (s: string) => void;
  startGeneration: (name: string, mode: ReportMode, idea?: IdeaInput) => Promise<{ id: string } | null>;
  router: ReturnType<typeof useRouter>;
}) {
  const searchParams = useSearchParams();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    const paramMode = searchParams.get('mode');
    const company = searchParams.get('company');
    const idea = searchParams.get('idea');
    const desc = searchParams.get('desc');
    const autostart = searchParams.get('autostart');

    if (paramMode === 'idea' && idea) {
      setMode('idea');
      setIdeaName(idea);
      if (desc) setIdeaDescription(desc);
      if (autostart === '1') {
        done.current = true;
        startGeneration(idea, 'idea', { name: idea, description: desc || idea }).then((r) => {
          if (r) router.push(`/report/${r.id}`);
        });
      }
    } else if (company) {
      setMode('company');
      if (autostart === '1') {
        done.current = true;
        startGeneration(company, 'company').then((r) => {
          if (r) router.push(`/report/${r.id}`);
        });
      }
    }
  }, [searchParams]);
  return null;
}

export default function NewReportPage() {
  const router = useRouter();
  const { report, isGenerating, error, startGeneration, progress } = useGeneration();
  const { t } = useLocale();
  const { ui } = t;
  const [mode, setMode] = useState<ReportMode>('company');

  // Idea input state
  const [ideaName, setIdeaName] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaTarget, setIdeaTarget] = useState('');
  const [ideaDocument, setIdeaDocument] = useState('');
  const [inputMode, setInputMode] = useState<'simple' | 'doc'>('simple');

  // License key state
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [licenseInfo, setLicenseInfo] = useState<{ plan: string; credits: number } | null>(null);

  const currentKey = typeof window !== 'undefined' ? getLicenseKey() : null;
  const freeRemaining = typeof window !== 'undefined' ? getFreeRemaining() : 2;

  async function handleLicenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!licenseInput.trim()) return;
    setLicenseStatus('checking');
    try {
      const res = await fetch('/api/license/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setLicenseKey(licenseInput.trim());
        setLicenseStatus('valid');
        setLicenseInfo({ plan: data.plan, credits: data.credits });
        setShowLicenseDialog(false);
      } else {
        setLicenseStatus('invalid');
      }
    } catch {
      setLicenseStatus('invalid');
    }
  }

  async function handleCompanySubmit(companyName: string) {
    const result = await startGeneration(companyName, 'company');
    if (result) {
      router.push(`/report/${result.id}`);
    }
  }

  async function handleIdeaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ideaName.trim()) return;
    if (inputMode === 'simple' && !ideaDescription.trim()) return;
    if (inputMode === 'doc' && !ideaDocument.trim()) return;

    const ideaInput: IdeaInput = {
      name: ideaName.trim(),
      description: inputMode === 'doc'
        ? `${ui.reportNew.documentAttached} ${ideaDocument.trim().slice(0, 200)}`
        : ideaDescription.trim(),
      targetMarket: ideaTarget.trim() || undefined,
      document: inputMode === 'doc' ? ideaDocument.trim() : undefined,
    };

    const result = await startGeneration(ideaName.trim(), 'idea', ideaInput);
    if (result) {
      router.push(`/report/${result.id}`);
    }
  }

  // Once generation starts, show PPT viewer with live progress
  if (report && (isGenerating || report.status !== 'draft')) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Top progress bar */}
        <div className="border-b bg-background px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
                <img src="/logo.png" alt="BS" className="h-9 w-auto" />
                {ui.appName}
              </span>
              {isGenerating && (
                <Badge variant="secondary" className="gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  {ui.report.progressLabel(progress.completed, progress.total)}
                </Badge>
              )}
              {!isGenerating && report.status === 'completed' && (
                <Badge>{ui.report.completed}</Badge>
              )}
              {!isGenerating && report.status === 'error' && (
                <Badge variant="destructive">{ui.report.error}</Badge>
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{report.companyName}</span>
          </div>
          {isGenerating && (
            <div className="mx-auto mt-2 max-w-5xl">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <ReportViewer report={report} />
        </div>
      </div>
    );
  }

  // Initial state: mode selection + input
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <DeepLinkHandler
          setMode={setMode}
          setIdeaName={setIdeaName}
          setIdeaDescription={setIdeaDescription}
          startGeneration={startGeneration}
          router={router}
        />
      </Suspense>
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <img src="/logo.png" alt="BS" className="h-9 w-auto" />
            {ui.appName}
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition hover:text-primary">
              {ui.nav.pricing}
            </Link>
            <Link href="/history" className="text-sm font-medium text-muted-foreground transition hover:text-primary">
              {ui.nav.history}
            </Link>
            <LocaleSwitcher />
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-2xl text-center">
          {/* License / credits bar */}
          <div className="mb-6 flex items-center justify-center gap-3 text-sm">
            {currentKey ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-emerald-500/10 px-3 py-1 text-emerald-600">
                <CreditCard className="size-3.5" />
                {licenseInfo?.plan === 'pro' || currentKey
                  ? (licenseInfo?.plan === 'pro' ? ui.license.proUnlimited : ui.license.creditsRemaining(licenseInfo?.credits ?? '?'))
                  : ui.license.keyActivated}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-muted-foreground">
                {ui.license.freeRemaining(freeRemaining)}
              </span>
            )}
            <button
              onClick={() => setShowLicenseDialog(!showLicenseDialog)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Settings className="size-3.5" />
              {currentKey ? ui.license.changeKey : ui.license.enterKey}
            </button>
          </div>

          {/* License key dialog */}
          {showLicenseDialog && (
            <div className="mb-6 rounded-xl border bg-muted/30 p-4 text-left">
              <form onSubmit={handleLicenseSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => { setLicenseInput(e.target.value); setLicenseStatus('idle'); }}
                  placeholder="bsai_..."
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  disabled={licenseStatus === 'checking' || !licenseInput.trim()}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90 disabled:opacity-50"
                >
                  {licenseStatus === 'checking' ? ui.license.checking : ui.license.confirm}
                </button>
                {currentKey && (
                  <button
                    type="button"
                    onClick={() => { removeLicenseKey(); setShowLicenseDialog(false); setLicenseInfo(null); }}
                    className="rounded-lg border px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                  >
                    {ui.license.remove}
                  </button>
                )}
              </form>
              {licenseStatus === 'invalid' && (
                <p className="mt-2 text-xs text-destructive">{ui.license.invalidKey}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {ui.license.noKey}
                <Link href="/pricing" className="text-indigo-600 underline">{ui.nav.pricing}</Link>{ui.license.buyLink}
              </p>
            </div>
          )}

          {/* Mode toggle */}
          <div className="mx-auto mb-8 inline-flex rounded-xl border bg-muted/50 p-1">
            <button
              onClick={() => setMode('company')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                mode === 'company'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="size-4" />
              {ui.reportNew.companyMode}
            </button>
            <button
              onClick={() => setMode('idea')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                mode === 'idea'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Lightbulb className="size-4" />
              {ui.reportNew.ideaMode}
            </button>
          </div>

          {mode === 'company' ? (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">{ui.reportNew.companyTitle}</h1>
              <p className="mt-3 text-base text-muted-foreground">
                {ui.reportNew.companySubtitle}
              </p>

              <div className="mt-8 flex justify-center">
                <CompanyInput onSubmit={handleCompanySubmit} loading={isGenerating} />
              </div>

              {/* Framework preview */}
              <div className="mt-14 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {ui.reportNew.companyChapters.map((fw) => (
                  <Card key={fw.num} size="sm">
                    <CardContent>
                      <div className="text-xs font-bold text-primary">{ui.reportNew.sectionLabel} {fw.num}</div>
                      <div className="mt-1 text-sm font-semibold">{fw.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{fw.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">{ui.reportNew.ideaTitle}</h1>
              <p className="mt-3 text-base text-muted-foreground">
                {ui.reportNew.ideaSubtitle}
              </p>

              <form onSubmit={handleIdeaSubmit} className="mt-8 space-y-4 text-left">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    {ui.reportNew.ideaNameLabel} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={ideaName}
                    onChange={(e) => setIdeaName(e.target.value)}
                    placeholder={ui.reportNew.ideaNamePlaceholder}
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                    data-testid="idea-name"
                  />
                </div>

                {/* Input mode toggle */}
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => setInputMode('simple')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      inputMode === 'simple'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Type className="size-3.5" />
                    {ui.reportNew.inputSimple}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('doc')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      inputMode === 'doc'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid="doc-mode-btn"
                  >
                    <FileText className="size-3.5" />
                    {ui.reportNew.inputDoc}
                  </button>
                </div>

                {inputMode === 'simple' ? (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {ui.reportNew.ideaDescLabel} <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={ideaDescription}
                        onChange={(e) => setIdeaDescription(e.target.value)}
                        placeholder={ui.reportNew.ideaDescPlaceholder}
                        rows={4}
                        className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        required
                        data-testid="idea-description"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {ui.reportNew.ideaTargetLabel}
                      </label>
                      <input
                        type="text"
                        value={ideaTarget}
                        onChange={(e) => setIdeaTarget(e.target.value)}
                        placeholder={ui.reportNew.ideaTargetPlaceholder}
                        className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        data-testid="idea-target"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      {ui.reportNew.ideaDocLabel} <span className="text-destructive">*</span>
                    </label>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {ui.reportNew.ideaDocHint}
                    </p>
                    <textarea
                      value={ideaDocument}
                      onChange={(e) => setIdeaDocument(e.target.value)}
                      placeholder={ui.reportNew.ideaDocTemplatePlaceholder}
                      rows={14}
                      className="w-full resize-y rounded-lg border bg-background px-4 py-3 font-mono text-sm leading-relaxed outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      required
                      data-testid="idea-document"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ideaDocument.length > 0 ? ui.reportNew.charCount(ideaDocument.length.toLocaleString()) : ''}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isGenerating ||
                    !ideaName.trim() ||
                    (inputMode === 'simple' && !ideaDescription.trim()) ||
                    (inputMode === 'doc' && !ideaDocument.trim())
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  data-testid="idea-submit"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {ui.report.analyzing}
                    </>
                  ) : (
                    ui.reportNew.ideaSubmit
                  )}
                </button>
              </form>

              {/* Idea framework preview */}
              <div className="mt-10 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {ui.reportNew.ideaChapters.map((fw) => (
                  <Card key={fw.num} size="sm">
                    <CardContent>
                      <div className="text-xs font-bold text-indigo-600">{ui.reportNew.sectionLabel} {fw.num}</div>
                      <div className="mt-1 text-sm font-semibold">{fw.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{fw.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="mt-6 text-sm text-destructive">
              <p>{error}</p>
              {error.includes('[PRICING]') ? (
                <Link href="/pricing" className="mt-1 inline-block text-indigo-600 underline">
                  {ui.errors.goToPricing}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Loader2, Building2, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ReportViewer from '@/components/report/ReportViewer';
import { useGeneration } from '@/hooks/useGeneration';
import type { ReportMode, IdeaInput } from '@/frameworks/types';

// SSR disabled — @base-ui/react Popover generates random IDs that cause hydration mismatch
const CompanyInput = dynamic(() => import('@/components/ui/CompanyInput'), {
  ssr: false,
  loading: () => <div className="h-12 w-full max-w-xl animate-pulse rounded-lg bg-muted" />,
});

export default function NewReportPage() {
  const router = useRouter();
  const { report, isGenerating, error, startGeneration, progress } = useGeneration();
  const [mode, setMode] = useState<ReportMode>('company');

  // Idea input state
  const [ideaName, setIdeaName] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaTarget, setIdeaTarget] = useState('');

  async function handleCompanySubmit(companyName: string) {
    const result = await startGeneration(companyName, 'company');
    if (result) {
      router.push(`/report/${result.id}`);
    }
  }

  async function handleIdeaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ideaName.trim() || !ideaDescription.trim()) return;

    const ideaInput: IdeaInput = {
      name: ideaName.trim(),
      description: ideaDescription.trim(),
      targetMarket: ideaTarget.trim() || undefined,
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
                BizScope
              </span>
              {isGenerating && (
                <Badge variant="secondary" className="gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  분석 중... {progress.completed}/{progress.total}
                </Badge>
              )}
              {!isGenerating && report.status === 'completed' && (
                <Badge>완료</Badge>
              )}
              {!isGenerating && report.status === 'error' && (
                <Badge variant="destructive">오류</Badge>
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
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <img src="/logo.png" alt="BS" className="h-9 w-auto" />
            BizScope
          </Link>
          <Link href="/history" className="text-sm font-medium text-muted-foreground transition hover:text-primary">
            분석 기록
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-2xl text-center">
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
              기업 분석
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
              아이디어 분석
            </button>
          </div>

          {mode === 'company' ? (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">기업 전략 분석</h1>
              <p className="mt-3 text-base text-muted-foreground">
                NASDAQ / KOSPI 기업을 선택하면 AI가 12개 프레임워크로 보고서를 생성합니다.
              </p>

              <div className="mt-8 flex justify-center">
                <CompanyInput onSubmit={handleCompanySubmit} loading={isGenerating} />
              </div>

              {/* Framework preview */}
              <div className="mt-14 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {[
                  { num: '1-2', label: 'PEST + 5 Forces', desc: '외부 환경' },
                  { num: '3-5', label: 'SWOT 종합', desc: '강점/약점/기회/위협' },
                  { num: '6-9', label: 'TOWS + 전략 우선순위', desc: '교차 전략 도출' },
                  { num: '10-12', label: '현전략 비교 + 시사점', desc: '실행 계획' },
                ].map((fw) => (
                  <Card key={fw.num} size="sm">
                    <CardContent>
                      <div className="text-xs font-bold text-primary">섹션 {fw.num}</div>
                      <div className="mt-1 text-sm font-semibold">{fw.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{fw.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">아이디어 비즈니스 분석</h1>
              <p className="mt-3 text-base text-muted-foreground">
                앱/서비스 아이디어를 입력하면 AI가 비즈니스 타당성을 분석합니다.
              </p>

              <form onSubmit={handleIdeaSubmit} className="mt-8 space-y-4 text-left">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    아이디어 이름 <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={ideaName}
                    onChange={(e) => setIdeaName(e.target.value)}
                    placeholder="예: AI 가격 비교 에이전트"
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    아이디어 설명 <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    placeholder="어떤 문제를 해결하나요? 어떤 기능이 있나요? 누가 사용하나요?"
                    rows={4}
                    className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    타겟 시장 <span className="text-muted-foreground">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={ideaTarget}
                    onChange={(e) => setIdeaTarget(e.target.value)}
                    placeholder="예: 한국 20-30대 온라인 쇼핑 유저"
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !ideaName.trim() || !ideaDescription.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    '비즈니스 타당성 분석 시작'
                  )}
                </button>
              </form>

              {/* Idea framework preview */}
              <div className="mt-10 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {[
                  { num: '1', label: '아이디어 개요', desc: '문제/솔루션 핏' },
                  { num: '2-3', label: '시장 & 경쟁', desc: 'TAM/SAM/SOM + 경쟁사' },
                  { num: '4-5', label: '차별화 & 수익', desc: 'Moat + 비즈니스 모델' },
                  { num: '6-8', label: 'GTM & 실행', desc: '전략 + 리스크 + 판정' },
                ].map((fw) => (
                  <Card key={fw.num} size="sm">
                    <CardContent>
                      <div className="text-xs font-bold text-indigo-600">섹션 {fw.num}</div>
                      <div className="mt-1 text-sm font-semibold">{fw.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{fw.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {error && (
            <p className="mt-6 text-sm text-destructive">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}

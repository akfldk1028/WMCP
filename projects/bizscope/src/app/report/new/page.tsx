'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ReportViewer from '@/components/report/ReportViewer';
import { useGeneration } from '@/hooks/useGeneration';

// SSR disabled — @base-ui/react Popover generates random IDs that cause hydration mismatch
const CompanyInput = dynamic(() => import('@/components/ui/CompanyInput'), {
  ssr: false,
  loading: () => <div className="h-12 w-full max-w-xl animate-pulse rounded-lg bg-muted" />,
});

export default function NewReportPage() {
  const router = useRouter();
  const { report, isGenerating, error, startGeneration, progress } = useGeneration();

  async function handleSubmit(companyName: string) {
    const result = await startGeneration(companyName);
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
                <img src="/logo.png" alt="BS" className="h-4 w-auto" />
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

  // Initial state: company selection
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <img src="/logo.png" alt="BS" className="h-6 w-auto" />
            BizScope
          </Link>
          <Link href="/history" className="text-sm font-medium text-muted-foreground transition hover:text-primary">
            분석 기록
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">기업 전략 분석</h1>
          <p className="mt-3 text-base text-muted-foreground">
            NASDAQ / KOSPI 기업을 선택하면 AI가 12개 프레임워크로 보고서를 생성합니다.
          </p>

          <div className="mt-8 flex justify-center">
            <CompanyInput onSubmit={handleSubmit} loading={isGenerating} />
          </div>

          {error && (
            <p className="mt-6 text-sm text-destructive">{error}</p>
          )}

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
        </div>
      </main>
    </div>
  );
}

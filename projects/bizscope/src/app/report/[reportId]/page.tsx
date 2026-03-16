'use client';

import { use } from 'react';
import Link from 'next/link';
import ReportViewer from '@/components/report/ReportViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useReport } from '@/hooks/useReport';

export default function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const { report, isLoading } = useReport(reportId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-muted-foreground">보고서를 찾을 수 없습니다</p>
        <Link
          href="/history"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          분석 기록으로 돌아가기
        </Link>
      </div>
    );
  }

  return <ReportViewer report={report} />;
}

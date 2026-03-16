'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Report } from '@/frameworks/types';
import { getReports, deleteReport } from '@/lib/store';

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReports(getReports());
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    deleteReport(id);
    setReports(getReports());
  }

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">분석 기록</h1>
        <Link
          href="/report/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground
            transition hover:bg-primary/90"
        >
          새 분석
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">아직 분석 기록이 없습니다.</p>
          <Link
            href="/report/new"
            className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary/80"
          >
            첫 번째 분석 시작하기
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm"
            >
              <Link href={`/report/${report.id}`} className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {report.companyName}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(report.createdAt).toLocaleDateString('ko-KR')}</span>
                  <StatusBadge status={report.status} />
                  <span>
                    {report.sections.filter((s) => s.status === 'completed').length}/
                    {report.sections.length} 섹션
                  </span>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(report.id)}
                className="ml-4 shrink-0 rounded-md px-3 py-1 text-xs font-medium text-destructive
                  transition hover:bg-destructive/10"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Report['status'] }) {
  const styles: Record<Report['status'], string> = {
    draft: 'bg-muted text-muted-foreground',
    generating: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    error: 'bg-destructive/10 text-destructive',
  };

  const labels: Record<Report['status'], string> = {
    draft: '초안',
    generating: '생성 중',
    completed: '완료',
    error: '오류',
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

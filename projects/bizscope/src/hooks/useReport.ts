'use client';

import { useState, useEffect } from 'react';
import type { Report, ReportSection } from '@/frameworks/types';
import { getReport, saveReport } from '@/lib/store';

export function useReport(reportId: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = getReport(reportId);
    setReport(loaded);
    setIsLoading(false);
  }, [reportId]);

  function updateSection(index: number, patch: Partial<ReportSection>) {
    setReport((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], ...patch };
      const updated: Report = { ...prev, sections, updatedAt: Date.now() };
      saveReport(updated);
      return updated;
    });
  }

  return { report, updateSection, isLoading };
}

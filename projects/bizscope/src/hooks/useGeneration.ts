'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  Report,
  ReportSection,
  SectionType,
  SectionData,
  PipelineContext,
  CompanyOverviewData,
  ReportMode,
  IdeaInput,
} from '@/frameworks/types';
import { SECTION_TITLES, getSectionOrder } from '@/frameworks/types';
import { CONTEXT_KEYS } from '@/frameworks/shared';
import { saveReport } from '@/lib/store';

function createEmptyReport(name: string, mode: ReportMode, ideaInput?: IdeaInput): Report {
  const now = Date.now();
  const id = `rpt_${now}_${Math.random().toString(36).slice(2, 8)}`;
  const order = getSectionOrder(mode);

  const sections: ReportSection[] = order.map((type) => ({
    type,
    title: SECTION_TITLES[type],
    status: 'pending' as const,
    data: null,
  }));

  return {
    id,
    companyName: name,
    mode,
    ideaInput,
    createdAt: now,
    updatedAt: now,
    sections,
    status: 'generating',
  };
}

export function useGeneration() {
  const [report, setReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<Report | null>(null);

  const updateReport = useCallback((updater: (prev: Report) => Report) => {
    const current = reportRef.current;
    if (!current) return;
    const next = updater(current);
    reportRef.current = next;
    setReport(next);
    saveReport(next);
  }, []);

  const startGeneration = useCallback(async (companyName: string, mode: ReportMode = 'company', ideaInput?: IdeaInput): Promise<Report | null> => {
    setError(null);
    setIsGenerating(true);

    const displayName = mode === 'idea' ? (ideaInput?.name ?? companyName) : companyName;
    const newReport = createEmptyReport(displayName, mode, ideaInput);
    reportRef.current = newReport;
    setReport(newReport);
    saveReport(newReport);

    const order = getSectionOrder(mode);
    const ctx: PipelineContext = {
      companyName: displayName,
      ...(ideaInput ? { ideaInput } : {}),
    };

    try {
      for (let i = 0; i < order.length; i++) {
        const sectionType = order[i];

        // Mark section as generating
        updateReport((prev) => {
          const sections = [...prev.sections];
          sections[i] = { ...sections[i], status: 'generating' };
          return { ...prev, sections, updatedAt: Date.now() };
        });

        try {
          const res = await fetch(`/api/section/${sectionType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName: displayName, context: ctx, mode, ideaInput }),
          });

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(errBody.error ?? `HTTP ${res.status}`);
          }

          const data: SectionData = await res.json();

          // Accumulate context for subsequent sections
          const ctxKey = CONTEXT_KEYS[sectionType];
          if (ctxKey) {
            (ctx as unknown as Record<string, unknown>)[ctxKey] = data;
          }

          // Update industry from company overview
          const industry =
            sectionType === 'company-overview'
              ? (data as CompanyOverviewData).industry
              : undefined;

          // Mark section as completed
          updateReport((prev) => {
            const sections = [...prev.sections];
            sections[i] = { ...sections[i], status: 'completed', data };
            return {
              ...prev,
              sections,
              updatedAt: Date.now(),
              ...(industry ? { industry } : {}),
            };
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';

          // Mark section as error but continue to next
          updateReport((prev) => {
            const sections = [...prev.sections];
            sections[i] = { ...sections[i], status: 'error', error: message };
            return { ...prev, sections, updatedAt: Date.now() };
          });
        }
      }
    } catch (unexpectedErr) {
      const message =
        unexpectedErr instanceof Error ? unexpectedErr.message : 'Unexpected error';
      setError(message);
    }

    // Finalize report status
    updateReport((prev) => {
      const hasError = prev.sections.some((s) => s.status === 'error');
      const allDone = prev.sections.every(
        (s) => s.status === 'completed' || s.status === 'error',
      );
      return {
        ...prev,
        status: hasError ? 'error' : allDone ? 'completed' : 'generating',
        updatedAt: Date.now(),
      };
    });

    setIsGenerating(false);
    return reportRef.current;
  }, [updateReport]);

  const progress = report
    ? {
        completed: report.sections.filter((s) => s.status === 'completed').length,
        total: report.sections.length,
      }
    : { completed: 0, total: 0 };

  return { report, isGenerating, error, startGeneration, progress };
}

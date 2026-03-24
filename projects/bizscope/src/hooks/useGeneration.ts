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
import { SECTION_TITLES, getSectionTitles, getSectionOrder } from '@/frameworks/types';
import { CONTEXT_KEYS, DEPENDENCY_MAP } from '@/frameworks/shared';
import { saveReport } from '@/lib/store';
import {
  getLicenseKey,
  getUsageCount,
  incrementUsage,
  FREE_REPORT_LIMIT,
} from '@/lib/license-client';
import { useLocale } from '@/i18n';

function createEmptyReport(name: string, mode: ReportMode, ideaInput?: IdeaInput, locale?: string): Report {
  const now = Date.now();
  const id = `rpt_${now}_${Math.random().toString(36).slice(2, 8)}`;
  const order = getSectionOrder(mode);
  const titles = locale ? getSectionTitles(locale) : SECTION_TITLES;

  const sections: ReportSection[] = order.map((type) => ({
    type,
    title: titles[type],
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

/** Build execution levels from dependency map — sections in the same level can run in parallel. */
function buildExecutionLevels(order: SectionType[]): SectionType[][] {
  const levels: SectionType[][] = [];
  const scheduled = new Set<SectionType>();
  const remaining = [...order];

  while (remaining.length > 0) {
    const level: SectionType[] = [];
    for (const section of remaining) {
      const deps = DEPENDENCY_MAP[section] ?? [];
      if (deps.every((d) => scheduled.has(d))) {
        level.push(section);
      }
    }
    if (level.length === 0) break; // safety: avoid infinite loop
    for (const s of level) {
      scheduled.add(s);
      remaining.splice(remaining.indexOf(s), 1);
    }
    levels.push(level);
  }
  return levels;
}

export function useGeneration() {
  const { locale, t } = useLocale();
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

    // --- License / free-tier gate ---
    const licenseKey = getLicenseKey();
    if (!licenseKey) {
      // Free user — check localStorage counter
      if (getUsageCount() >= FREE_REPORT_LIMIT) {
        setError(`[PRICING] ${t.ui.errors.freeLimitExceeded}`);
        return null;
      }
    } else {
      // Licensed user — verify key + deduct credit if credits plan
      try {
        const checkRes = await fetch('/api/license/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey }),
        });
        const checkData = await checkRes.json();
        if (!checkData.valid) {
          setError(`[PRICING] ${t.ui.errors.invalidLicense}`);
          return null;
        }
        if (checkData.plan === 'credits' && checkData.credits <= 0) {
          setError(`[PRICING] ${t.ui.errors.insufficientCredits}`);
          return null;
        }
        // Deduct one credit for credits-plan users
        if (checkData.plan === 'credits') {
          const useRes = await fetch('/api/license/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey }),
          });
          if (!useRes.ok) {
            setError(t.ui.errors.creditDeductionFailed);
            return null;
          }
        }
      } catch {
        // Network error — allow generation (graceful degradation)
      }
    }

    setIsGenerating(true);

    const displayName = mode === 'idea' ? (ideaInput?.name ?? companyName) : companyName;
    const newReport = createEmptyReport(displayName, mode, ideaInput, locale);
    reportRef.current = newReport;
    setReport(newReport);
    saveReport(newReport);

    const order = getSectionOrder(mode);
    const ctx: PipelineContext = {
      companyName: displayName,
      ...(ideaInput ? { ideaInput } : {}),
    };

    try {
      // Parallel level-based execution for BOTH company and idea modes
      const levels = buildExecutionLevels(order);

      for (const level of levels) {
        // Mark all sections in this level as generating
        for (const sectionType of level) {
          const idx = order.indexOf(sectionType);
          updateReport((prev) => {
            const sections = [...prev.sections];
            sections[idx] = { ...sections[idx], status: 'generating' };
            return { ...prev, sections, updatedAt: Date.now() };
          });
        }

        // Run all sections in this level in parallel
        const results = await Promise.allSettled(
          level.map(async (sectionType) => {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (licenseKey) headers['x-license-key'] = licenseKey;
            const res = await fetch(`/api/section/${sectionType}`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ companyName: displayName, context: ctx, mode, ideaInput }),
            });
            if (!res.ok) {
              const errBody = await res.json().catch(() => ({ error: res.statusText }));
              throw new Error(errBody.error ?? `HTTP ${res.status}`);
            }
            return { sectionType, data: (await res.json()) as SectionData };
          }),
        );

        // Process results and accumulate context
        for (let r = 0; r < results.length; r++) {
          const result = results[r];
          if (result.status === 'fulfilled') {
            const { sectionType, data } = result.value;
            const idx = order.indexOf(sectionType);
            const ctxKey = CONTEXT_KEYS[sectionType];
            if (ctxKey) {
              (ctx as unknown as Record<string, unknown>)[ctxKey] = data;
            }

            // Extract industry from company overview
            const industry =
              sectionType === 'company-overview'
                ? (data as CompanyOverviewData).industry
                : undefined;

            updateReport((prev) => {
              const sections = [...prev.sections];
              sections[idx] = { ...sections[idx], status: 'completed', data };
              return {
                ...prev,
                sections,
                updatedAt: Date.now(),
                ...(industry ? { industry } : {}),
              };
            });
          } else {
            const failedSection = level[r];
            const idx = order.indexOf(failedSection);
            const message = result.reason instanceof Error ? result.reason.message : 'Unknown error';
            updateReport((prev) => {
              const sections = [...prev.sections];
              sections[idx] = { ...sections[idx], status: 'error', error: message };
              return { ...prev, sections, updatedAt: Date.now() };
            });
          }
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

    // Increment free usage counter (only for free users)
    if (!licenseKey) {
      incrementUsage();
    }

    setIsGenerating(false);
    return reportRef.current;
  }, [updateReport, locale, t]);

  const progress = report
    ? {
        completed: report.sections.filter((s) => s.status === 'completed').length,
        total: report.sections.length,
      }
    : { completed: 0, total: 0 };

  return { report, isGenerating, error, startGeneration, progress };
}

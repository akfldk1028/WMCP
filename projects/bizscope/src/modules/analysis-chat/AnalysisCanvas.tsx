'use client';

import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useLocale } from '@/i18n';
import type { SectionStatus } from './types';

/** Chapter grouping for display */
interface ChapterGroup {
  label: string;
  sections: SectionStatus[];
}

/** Chapter group with start index for stable index calculation */
interface IndexedChapterGroup extends ChapterGroup {
  startIndex: number;
}

function groupByChapter(
  sections: SectionStatus[],
  mode: 'company' | 'idea',
  labels: { ch01: string; ch02: string; ch03: string; ch04: string },
): IndexedChapterGroup[] {
  if (mode === 'company') {
    return [
      { label: labels.ch01, sections: sections.slice(0, 4), startIndex: 0 },
      { label: labels.ch02, sections: sections.slice(4, 9), startIndex: 4 },
      { label: labels.ch03, sections: sections.slice(9, 14), startIndex: 9 },
      { label: labels.ch04, sections: sections.slice(14), startIndex: 14 },
    ];
  }
  return [
    { label: labels.ch01, sections: sections.slice(0, 2), startIndex: 0 },
    { label: labels.ch02, sections: sections.slice(2, 6), startIndex: 2 },
    { label: labels.ch03, sections: sections.slice(6, 11), startIndex: 6 },
    { label: labels.ch04, sections: sections.slice(11), startIndex: 11 },
  ];
}

const STATUS_ICON = {
  pending: <Clock className="size-3 text-muted-foreground/50" />,
  generating: <Loader2 className="size-3 animate-spin text-indigo-500" />,
  completed: <CheckCircle2 className="size-3 text-emerald-500" />,
  error: <AlertCircle className="size-3 text-destructive" />,
} as const;

interface AnalysisCanvasProps {
  sections: SectionStatus[];
  mode: 'company' | 'idea';
  currentIndex: number;
  onSectionClick?: (index: number) => void;
  hideProgress?: boolean;
}

export function AnalysisCanvas({ sections, mode, currentIndex, onSectionClick, hideProgress }: AnalysisCanvasProps) {
  const { t } = useLocale();
  const a = t.ui.analysis;
  const completedCount = sections.filter((s) => s.status === 'completed').length;
  const totalCount = sections.length;
  const chLabels = mode === 'company'
    ? { ch01: a.ch01Company, ch02: a.ch02Company, ch03: a.ch03Company, ch04: a.ch04Company }
    : { ch01: a.ch01Idea, ch02: a.ch02Idea, ch03: a.ch03Idea, ch04: a.ch04Idea };
  const chapters = groupByChapter(sections, mode, chLabels);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar — hidden when parent shows its own */}
      {!hideProgress && <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{a.progress}</h3>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
        />
      </div>
      </>}

      {/* Chapter groups */}
      {chapters.map((chapter) => (
        <div key={chapter.label}>
          <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {chapter.label}
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {chapter.sections.map((section, localIdx) => {
              const globalIdx = chapter.startIndex + localIdx;
              const isCurrent = globalIdx === currentIndex;
              return (
                <button
                  key={section.type}
                  type="button"
                  onClick={() => section.status === 'completed' && onSectionClick?.(globalIdx)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                    isCurrent
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : section.status === 'completed'
                        ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer'
                        : 'bg-muted/20'
                  }`}
                  disabled={section.status !== 'completed'}
                >
                  {STATUS_ICON[section.status]}
                  <span className={`text-xs font-medium ${
                    section.status === 'completed' ? 'text-foreground' :
                    section.status === 'generating' ? 'text-indigo-400' :
                    'text-muted-foreground/60'
                  }`}>
                    {section.title}
                  </span>
                  {section.status === 'error' && (
                    <span className="ml-auto text-[10px] text-destructive">{section.error?.slice(0, 30)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

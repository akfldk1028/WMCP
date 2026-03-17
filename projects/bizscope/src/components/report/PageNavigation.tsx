'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PageDef } from '@/lib/pages';

interface Props {
  total: number;
  currentIndex: number;
  onNavigate: (index: number) => void;
  pages: PageDef[];
}

export default function PageNavigation({ total, currentIndex, onNavigate, pages }: Props) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  // For large page counts, show a condensed nav
  const showDots = total <= 20;

  return (
    <div className="border-t bg-background px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => onNavigate(currentIndex - 1)} disabled={!hasPrev}>
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">이전</span>
        </Button>

        {showDots ? (
          /* Dot navigation for compact mode */
          <div className="flex items-center gap-1.5 sm:gap-2">
            {pages.map((page, i) => {
              const isActive = i === currentIndex;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(i)}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-all sm:size-8',
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10',
                  )}
                  title={page.pageTitle}
                >
                  {isActive ? i + 1 : ''}
                </button>
              );
            })}
          </div>
        ) : (
          /* Slider for expanded mode */
          <div className="flex flex-1 flex-col items-center gap-1.5 px-4">
            <div className="flex w-full items-center gap-3">
              <span className="text-xs font-bold tabular-nums text-muted-foreground">
                {currentIndex + 1}
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-muted-foreground">
                {total}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {pages[currentIndex]?.sectionTitle && pages[currentIndex].sectionTitle !== ''
                ? pages[currentIndex].sectionTitle
                : pages[currentIndex]?.pageTitle}
            </p>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={() => onNavigate(currentIndex + 1)} disabled={!hasNext}>
          <span className="hidden sm:inline">다음</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">&larr;</kbd>
        {' / '}
        <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">&rarr;</kbd>
        {' '}키로 이동
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, Building2, Layers, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Report, ReportSection } from '@/frameworks/types';
import { generateCompactPages, generateExpandedPages, type PageDef } from '@/lib/pages';
import SectionRenderer from './SectionRenderer';
import SectionCover from './SectionCover';
import ReportCover from './ReportCover';
import ReportClosing from './ReportClosing';
import PageNavigation from './PageNavigation';

interface Props {
  report: Report;
}

type ViewMode = 'compact' | 'expanded';

function handleExportPDF() {
  window.print();
}

export default function ReportViewer({ report }: Props) {
  const [mode, setMode] = useState<ViewMode>('compact');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pages = useMemo(
    () => (mode === 'compact' ? generateCompactPages() : generateExpandedPages()),
    [mode],
  );

  const currentPage = pages[currentIndex];
  const total = pages.length;

  const navigateTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total || index === currentIndex || isTransitioning) return;
      setDirection(index > currentIndex ? 'right' : 'left');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 150);
    },
    [currentIndex, total, isTransitioning],
  );

  // Reset page on mode switch
  function handleModeSwitch(newMode: ViewMode) {
    if (newMode === mode) return;
    setCurrentIndex(0);
    setMode(newMode);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') navigateTo(currentIndex - 1);
      else if (e.key === 'ArrowRight') navigateTo(currentIndex + 1);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, navigateTo]);

  if (!currentPage) return null;

  const transitionClass = isTransitioning
    ? direction === 'right' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0';

  const completedCount = report.sections.filter((s) => s.status === 'completed').length;
  const progressPct = report.sections.length > 0 ? (completedCount / report.sections.length) * 100 : 0;

  // Build sidebar groups for expanded mode
  const sidebarSections = useMemo(() => {
    if (mode === 'compact') return null;
    const groups: { sectionIndex: number; sectionTitle: string; pages: { pageIndex: number; title: string; kind: string }[] }[] = [];
    let currentGroup: typeof groups[0] | null = null;

    pages.forEach((p, i) => {
      if (p.kind === 'report-cover' || p.kind === 'report-closing') {
        groups.push({ sectionIndex: -1, sectionTitle: p.kind === 'report-cover' ? 'Cover' : 'Closing', pages: [{ pageIndex: i, title: p.pageTitle, kind: p.kind }] });
      } else if (p.kind === 'section-cover') {
        currentGroup = { sectionIndex: p.sectionIndex, sectionTitle: p.sectionTitle, pages: [{ pageIndex: i, title: 'Cover', kind: p.kind }] };
        groups.push(currentGroup);
      } else if (p.kind === 'section-content' && currentGroup && currentGroup.sectionIndex === p.sectionIndex) {
        currentGroup.pages.push({ pageIndex: i, title: p.pageTitle, kind: p.kind });
      }
    });
    return groups;
  }, [pages, mode]);

  return (
    <div className="flex h-full min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="no-print hidden w-72 shrink-0 border-r bg-background lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Sidebar header */}
          <div className="border-b px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600">
                <Building2 className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">{report.companyName}</h2>
                {report.industry && <p className="text-xs text-muted-foreground">{report.industry}</p>}
              </div>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-indigo-600 transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{completedCount}/{report.sections.length} 완료</p>
          </div>

          {/* Mode toggle */}
          <div className="flex border-b p-2">
            <button
              onClick={() => handleModeSwitch('compact')}
              className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition',
                mode === 'compact' ? 'bg-indigo-50 text-indigo-700' : 'text-muted-foreground hover:bg-muted')}
            >
              <LayoutList className="size-3.5" />
              12p
            </button>
            <button
              onClick={() => handleModeSwitch('expanded')}
              className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition',
                mode === 'expanded' ? 'bg-indigo-50 text-indigo-700' : 'text-muted-foreground hover:bg-muted')}
            >
              <Layers className="size-3.5" />
              {pages.length}p
            </button>
          </div>

          {/* Section nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {mode === 'compact' ? (
              <ul className="space-y-0.5">
                {report.sections.map((section, i) => {
                  const isActive = i === currentIndex;
                  return (
                    <li key={section.type}>
                      <button
                        onClick={() => navigateTo(i)}
                        className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all',
                          isActive ? 'bg-indigo-50 font-semibold text-indigo-700 shadow-sm' : 'text-muted-foreground hover:bg-muted')}
                      >
                        <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold',
                          isActive ? 'bg-indigo-600 text-white'
                            : section.status === 'completed' ? 'bg-emerald-100 text-emerald-600'
                              : section.status === 'error' ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground')}>
                          {section.status === 'completed' ? '\u2713' : section.status === 'error' ? '\u2717' : i + 1}
                        </span>
                        <span className="truncate">{section.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-1">
                {sidebarSections?.map((group, gi) => (
                  <div key={gi}>
                    {group.sectionIndex >= 0 && (
                      <p className="mb-0.5 mt-3 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground first:mt-0">
                        {String(group.sectionIndex + 1).padStart(2, '0')}. {group.sectionTitle}
                      </p>
                    )}
                    {group.pages.map((p) => {
                      const isActive = p.pageIndex === currentIndex;
                      return (
                        <button
                          key={p.pageIndex}
                          onClick={() => navigateTo(p.pageIndex)}
                          className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-all',
                            isActive ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-muted-foreground hover:bg-muted')}
                        >
                          <span className={cn('flex size-5 shrink-0 items-center justify-center rounded text-[9px] font-bold',
                            isActive ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground')}>
                            {p.pageIndex + 1}
                          </span>
                          <span className="truncate">{p.title}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t px-5 py-3">
            {report.status === 'completed' && (
              <button onClick={handleExportPDF} className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90">
                <Download className="size-4" />PDF 내보내기
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6 md:px-8 md:py-10">
          <div className="w-full max-w-5xl">
            {/* Page header */}
            <div className="no-print mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold tabular-nums text-white">
                  {currentPage.pageNumber}
                </span>
                <div>
                  <h1 className="text-lg font-bold md:text-xl">{currentPage.pageTitle}</h1>
                  <p className="text-xs text-muted-foreground">
                    {report.companyName} &middot; Page {currentPage.pageNumber} of {total}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile mode toggle */}
                <div className="flex rounded-lg border lg:hidden">
                  <button onClick={() => handleModeSwitch('compact')} className={cn('px-2.5 py-1.5 text-xs font-medium', mode === 'compact' ? 'bg-indigo-50 text-indigo-700' : 'text-muted-foreground')}>12p</button>
                  <button onClick={() => handleModeSwitch('expanded')} className={cn('px-2.5 py-1.5 text-xs font-medium', mode === 'expanded' ? 'bg-indigo-50 text-indigo-700' : 'text-muted-foreground')}>{pages.length}p</button>
                </div>
                {report.status === 'completed' && (
                  <button onClick={handleExportPDF} className="no-print flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden">
                    <Download className="size-3.5" />PDF
                  </button>
                )}
              </div>
            </div>

            {/* Page content */}
            <div className={cn('min-h-[calc(100vh-14rem)] bg-background p-6 transition-all duration-150 ease-in-out md:p-10', transitionClass)}>
              <PageContent page={currentPage} report={report} />
            </div>
          </div>
        </main>

        <div className="no-print">
          <PageNavigation
            total={total}
            currentIndex={currentIndex}
            onNavigate={navigateTo}
            pages={pages}
          />
        </div>
      </div>
    </div>
  );
}

function PageContent({ page, report }: { page: PageDef; report: Report }) {
  if (page.kind === 'report-cover') {
    return <ReportCover companyName={report.companyName} industry={report.industry} createdAt={report.createdAt} />;
  }

  if (page.kind === 'report-closing') {
    return <ReportClosing companyName={report.companyName} />;
  }

  if (page.kind === 'section-cover' && page.sectionType) {
    return <SectionCover sectionIndex={page.sectionIndex} sectionType={page.sectionType} sectionTitle={page.sectionTitle} companyName={report.companyName} />;
  }

  // section-content
  const section = report.sections[page.sectionIndex];
  if (!section) return null;

  return <SectionRenderer section={section} subPage={page.subPage} />;
}

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bot, User, AlertTriangle, Play, Square, LayoutList, Layers } from 'lucide-react';
import { ChatInput } from '@/modules/planning-chat/ChatInput';
import SectionRenderer from '@/components/report/SectionRenderer';
import { A2UIRenderer } from '@/modules/a2ui/renderer';
import { generateCompactPages, generateExpandedPages } from '@/lib/pages';
import { getSubPageTitles } from '@/i18n';
import { useLocale } from '@/i18n';
import { AnalysisCanvas } from './AnalysisCanvas';

/** Lightweight inline markdown: **bold**, *italic*, `code`, newlines */
function SimpleMarkdown({ text }: { text: string }) {
  const lines = String(text ?? '').split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
          {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**'))
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*'))
              return <em key={j}>{part.slice(1, -1)}</em>;
            if (part.startsWith('`') && part.endsWith('`'))
              return <code key={j} className="rounded bg-muted px-1 py-0.5 text-xs">{part.slice(1, -1)}</code>;
            return part;
          })}
        </p>
      ))}
    </>
  );
}
import { useAnalysisFlow } from './useAnalysisFlow';
import type { AnalysisChatConfig, AnalysisChatEvent } from './types';

interface AnalysisChatProps {
  config: AnalysisChatConfig;
  onEvent?: (event: AnalysisChatEvent) => void;
}

export function AnalysisChat({ config, onEvent }: AnalysisChatProps) {
  const {
    sections,
    messages,
    currentIndex,
    isGenerating,
    isPaused,
    isCommenting,
    progress,
    startAnalysis,
    sendMessage,
    resumeAnalysis,
    regenerateSection,
    stopAnalysis,
  } = useAnalysisFlow();

  const { locale, t } = useLocale();
  const a = t.ui.analysis;
  const endRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [selPopup, setSelPopup] = useState<{ x: number; y: number; text: string } | null>(null);
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  // Text selection → floating "Ask AI" popup
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    function onMouseUp() {
      // Delay to let click on popup button fire first
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (!text || text.length < 5) { setSelPopup(null); return; }
        const range = sel?.getRangeAt(0);
        if (!range || !el!.contains(range.commonAncestorContainer)) { setSelPopup(null); return; }
        const rect = range.getBoundingClientRect();
        const cRect = el!.getBoundingClientRect();
        setSelPopup({ x: rect.left - cRect.left + rect.width / 2, y: rect.top - cRect.top + el!.scrollTop - 8, text });
      }, 10);
    }
    function onMouseDown(e: Event) {
      // Don't dismiss if clicking the popup button itself
      if (popupRef.current?.contains(e.target as Node)) return;
      setSelPopup(null);
    }
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousedown', onMouseDown as EventListener);
    return () => { el.removeEventListener('mouseup', onMouseUp); el.removeEventListener('mousedown', onMouseDown as EventListener); };
  }, []);

  const selTextRef = useRef('');
  if (selPopup) selTextRef.current = selPopup.text;

  const handleAskSelection = useCallback(() => {
    const text = selTextRef.current;
    if (!text) return;
    const q = `"${text.slice(0, 200)}" — 이 부분에 대해 자세히 설명해줘`;
    sendMessageRef.current(q);
    setSelPopup(null);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => endRef.current?.scrollIntoView?.({ behavior: 'smooth' }), 100);
  }, []);

  const [viewIndex, setViewIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');
  const [subPage, setSubPage] = useState(0);

  const compactCount = generateCompactPages(config.mode).length;
  const expandedCount = generateExpandedPages(config.mode).length;

  // Auto-scroll chat on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages.length]);

  // Auto-advance viewIndex to latest completed section
  useEffect(() => {
    if (currentIndex >= 0) setViewIndex(currentIndex);
  }, [currentIndex]);

  // Start analysis on mount, abort on unmount
  useEffect(() => {
    if (started.current) return;
    if (!config.subjectName) return;
    started.current = true;
    startAnalysis(config);
    return () => { stopAnalysis(); };
  }, [config, startAnalysis, stopAnalysis]);

  // Notify parent on completion
  useEffect(() => {
    if (progress.total > 0 && progress.completed === progress.total) {
      onEvent?.({
        type: 'all-complete',
        data: { sections: sections.map((s) => ({ type: s.type, status: s.status })) },
      });
    }
  }, [progress.completed, progress.total, sections, onEvent]);

  const handleSectionClick = useCallback((index: number) => {
    setViewIndex(index);
    setSubPage(0);
  }, []);

  const viewSection = sections[viewIndex];

  return (
    <div className="flex min-h-0 flex-1" style={{ height: 'calc(100dvh - 57px)' }}>
      {/* Left sidebar: Section nav */}
      <div className="flex w-[220px] shrink-0 flex-col border-r bg-muted/30" style={{ height: 'calc(100dvh - 57px)' }}>
        {/* Progress + mode toggle (fixed top) */}
        <div className="shrink-0 border-b px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold">{a.progress}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {progress.completed}/{progress.total}
            </span>
          </div>
          <div className="mb-3 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
            />
          </div>
          {/* 18p / 72p mode toggle */}
          <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition ${
                viewMode === 'compact' ? 'bg-background text-indigo-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="size-3" />
              {compactCount}p
            </button>
            <button
              type="button"
              onClick={() => setViewMode('expanded')}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition ${
                viewMode === 'expanded' ? 'bg-background text-indigo-700 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="size-3" />
              {expandedCount}p
            </button>
          </div>
        </div>

        {/* Section list (scrollable) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <AnalysisCanvas
            sections={sections}
            mode={config.mode}
            currentIndex={viewIndex}
            onSectionClick={handleSectionClick}
            hideProgress
          />
        </div>
      </div>

      {/* Center: PPT content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden" style={{ height: 'calc(100dvh - 57px)' }}>
        {/* Sub-page tabs (expanded mode only) */}
        {viewMode === 'expanded' && viewSection && (() => {
          const titles = getSubPageTitles(viewSection.type, locale);
          if (titles.length === 0) return null;
          return (
            <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b bg-muted/20 px-6 py-2">
              {titles.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSubPage(i)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    subPage === i
                      ? 'bg-indigo-600 text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Section PPT content */}
        <div ref={contentRef} className="relative min-h-0 flex-1 overflow-y-auto px-8 py-6">
          {selPopup && (
            <div ref={popupRef} className="absolute z-50 -translate-x-1/2 -translate-y-full" style={{ left: selPopup.x, top: selPopup.y }}>
              <button type="button" onClick={handleAskSelection}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg hover:bg-indigo-700">
                <Bot className="size-3" /> AI에게 질문
              </button>
            </div>
          )}
          {viewSection && (
            <>
              <h2 className="mb-4 text-xl font-bold">{viewSection.title}</h2>
              <SectionRenderer
                section={{
                  type: viewSection.type,
                  title: viewSection.title,
                  status: viewSection.status,
                  data: viewSection.data ?? null,
                  error: viewSection.error,
                }}
                subPage={viewMode === 'compact' ? -1 : subPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Right: Chat sidebar (narrow) */}
      <div className="flex w-[320px] shrink-0 flex-col border-l bg-background" style={{ height: 'calc(100dvh - 57px)' }}>
        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSystem = msg.role === 'system';
              return (
                <div
                  key={msg.id}
                  {...(msg.sectionType ? { 'data-section': msg.sectionType } : {})}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {!isSystem && (
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${isUser ? 'bg-muted' : 'bg-muted/80'}`}>
                      {isUser ? (
                        <User className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Bot className="size-3.5 text-indigo-500" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[85%] ${isUser ? 'items-end' : ''}`}>
                    {isSystem ? (
                      <div className="flex items-center gap-2 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white'
                            : 'bg-muted text-foreground'
                        }`}
                        style={isUser ? { borderTopRightRadius: 6 } : { borderTopLeftRadius: 6 }}
                      >
                        <SimpleMarkdown text={msg.content} />
                      </div>
                    )}

                    {msg.sectionType && msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => {
                          const idx = sections.findIndex((s) => s.type === msg.sectionType);
                          if (idx >= 0) setViewIndex(idx);
                        }}
                        className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80"
                      >
                        {sections.find((s) => s.type === msg.sectionType)?.title ?? msg.sectionType}
                      </button>
                    )}

                    {/* A2UI components */}
                    {msg.a2ui?.updateComponents?.components && (
                      <div className="mt-2">
                        <A2UIRenderer
                          components={msg.a2ui.updateComponents.components}
                          dataModel={{}}
                          surfaceId="analysis"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGenerating && !isPaused && sections[currentIndex] && (
              <div className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/80">
                  <Bot className="size-3.5 text-indigo-500" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 animate-pulse rounded-full bg-indigo-500" />
                    {isCommenting ? a.commenting : a.generating(sections[currentIndex].title)}
                  </span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Control bar */}
        {isGenerating && (
          <div className="flex items-center justify-between border-t px-4 py-2">
            <span className="text-xs text-muted-foreground">
              {a.sectionsDone(progress.completed, progress.total)}
            </span>
            <div className="flex gap-2">
              {isPaused ? (
                <>
                  <button
                    type="button"
                    onClick={regenerateSection}
                    className="flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
                  >
                    재생성
                  </button>
                  <button
                    type="button"
                    onClick={resumeAnalysis}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                  >
                    <Play className="size-3" /> 다음 섹션
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={stopAnalysis}
                  className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-muted/80"
                >
                  <Square className="size-3" /> {a.stop}
                </button>
              )}
            </div>
          </div>
        )}

        <ChatInput
          onSend={sendMessage}
          disabled={isCommenting}
          placeholder={isPaused ? a.pausedPlaceholder : a.defaultPlaceholder}
        />
      </div>
    </div>
  );
}

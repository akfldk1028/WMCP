'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  SectionType,
  SectionData,
  PipelineContext,
  ReportMode,
  IdeaInput,
} from '@/frameworks/types';
import { getSectionOrder, getSectionTitles } from '@/frameworks/types';
import { CONTEXT_KEYS } from '@/frameworks/shared';
import { getLicenseKey } from '@/lib/license-client';
import { useLocale } from '@/i18n';
import type { AnalysisMessage, SectionStatus, AnalysisChatConfig } from './types';
import { sectionToA2UI } from './sectionToA2UI';

// --- "다음" 감지 ---
const NEXT_COMMANDS = ['다음', '넘어가', '넘어가줘', 'next', '계속', '진행', 'ok', 'ㅇㅇ', 'ㅇ', '확인', '좋아', '됐어'];

function isNextCommand(text: string): boolean {
  const trimmed = text.trim().toLowerCase().replace(/[.!?,\s]+$/, '');
  return NEXT_COMMANDS.includes(trimmed);
}

/** Consume SSE from the comment API */
async function consumeCommentSSE(response: Response): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      let eventType = '';
      let eventData = '';
      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) eventType = line.slice(7);
        else if (line.startsWith('data: ')) eventData = line.slice(6);
      }
      if (eventType === 'text' && eventData) {
        try {
          const parsed = JSON.parse(eventData);
          result += parsed.content ?? '';
        } catch { /* skip */ }
      }
    }
  }
  return result;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useAnalysisFlow() {
  const { locale, t } = useLocale();
  const a = t.ui.analysis;
  const [sections, setSections] = useState<SectionStatus[]>([]);
  const [messages, setMessages] = useState<AnalysisMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const ctxRef = useRef<PipelineContext>({ companyName: '' });
  const messagesRef = useRef<AnalysisMessage[]>([]);
  const sectionsRef = useRef<SectionStatus[]>([]);
  const currentIndexRef = useRef(-1);
  const setCurrentIdx = useCallback((idx: number) => {
    currentIndexRef.current = idx;
    setCurrentIndex(idx);
  }, []);
  const pausedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const configRef = useRef<AnalysisChatConfig | null>(null);
  const ideaInputRef = useRef<IdeaInput | undefined>(undefined);
  const feedbackRef = useRef<string[]>([]);

  const addMessage = useCallback((msg: AnalysisMessage) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      messagesRef.current = next;
      return next;
    });
  }, []);

  const updateSection = useCallback((index: number, update: Partial<SectionStatus>) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...update };
      sectionsRef.current = next;
      return next;
    });
  }, []);

  /** Generate a single section via API */
  const generateSection = useCallback(async (
    sectionType: SectionType,
    mode: ReportMode,
    displayName: string,
    ideaInput?: IdeaInput,
    userFeedback?: string,
  ): Promise<SectionData> => {
    const licenseKey = getLicenseKey();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (licenseKey) headers['x-license-key'] = licenseKey;

    const body: Record<string, unknown> = {
      companyName: displayName,
      context: ctxRef.current,
      mode,
      ideaInput,
    };
    if (userFeedback) body.userFeedback = userFeedback;

    const res = await fetch(`/api/section/${sectionType}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: abortRef.current?.signal,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errBody.error ?? `HTTP ${res.status}`);
    }

    return (await res.json()) as SectionData;
  }, []);

  /** Get AI commentary on a completed section */
  const getCommentary = useCallback(async (
    sectionType: SectionType,
    sectionData: SectionData,
    nextSectionType?: SectionType,
    completedCount?: number,
    totalCount?: number,
  ): Promise<string> => {
    const config = configRef.current;
    if (!config) return '';

    const chatHistory = messagesRef.current
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const res = await fetch('/api/analysis/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: config.mode,
        subjectName: config.subjectName,
        sectionType,
        sectionData,
        nextSectionType,
        completedCount: completedCount ?? 0,
        totalCount: totalCount ?? 0,
        messages: chatHistory,
        locale,
      }),
      signal: abortRef.current?.signal,
    });

    if (!res.ok) return '';
    return consumeCommentSSE(res);
  }, [locale]);

  /** Generate ONE section, then auto-pause for user interaction */
  const generateOneSection = useCallback(async (startFrom: number) => {
    const config = configRef.current;
    if (!config) return;

    const order = getSectionOrder(config.mode);
    const titles = getSectionTitles(locale);
    const displayName = config.subjectName;
    const ideaInput = ideaInputRef.current;

    for (let i = startFrom; i < order.length; i++) {
      if (abortRef.current?.signal.aborted) break;
      if (sectionsRef.current[i]?.status === 'completed') continue;

      const sectionType = order[i];
      setCurrentIdx(i);
      updateSection(i, { status: 'generating' });

      // Collect any accumulated feedback
      const feedback = feedbackRef.current.length > 0
        ? feedbackRef.current.join('\n')
        : undefined;
      feedbackRef.current = [];

      try {
        const data = await generateSection(sectionType, config.mode, displayName, ideaInput, feedback);

        // Store in context for dependent sections
        const ctxKey = CONTEXT_KEYS[sectionType];
        if (ctxKey) {
          (ctxRef.current as unknown as Record<string, unknown>)[ctxKey] = data;
        }

        updateSection(i, { status: 'completed', data });

        // Get AI commentary + prompt for feedback
        setIsCommenting(true);
        const nextType = i < order.length - 1 ? order[i + 1] : undefined;
        const commentary = await getCommentary(sectionType, data, nextType, i + 1, order.length);
        setIsCommenting(false);

        if (commentary) {
          const a2uiMsg = sectionToA2UI(sectionType, data, titles[sectionType] ?? sectionType);
          addMessage({
            id: makeId('comment'),
            role: 'assistant',
            content: commentary,
            sectionType,
            ...(a2uiMsg ? { a2ui: a2uiMsg } : {}),
            timestamp: Date.now(),
          });
        }

        // Check if user paused during generation
        if (pausedRef.current) {
          setIsPaused(true);
          return; // User sent a message — pause until they say "다음"
        }

        // Continue to next section automatically

      } catch (err) {
        if ((err as Error).name === 'AbortError') break;
        const message = err instanceof Error ? err.message : 'Unknown error';
        updateSection(i, { status: 'error', error: message });
        addMessage({
          id: makeId('error'),
          role: 'system',
          content: a.sectionError(titles[sectionType], message),
          sectionType,
          timestamp: Date.now(),
        });
        // Continue despite error
      }
    }

    // All sections done
    setIsGenerating(false);
    setCurrentIdx(-1);
    addMessage({
      id: makeId('done'),
      role: 'assistant',
      content: '모든 섹션 분석이 완료되었습니다! 🎉',
      timestamp: Date.now(),
    });
  }, [locale, addMessage, updateSection, generateSection, getCommentary, a]);

  /** Start the analysis flow */
  const startAnalysis = useCallback(async (config: AnalysisChatConfig) => {
    configRef.current = config;
    setIsGenerating(true);
    setIsPaused(false);
    pausedRef.current = false;
    feedbackRef.current = [];

    abortRef.current = new AbortController();

    const order = getSectionOrder(config.mode);
    const titles = getSectionTitles(locale);

    const initialSections: SectionStatus[] = order.map((type) => ({
      type,
      title: titles[type] ?? type,
      status: 'pending',
      data: null,
    }));
    setSections(initialSections);
    sectionsRef.current = initialSections;

    const displayName = config.subjectName;
    const ideaInput: IdeaInput | undefined = config.mode === 'idea' ? {
      name: config.subjectName,
      description: config.ideaDescription ?? config.subjectName,
      targetMarket: config.ideaTarget,
      planningData: config.planningData,
    } : undefined;
    ideaInputRef.current = ideaInput;

    ctxRef.current = {
      companyName: displayName,
      ...(ideaInput ? { ideaInput } : {}),
      ...(config.planningData ? { planningData: config.planningData } : {}),
    };

    const welcomeText = a.welcome(displayName, order.length, config.mode);
    addMessage({ id: makeId('sys'), role: 'assistant', content: welcomeText, timestamp: Date.now() });

    // Start generating all sections sequentially (pauses only when user sends message)
    await generateOneSection(0);
  }, [locale, addMessage, generateOneSection, a]);

  /** Handle user message */
  const sendMessage = useCallback(async (text: string) => {
    addMessage({ id: makeId('user'), role: 'user', content: text, timestamp: Date.now() });

    if (isNextCommand(text)) {
      // User says "다음" → proceed to next section
      pausedRef.current = false;
      setIsPaused(false);

      const nextIdx = (currentIndexRef.current >= 0 ? currentIndexRef.current : 0) + 1;
      const order = getSectionOrder(configRef.current?.mode ?? 'company');

      if (nextIdx >= order.length) {
        // All done
        setIsGenerating(false);
        addMessage({
          id: makeId('done'),
          role: 'assistant',
          content: '모든 섹션 분석이 완료되었습니다! 🎉',
          timestamp: Date.now(),
        });
        return;
      }

      addMessage({
        id: makeId('next'),
        role: 'assistant',
        content: a.resuming(getSectionTitles(locale)[order[nextIdx]] ?? order[nextIdx]),
        timestamp: Date.now(),
      });

      await generateOneSection(nextIdx);
      return;
    }

    // User gave feedback — pause generation + store feedback
    pausedRef.current = true;
    setIsPaused(true);
    feedbackRef.current.push(text);

    // Get AI response to the feedback
    setIsCommenting(true);
    try {
      const config = configRef.current;
      if (!config) { setIsCommenting(false); return; }

      const chatHistory = messagesRef.current
        .filter((m) => m.role !== 'system')
        .slice(-8)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const currentSection = sectionsRef.current[currentIndexRef.current];

      const res = await fetch('/api/analysis/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: config.mode,
          subjectName: config.subjectName,
          sectionType: currentSection?.type ?? 'company-overview',
          sectionData: currentSection?.data ?? { question: text },
          completedCount: sectionsRef.current.filter((s) => s.status === 'completed').length,
          totalCount: sectionsRef.current.length,
          messages: chatHistory,
          locale,
        }),
      });

      if (res.ok) {
        const reply = await consumeCommentSSE(res);
        if (reply) {
          addMessage({ id: makeId('reply'), role: 'assistant', content: reply, timestamp: Date.now() });
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        addMessage({
          id: makeId('err'),
          role: 'system',
          content: `⚠ ${(err as Error).message ?? 'Network error'}`,
          timestamp: Date.now(),
        });
      }
    }
    setIsCommenting(false);
  }, [locale, addMessage, generateOneSection, a]);

  /** Regenerate current section with accumulated feedback */
  const regenerateSection = useCallback(async () => {
    const idx = currentIndexRef.current;
    if (idx < 0) return;

    pausedRef.current = false;
    setIsPaused(false);

    addMessage({
      id: makeId('regen'),
      role: 'assistant',
      content: '피드백을 반영하여 섹션을 재생성합니다...',
      timestamp: Date.now(),
    });

    // Mark as generating again
    updateSection(idx, { status: 'generating', data: null });

    // generateOneSection will pick up feedbackRef and regenerate
    await generateOneSection(idx);
  }, [addMessage, updateSection, generateOneSection]);

  /** Resume (skip current, go next) */
  const resumeAnalysis = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
    const nextIdx = (currentIndexRef.current >= 0 ? currentIndexRef.current : 0) + 1;
    generateOneSection(nextIdx);
  }, [generateOneSection]);

  /** Stop analysis */
  const stopAnalysis = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setIsPaused(false);
    setCurrentIdx(-1);
  }, []);

  const progress = {
    completed: sections.filter((s) => s.status === 'completed').length,
    total: sections.length,
  };

  return {
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
  };
}

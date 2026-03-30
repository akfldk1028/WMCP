'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import type { PlanningMessage, PlanningChatConfig, BrainstormData } from './types';
import type { A2UIEvent, A2UIMessage } from '@/modules/a2ui/types';
import { setPointer } from '@/modules/a2ui/data-binding';
import { BMC_BLOCK_META } from '@/modules/bmc/prompts';
import { BMC_BLOCKS, type BmcBlock, type BmcBlockData, type BmcData } from '@/modules/bmc/types';
import { PLAN_STAGE_META } from '@/modules/service-planning/prompts';
import type { PlanStage, ServicePlanData } from '@/modules/service-planning/types';
import { savePlanLocal } from '@/modules/planning-bridge';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/i18n';

interface PlanningChatProps {
  config: PlanningChatConfig;
  onEvent?: (event: { type: string; data: Record<string, unknown> }) => void;
}

/** Extract BMC entries from AI text by matching block headings */
function extractBmcBlocks(text: string): Partial<Record<BmcBlock, BmcBlockData>> {
  const blocks: Partial<Record<BmcBlock, BmcBlockData>> = {};
  const entries = Object.entries(BMC_BLOCK_META) as [BmcBlock, typeof BMC_BLOCK_META[BmcBlock]][];
  for (const [block, meta] of entries) {
    for (const pattern of [meta.label, meta.labelKo]) {
      const idx = text.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx === -1) continue;
      const after = text.slice(idx + pattern.length);
      const end = after.search(/\n#{1,3}\s|\n\*\*\S/);
      const section = (end > 0 ? after.slice(0, end) : after.slice(0, 500));
      // Filter out progress messages and navigation noise from AI responses
      const NOISE_RE = /^(✅|→|다음[:：]|완료|Round \d|브레인스토밍|Save & Analyze|\(\d+\/\d+\))/;
      const items = section.split('\n')
        .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(l => l.length > 3 && l.length < 200 && !NOISE_RE.test(l));
      if (items.length > 0) {
        blocks[block] = { entries: items.slice(0, 10), aiGenerated: true };
      }
      break;
    }
  }
  return blocks;
}

/** Extract service plan stages from AI text */
function extractPlanStages(text: string): Partial<Record<PlanStage, { sections: Record<string, unknown>; aiGenerated: boolean }>> {
  const stages: Partial<Record<PlanStage, { sections: Record<string, unknown>; aiGenerated: boolean }>> = {};
  const entries = Object.entries(PLAN_STAGE_META) as [PlanStage, typeof PLAN_STAGE_META[PlanStage]][];
  for (const [stage, meta] of entries) {
    for (const pattern of [meta.label, meta.labelKo]) {
      const idx = text.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx === -1) continue;
      const after = text.slice(idx + pattern.length);
      const end = after.search(/\n#{1,3}\s|\n\*\*\S/);
      const section = (end > 0 ? after.slice(0, end) : after.slice(0, 1000)).trim();
      if (section.length > 10) {
        stages[stage] = { sections: { content: section }, aiGenerated: true };
      }
      break;
    }
  }
  return stages;
}

/** Extract text entries from inline A2UI children objects */
function extractA2UIEntries(children: unknown[]): string[] {
  const entries: string[] = [];
  for (const child of children) {
    if (typeof child === 'string') continue;
    if (child && typeof child === 'object') {
      const c = child as Record<string, unknown>;
      if (c.component === 'Text' && c.text) entries.push(String(c.text));
      if (c.component === 'List' && Array.isArray(c.items)) entries.push(...(c.items as string[]).map(String));
      if (c.component === 'TextField' && (c.value || c.placeholder)) {
        const val = String(c.value ?? c.placeholder ?? '');
        if (val.length > 3) entries.push(val);
      }
    }
  }
  return entries;
}

/** Extract BMC block data from A2UI messages (BmcBlock components) */
function extractBmcFromA2UI(messages: PlanningMessage[]): Partial<Record<BmcBlock, BmcBlockData>> {
  const blocks: Partial<Record<BmcBlock, BmcBlockData>> = {};
  const labelToBlock = new Map<string, BmcBlock>();
  for (const [block, meta] of Object.entries(BMC_BLOCK_META) as [BmcBlock, typeof BMC_BLOCK_META[BmcBlock]][]) {
    labelToBlock.set(meta.label.toLowerCase(), block);
    labelToBlock.set(meta.labelKo.toLowerCase(), block);
    labelToBlock.set(block, block);
  }

  for (const msg of messages) {
    const comps = msg.a2ui?.updateComponents?.components;
    if (!comps) continue;
    for (const comp of comps) {
      if (comp.component === 'BmcBlock') {
        const blockProp = String(comp.block ?? comp.title ?? '').toLowerCase();
        const matchedBlock = labelToBlock.get(blockProp);
        if (!matchedBlock) continue;
        const entries = extractA2UIEntries((comp.children ?? []) as unknown[]);
        if (entries.length > 0) blocks[matchedBlock] = { entries, aiGenerated: true };
        continue;
      }
      if (comp.component === 'Card' || comp.component === 'StageCard') {
        const title = String(comp.title ?? '').toLowerCase();
        const matchedBlock = labelToBlock.get(title);
        if (!matchedBlock) continue;
        const entries = extractA2UIEntries((comp.children ?? []) as unknown[]);
        if (entries.length > 0) blocks[matchedBlock] = { entries, aiGenerated: true };
      }
    }
  }
  return blocks;
}

/** Extract service plan stages from A2UI messages (StageCard components) */
function extractPlanFromA2UI(messages: PlanningMessage[]): Partial<Record<PlanStage, { sections: Record<string, unknown>; aiGenerated: boolean }>> {
  const stages: Partial<Record<PlanStage, { sections: Record<string, unknown>; aiGenerated: boolean }>> = {};
  const labelToStage = new Map<string, PlanStage>();
  for (const [stage, meta] of Object.entries(PLAN_STAGE_META) as [PlanStage, typeof PLAN_STAGE_META[PlanStage]][]) {
    labelToStage.set(meta.label.toLowerCase(), stage);
    labelToStage.set(meta.labelKo.toLowerCase(), stage);
    labelToStage.set(stage, stage);
  }

  for (const msg of messages) {
    const comps = msg.a2ui?.updateComponents?.components;
    if (!comps) continue;
    for (const comp of comps) {
      if (comp.component === 'StageCard') {
        const stageProp = String(comp.stage ?? comp.title ?? '').toLowerCase();
        const matched = labelToStage.get(stageProp);
        if (!matched) continue;
        const entries = extractA2UIEntries((comp.children ?? []) as unknown[]);
        if (entries.length > 0) {
          stages[matched] = { sections: { content: entries.join('\n') }, aiGenerated: true };
        }
      }
    }
  }
  return stages;
}

/** Runtime type guard for A2UI messages from SSE */
function isValidA2UIMessage(data: unknown): data is A2UIMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  if (msg.version !== 'v0.9') return false;
  if (msg.updateComponents) {
    const uc = msg.updateComponents as Record<string, unknown>;
    if (typeof uc.surfaceId !== 'string' || !Array.isArray(uc.components)) return false;
  }
  if (msg.updateDataModel) {
    const ud = msg.updateDataModel as Record<string, unknown>;
    if (typeof ud.surfaceId !== 'string' || !ud.data || typeof ud.data !== 'object') return false;
  }
  return true;
}

async function consumeSSE(
  response: Response,
  onText: (content: string) => void,
  onA2UI: (data: A2UIMessage) => void,
  onError: (message: string) => void,
  onBrainstorm?: (data: BrainstormData) => void,
  onToken?: (chunk: string) => void,
): Promise<void> {
  if (!response.body) throw new Error('Response body is null');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

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
      if (!eventType || !eventData) continue;

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(eventData);
      } catch {
        continue; // skip malformed JSON
      }

      if (eventType === 'error') {
        await reader.cancel();
        onError(String(parsed.message ?? 'Unknown error'));
        return;
      }
      if (eventType === 'token') { onToken?.(String(parsed.content ?? '')); }
      else if (eventType === 'text') onText(String(parsed.content ?? ''));
      else if (eventType === 'a2ui') {
        if (isValidA2UIMessage(parsed)) onA2UI(parsed);
      }
      else if (eventType === 'brainstorm') onBrainstorm?.(parsed as unknown as BrainstormData);
    }
  }
}

export function PlanningChat({ config, onEvent }: PlanningChatProps) {
  const router = useRouter();
  const { t } = useLocale();
  const p = t.ui.planning;
  const [messages, setMessages] = useState<PlanningMessage[]>([]);
  const [dataModel, setDataModel] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<PlanningMessage[]>([]);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const planIdRef = useRef(config.planId ?? `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

  const hasAssistantMessages = messages.some((m) => m.role === 'assistant');

  const handleSaveAndAnalyze = useCallback(() => {
    const assistantTexts = messagesRef.current
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content)
      .join('\n\n');
    const firstUserMsg = messagesRef.current.find((m) => m.role === 'user');
    const title = firstUserMsg?.content.slice(0, 100) ?? 'Plan';

    const bmcBlocks = extractBmcBlocks(assistantTexts);
    const planStages = extractPlanStages(assistantTexts);

    const bmc: BmcData = {
      id: `bmc-${Date.now()}`, title,
      blocks: Object.keys(bmcBlocks).length > 0 ? bmcBlocks : { 'value-proposition': { entries: [assistantTexts.slice(0, 500)], aiGenerated: true } },
      status: 'draft', createdAt: Date.now(), updatedAt: Date.now(),
    };
    const plan: ServicePlanData = {
      id: `splan-${Date.now()}`, title,
      stages: Object.keys(planStages).length > 0 ? planStages : { 'executive-summary': { sections: { overview: assistantTexts.slice(0, 1000) }, aiGenerated: true } },
      status: 'draft', createdAt: Date.now(), updatedAt: Date.now(),
    };

    const planId = planIdRef.current;
    savePlanLocal(planId, bmc, plan);
    router.push(`/report/new?mode=idea&planId=${planId}`);
  }, [router]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: PlanningMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const withUser = [...messagesRef.current, userMsg];
    messagesRef.current = withUser;
    setMessages(withUser);
    setIsLoading(true);
    setError(null);

    const history = withUser.map((m) => ({ role: m.role, content: m.content }));
    abortRef.current = new AbortController();

    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode: config.mode }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errBody.error ?? `HTTP ${response.status}`);
      }

      let content = '';
      let a2ui: A2UIMessage | undefined;
      let sseError: string | null = null;
      let brainstormResult: BrainstormData | undefined;
      const streamingMsgId = `assistant-${Date.now()}`;
      let streamingContent = '';

      await consumeSSE(
        response,
        (t) => { content = t; },
        (d) => { a2ui = d; },
        (msg) => { sseError = msg; },
        (b) => { brainstormResult = b; },
        (chunk) => {
          streamingContent += chunk;
          const streamMsg: PlanningMessage = {
            id: streamingMsgId,
            role: 'assistant',
            content: streamingContent,
            timestamp: Date.now(),
          };
          const updated = [...messagesRef.current.filter(m => m.id !== streamingMsgId), streamMsg];
          messagesRef.current = updated;
          setMessages(updated);
        },
      );

      if (sseError) {
        throw new Error(sseError);
      }

      // Replace streaming message with final version (includes A2UI + cleaned text)
      const finalContent = content || streamingContent;
      const assistantMsg: PlanningMessage = {
        id: streamingMsgId,
        role: 'assistant',
        content: finalContent,
        a2ui,
        timestamp: Date.now(),
      };
      const withAssistant = [...messagesRef.current.filter(m => m.id !== streamingMsgId), assistantMsg];
      messagesRef.current = withAssistant;
      setMessages(withAssistant);

      // Apply server-pushed data model updates
      const dataModelUpdate = a2ui?.updateDataModel?.data;
      if (dataModelUpdate) {
        setDataModel((prev) => {
          let next = { ...prev };
          for (const [key, value] of Object.entries(dataModelUpdate)) {
            const pointer = key.startsWith('/') ? key : `/${key}`;
            next = setPointer(next, pointer, value);
          }
          return next;
        });
      }

      // If brainstorm ran, add results as a separate message
      if (brainstormResult) {
        const brainstormContent = `**멀티모델 토론 결과** — "${brainstormResult.topic}" (${brainstormResult.modelCount} models)\n\n` +
          brainstormResult.opinions
            .filter((o) => !o.error)
            .map((o) => `**${o.model}:**\n${o.content}`)
            .join('\n\n---\n\n');
        const brainstormMsg: PlanningMessage = {
          id: `brainstorm-${Date.now()}`,
          role: 'assistant',
          content: brainstormContent,
          timestamp: Date.now(),
        };
        const withBrainstorm = [...messagesRef.current, brainstormMsg];
        messagesRef.current = withBrainstorm;
        setMessages(withBrainstorm);
      }

      // Emit extracted BMC/plan data for live canvas update
      const allAssistantText = messagesRef.current
        .filter((m) => m.role === 'assistant')
        .map((m) => m.content)
        .join('\n\n');
      const bmcFromText = extractBmcBlocks(allAssistantText);
      const bmcFromA2UI = extractBmcFromA2UI(messagesRef.current);
      const bmcBlocks = { ...bmcFromText, ...bmcFromA2UI }; // A2UI takes precedence
      const planFromText = extractPlanStages(allAssistantText);
      const planFromA2UI = extractPlanFromA2UI(messagesRef.current);
      const planStages = { ...planFromText, ...planFromA2UI }; // A2UI takes precedence
      if (Object.keys(bmcBlocks).length > 0 || Object.keys(planStages).length > 0) {
        onEventRef.current?.({ type: 'data-update', data: { bmcBlocks, planStages } });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [config]);

  const handleA2UIEvent = useCallback((event: A2UIEvent) => {
    if (event.type === 'change') {
      setDataModel((prev) => setPointer(prev, `/${event.surfaceId}/${event.componentId}`, event.value));
    }
    if (event.type === 'action') {
      onEventRef.current?.({ type: event.name ?? 'action', data: { surfaceId: event.surfaceId, componentId: event.componentId } });
    }
  }, [onEvent]);

  return (
    <div data-testid="planning-chat" data-mode={config.mode} className="flex h-full flex-col" style={{ background: '#131315' }}>
      {/* Messages — scrollable area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MessageList messages={messages} dataModel={dataModel} onA2UIEvent={handleA2UIEvent} />
      </div>

      {/* Error banner */}
      {error && (
        <div data-testid="chat-error" role="alert" className="px-4 py-2 text-center text-sm" style={{ background: 'rgba(255,180,171,0.08)', color: '#ffb4ab' }}>
          {error}
        </div>
      )}

      {/* Save & Analyze bar */}
      {hasAssistantMessages && !isLoading && (
        <div className="flex items-center justify-between px-4 py-2" style={{ background: '#1c1b1d' }}>
          <span className="text-xs" style={{ color: '#908fa0' }}>{p.analysisReady}</span>
          <button
            type="button"
            onClick={handleSaveAndAnalyze}
            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #4edea3, #00a572)' }}
          >
            {p.saveAndAnalyze}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* Input — pinned to bottom */}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading}
        placeholder={
          config.mode === 'bmc' ? p.bmcPlaceholder
            : config.mode === 'service-planning' ? p.planPlaceholder
              : p.bothPlaceholder
        }
      />
    </div>
  );
}

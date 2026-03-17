import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { SevenSData, SevenSElement, SevenSItem, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_ELEMENTS: SevenSElement[] = [
  'strategy', 'structure', 'systems', 'shared-values', 'style', 'staff', 'skills',
];

export async function generate(ctx: PipelineContext): Promise<SevenSData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<SevenSData, 'type'>>(raw);

  const items: SevenSItem[] = (parsed.items ?? []).map((item) => ({
    element: VALID_ELEMENTS.includes(item.element as SevenSElement)
      ? (item.element as SevenSElement)
      : 'strategy',
    label: item.label ?? '',
    currentState: item.currentState ?? '',
    requiredChange: item.requiredChange ?? '',
    difficulty: Math.max(1, Math.min(5, Math.round(item.difficulty ?? 3))),
    impact: Math.max(1, Math.min(5, Math.round(item.impact ?? 3))),
    relatedStrategies: item.relatedStrategies ?? [],
  }));

  return {
    type: 'seven-s-alignment',
    items,
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<SevenSData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<SevenSData, 'type'>>(raw);

  const items: SevenSItem[] = (parsed.items ?? []).map((item) => ({
    element: VALID_ELEMENTS.includes(item.element as SevenSElement)
      ? (item.element as SevenSElement)
      : 'strategy',
    label: item.label ?? '',
    currentState: item.currentState ?? '',
    requiredChange: item.requiredChange ?? '',
    difficulty: Math.max(1, Math.min(5, Math.round(item.difficulty ?? 3))),
    impact: Math.max(1, Math.min(5, Math.round(item.impact ?? 3))),
    relatedStrategies: item.relatedStrategies ?? [],
  }));

  return {
    type: 'seven-s-alignment',
    items,
    summary: parsed.summary ?? '',
  };
}

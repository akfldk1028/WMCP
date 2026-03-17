import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { StrategyCombinationData, StrategyItem, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_COMBOS = ['SO', 'ST', 'WO', 'WT'] as const;

export async function generate(
  ctx: PipelineContext,
): Promise<StrategyCombinationData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<StrategyCombinationData, 'type'>>(raw);

  const strategies: StrategyItem[] = (parsed.strategies ?? []).map((s) => ({
    id: crypto.randomUUID(),
    combination: VALID_COMBOS.includes(s.combination as (typeof VALID_COMBOS)[number])
      ? (s.combination as StrategyItem['combination'])
      : 'SO',
    strategy: s.strategy ?? '',
    description: s.description ?? '',
    relatedSW: s.relatedSW ?? '',
    relatedOT: s.relatedOT ?? '',
    feasibility: Math.max(1, Math.min(5, Math.round(s.feasibility ?? 3))),
    impact: Math.max(1, Math.min(5, Math.round(s.impact ?? 3))),
  }));

  return {
    type: 'strategy-combination',
    strategies,
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<StrategyCombinationData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<StrategyCombinationData, 'type'>>(raw);

  const strategies: StrategyItem[] = (parsed.strategies ?? []).map((s) => ({
    id: crypto.randomUUID(),
    combination: VALID_COMBOS.includes(s.combination as (typeof VALID_COMBOS)[number])
      ? (s.combination as StrategyItem['combination'])
      : 'SO',
    strategy: s.strategy ?? '',
    description: s.description ?? '',
    relatedSW: s.relatedSW ?? '',
    relatedOT: s.relatedOT ?? '',
    feasibility: Math.max(1, Math.min(5, Math.round(s.feasibility ?? 3))),
    impact: Math.max(1, Math.min(5, Math.round(s.impact ?? 3))),
  }));

  return {
    type: 'strategy-combination',
    strategies,
    summary: parsed.summary ?? '',
  };
}

import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { GoToMarketData, GTMChannel, LaunchPhase, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_PRIORITIES = ['high', 'medium', 'low'] as const;

function normalizeChannels(raw: GTMChannel[]): GTMChannel[] {
  return (raw ?? []).map((c) => ({
    channel: c.channel ?? '',
    strategy: c.strategy ?? '',
    cost: c.cost ?? '',
    priority: VALID_PRIORITIES.includes(c.priority as (typeof VALID_PRIORITIES)[number])
      ? (c.priority as GTMChannel['priority'])
      : 'medium',
  }));
}

function normalizePhases(raw: LaunchPhase[]): LaunchPhase[] {
  return (raw ?? []).map((p) => ({
    phase: p.phase ?? '',
    duration: p.duration ?? '',
    goals: p.goals ?? [],
    actions: p.actions ?? [],
  }));
}

export async function generate(ctx: PipelineContext): Promise<GoToMarketData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<GoToMarketData, 'type'>>(raw);

  return {
    type: 'go-to-market',
    channels: normalizeChannels(parsed.channels),
    launchPhases: normalizePhases(parsed.launchPhases),
    earlyAdopters: parsed.earlyAdopters ?? '',
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<GoToMarketData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<GoToMarketData, 'type'>>(raw);

  return {
    type: 'go-to-market',
    channels: normalizeChannels(parsed.channels),
    launchPhases: normalizePhases(parsed.launchPhases),
    earlyAdopters: parsed.earlyAdopters ?? '',
    summary: parsed.summary ?? '',
  };
}

import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { GrowthStrategyData, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_STRATEGY_TYPE = ['viral', 'content', 'partnership', 'paid', 'community', 'product-led'] as const;
const VALID_PRIORITY = ['high', 'medium', 'low'] as const;
const VALID_NE_TYPE = ['direct', 'indirect', 'data', 'none'] as const;
const VALID_NE_STRENGTH = ['strong', 'moderate', 'weak', 'none'] as const;
const VALID_FEASIBILITY = ['high', 'medium', 'low'] as const;

function buildResult(parsed: Omit<GrowthStrategyData, 'type'>): GrowthStrategyData {
  return {
    type: 'growth-strategy',
    strategies: (parsed.strategies ?? []).map((s) => ({
      type: VALID_STRATEGY_TYPE.includes(s.type as (typeof VALID_STRATEGY_TYPE)[number])
        ? (s.type as GrowthStrategyData['strategies'][number]['type'])
        : 'content',
      name: s.name ?? '',
      description: s.description ?? '',
      cost: s.cost ?? '',
      expectedImpact: s.expectedImpact ?? '',
      timeline: s.timeline ?? '',
      priority: VALID_PRIORITY.includes(s.priority as (typeof VALID_PRIORITY)[number])
        ? (s.priority as 'high' | 'medium' | 'low')
        : 'medium',
    })),
    networkEffects: {
      type: VALID_NE_TYPE.includes(parsed.networkEffects?.type as (typeof VALID_NE_TYPE)[number])
        ? (parsed.networkEffects.type as GrowthStrategyData['networkEffects']['type'])
        : 'none',
      description: parsed.networkEffects?.description ?? '',
      strength: VALID_NE_STRENGTH.includes(parsed.networkEffects?.strength as (typeof VALID_NE_STRENGTH)[number])
        ? (parsed.networkEffects.strength as GrowthStrategyData['networkEffects']['strength'])
        : 'none',
    },
    expansionStages: (parsed.expansionStages ?? []).map((e) => ({
      stage: e.stage ?? '',
      timeline: e.timeline ?? '',
      target: e.target ?? '',
      strategy: e.strategy ?? '',
      kpi: e.kpi ?? '',
    })),
    internationalExpansion: parsed.internationalExpansion
      ? {
          feasibility: VALID_FEASIBILITY.includes(parsed.internationalExpansion.feasibility as (typeof VALID_FEASIBILITY)[number])
            ? (parsed.internationalExpansion.feasibility as 'high' | 'medium' | 'low')
            : 'low',
          priorityMarkets: parsed.internationalExpansion.priorityMarkets ?? [],
          barriers: parsed.internationalExpansion.barriers ?? [],
          timeline: parsed.internationalExpansion.timeline ?? '',
        }
      : undefined,
    partnerships: (parsed.partnerships ?? []).map((p) => ({
      partner: p.partner ?? '',
      type: p.type ?? '',
      benefit: p.benefit ?? '',
      feasibility: VALID_FEASIBILITY.includes(p.feasibility as (typeof VALID_FEASIBILITY)[number])
        ? (p.feasibility as 'high' | 'medium' | 'low')
        : 'medium',
    })),
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<GrowthStrategyData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<GrowthStrategyData, 'type'>>(raw);
  return buildResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<GrowthStrategyData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<GrowthStrategyData, 'type'>>(raw);
  return buildResult(parsed);
}

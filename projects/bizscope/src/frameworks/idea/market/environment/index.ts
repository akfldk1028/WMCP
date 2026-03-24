import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { MarketEnvironmentData, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_PEST = ['political', 'economic', 'social', 'technological'] as const;
const VALID_DIRECTION = ['positive', 'negative', 'neutral'] as const;
const VALID_STATUS = ['existing', 'upcoming', 'proposed'] as const;
const VALID_MATURITY = ['emerging', 'growing', 'mature', 'declining'] as const;

function buildResult(parsed: Omit<MarketEnvironmentData, 'type'>): MarketEnvironmentData {
  return {
    type: 'market-environment',
    pestSummary: (parsed.pestSummary ?? []).map((p) => ({
      category: VALID_PEST.includes(p.category as (typeof VALID_PEST)[number])
        ? (p.category as MarketEnvironmentData['pestSummary'][number]['category'])
        : 'economic',
      keyFactor: p.keyFactor ?? '',
      impact: p.impact ?? '',
      direction: VALID_DIRECTION.includes(p.direction as (typeof VALID_DIRECTION)[number])
        ? (p.direction as 'positive' | 'negative' | 'neutral')
        : 'neutral',
    })),
    techTrends: (parsed.techTrends ?? []).map((t) => ({
      trend: t.trend ?? '',
      relevance: t.relevance ?? '',
      timeframe: t.timeframe ?? '',
    })),
    regulatoryEnvironment: (parsed.regulatoryEnvironment ?? []).map((r) => ({
      regulation: r.regulation ?? '',
      status: VALID_STATUS.includes(r.status as (typeof VALID_STATUS)[number])
        ? (r.status as 'existing' | 'upcoming' | 'proposed')
        : 'existing',
      impact: r.impact ?? '',
    })),
    consumerBehavior: (parsed.consumerBehavior ?? []).map((c) => ({
      trend: c.trend ?? '',
      evidence: c.evidence ?? '',
      implication: c.implication ?? '',
    })),
    marketMaturity: VALID_MATURITY.includes(parsed.marketMaturity as (typeof VALID_MATURITY)[number])
      ? (parsed.marketMaturity as MarketEnvironmentData['marketMaturity'])
      : 'growing',
    maturityReasoning: parsed.maturityReasoning ?? '',
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<MarketEnvironmentData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<MarketEnvironmentData, 'type'>>(raw);
  return buildResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<MarketEnvironmentData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<MarketEnvironmentData, 'type'>>(raw);
  return buildResult(parsed);
}

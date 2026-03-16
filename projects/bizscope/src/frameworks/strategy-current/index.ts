import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { StrategyCurrentComparisonData, StrategyComparison, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage } from './prompts';

const VALID_VERDICTS = ['match', 'supplement', 'missing'] as const;

export async function generate(
  ctx: PipelineContext,
): Promise<StrategyCurrentComparisonData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<StrategyCurrentComparisonData, 'type'>>(raw);

  const comparisons: StrategyComparison[] = (parsed.comparisons ?? []).map((c) => ({
    strategyLabel: c.strategyLabel ?? '',
    strategyName: c.strategyName ?? '',
    currentStrategy: c.currentStrategy ?? '',
    sevenSComparison: c.sevenSComparison ?? '',
    verdict: VALID_VERDICTS.includes(c.verdict as (typeof VALID_VERDICTS)[number])
      ? (c.verdict as StrategyComparison['verdict'])
      : 'missing',
  }));

  return {
    type: 'strategy-current-comparison',
    comparisons,
    summary: parsed.summary ?? '',
  };
}

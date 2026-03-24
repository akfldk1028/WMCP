import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { KPIPerformanceData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

function validateTrend(trend: string): 'up' | 'down' | 'stable' {
  if (trend === 'up' || trend === 'down' || trend === 'stable') return trend;
  return 'stable';
}

export async function generate(ctx: PipelineContext): Promise<KPIPerformanceData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<KPIPerformanceData, 'type'>>(raw);

  return {
    type: 'kpi-performance',
    kpis: (parsed.kpis ?? []).map((k) => ({
      metric: k.metric ?? '',
      value: k.value ?? '',
      trend: validateTrend(k.trend),
      benchmark: k.benchmark,
    })),
    marketPosition: parsed.marketPosition ?? '',
    industryComparison: parsed.industryComparison,
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<KPIPerformanceData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<KPIPerformanceData, 'type'>>(raw);

  return {
    type: 'kpi-performance',
    kpis: (parsed.kpis ?? []).map((k) => ({
      metric: k.metric ?? '',
      value: k.value ?? '',
      trend: validateTrend(k.trend),
      benchmark: k.benchmark,
    })),
    marketPosition: parsed.marketPosition ?? '',
    industryComparison: parsed.industryComparison,
    summary: parsed.summary ?? '',
  };
}

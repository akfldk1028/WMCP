import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { FinancialAnalysisData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

function parseIndicator(item: { metric?: string; value?: string; interpretation?: string }) {
  return {
    metric: item.metric ?? '',
    value: item.value ?? '',
    interpretation: item.interpretation ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<FinancialAnalysisData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<FinancialAnalysisData, 'type'>>(raw);

  return {
    type: 'financial-analysis',
    incomeStatement: (parsed.incomeStatement ?? []).map((i) => ({
      year: i.year ?? '',
      revenue: i.revenue ?? '',
      operatingProfit: i.operatingProfit ?? '',
      netIncome: i.netIncome ?? '',
    })),
    costStructure: (parsed.costStructure ?? []).map((c) => ({
      category: c.category ?? '',
      amount: c.amount,
      percentage: c.percentage,
    })),
    growthIndicators: (parsed.growthIndicators ?? []).map(parseIndicator),
    stabilityIndicators: (parsed.stabilityIndicators ?? []).map(parseIndicator),
    profitabilityIndicators: parsed.profitabilityIndicators?.map(parseIndicator),
    lossAnalysis: parsed.lossAnalysis,
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<FinancialAnalysisData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<FinancialAnalysisData, 'type'>>(raw);

  return {
    type: 'financial-analysis',
    incomeStatement: (parsed.incomeStatement ?? []).map((i) => ({
      year: i.year ?? '',
      revenue: i.revenue ?? '',
      operatingProfit: i.operatingProfit ?? '',
      netIncome: i.netIncome ?? '',
    })),
    costStructure: (parsed.costStructure ?? []).map((c) => ({
      category: c.category ?? '',
      amount: c.amount,
      percentage: c.percentage,
    })),
    growthIndicators: (parsed.growthIndicators ?? []).map(parseIndicator),
    stabilityIndicators: (parsed.stabilityIndicators ?? []).map(parseIndicator),
    profitabilityIndicators: parsed.profitabilityIndicators?.map(parseIndicator),
    lossAnalysis: parsed.lossAnalysis,
    summary: parsed.summary ?? '',
  };
}

import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { FinancialProjectionData, MonthlyProjection, YearlyProjection, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_SCENARIO = ['optimistic', 'base', 'pessimistic'] as const;

function normalizeMonthly(raw: MonthlyProjection[]): MonthlyProjection[] {
  return (raw ?? []).map((m) => ({
    month: String(m.month ?? ''),
    revenue: typeof m.revenue === 'number' ? m.revenue : 0,
    cost: typeof m.cost === 'number' ? m.cost : 0,
    profit: typeof m.profit === 'number' ? m.profit : 0,
    users: typeof m.users === 'number' ? m.users : undefined,
  }));
}

function normalizeYearly(raw: YearlyProjection[]): YearlyProjection[] {
  return (raw ?? []).map((y) => ({
    year: y.year ?? '',
    revenue: y.revenue ?? '',
    cost: y.cost ?? '',
    profit: y.profit ?? '',
    users: y.users,
    keyAssumptions: y.keyAssumptions ?? [],
  }));
}

function buildResult(parsed: Omit<FinancialProjectionData, 'type'>): FinancialProjectionData {
  return {
    type: 'financial-projection',
    monthly: normalizeMonthly(parsed.monthly),
    yearly: normalizeYearly(parsed.yearly),
    scenarios: (parsed.scenarios ?? []).map((s) => ({
      scenario: VALID_SCENARIO.includes(s.scenario as (typeof VALID_SCENARIO)[number])
        ? (s.scenario as 'optimistic' | 'base' | 'pessimistic')
        : 'base',
      year3Revenue: s.year3Revenue ?? '',
      year3Profit: s.year3Profit ?? '',
      probability: s.probability ?? '',
      keyAssumption: s.keyAssumption ?? '',
    })),
    fundingPlan: (parsed.fundingPlan ?? []).map((f) => ({
      stage: f.stage ?? '',
      amount: f.amount ?? '',
      timing: f.timing ?? '',
      use: f.use ?? '',
      source: f.source ?? '',
    })),
    keyMetrics: (parsed.keyMetrics ?? []).map((k) => ({
      metric: k.metric ?? '',
      year1: k.year1 ?? '',
      year2: k.year2 ?? '',
      year3: k.year3 ?? '',
    })),
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<FinancialProjectionData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<FinancialProjectionData, 'type'>>(raw);
  return buildResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<FinancialProjectionData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<FinancialProjectionData, 'type'>>(raw);
  return buildResult(parsed);
}

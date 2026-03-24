import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { UnitEconomicsData, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_VERDICT = ['healthy', 'marginal', 'unsustainable'] as const;

function buildResult(parsed: Omit<UnitEconomicsData, 'type'>): UnitEconomicsData {
  return {
    type: 'unit-economics',
    cac: {
      value: parsed.cac?.value ?? '',
      breakdown: parsed.cac?.breakdown ?? '',
      benchmark: parsed.cac?.benchmark,
    },
    ltv: {
      value: parsed.ltv?.value ?? '',
      calculation: parsed.ltv?.calculation ?? '',
      benchmark: parsed.ltv?.benchmark,
    },
    ltvCacRatio: {
      value: parsed.ltvCacRatio?.value ?? '',
      verdict: VALID_VERDICT.includes(parsed.ltvCacRatio?.verdict as (typeof VALID_VERDICT)[number])
        ? (parsed.ltvCacRatio.verdict as UnitEconomicsData['ltvCacRatio']['verdict'])
        : 'marginal',
    },
    breakEvenPoint: {
      months: parsed.breakEvenPoint?.months ?? '',
      customers: parsed.breakEvenPoint?.customers ?? '',
      revenue: parsed.breakEvenPoint?.revenue ?? '',
      assumptions: parsed.breakEvenPoint?.assumptions ?? '',
    },
    monthlyBurnRate: parsed.monthlyBurnRate ?? '',
    runway: parsed.runway ?? '',
    margins: {
      gross: parsed.margins?.gross ?? '',
      contribution: parsed.margins?.contribution ?? '',
      reasoning: parsed.margins?.reasoning ?? '',
    },
    sensitivityAnalysis: (parsed.sensitivityAnalysis ?? []).map((s) => ({
      variable: s.variable ?? '',
      optimistic: s.optimistic ?? '',
      base: s.base ?? '',
      pessimistic: s.pessimistic ?? '',
    })),
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<UnitEconomicsData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<UnitEconomicsData, 'type'>>(raw);
  return buildResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<UnitEconomicsData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<UnitEconomicsData, 'type'>>(raw);
  return buildResult(parsed);
}

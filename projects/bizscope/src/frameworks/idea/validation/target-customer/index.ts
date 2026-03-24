import { generateSection } from '@/lib/claude';
import { extractJSON } from '../../../parse-json';
import type { IdeaTargetCustomerData, PersonaDetail, CustomerJourneyStep, PipelineContext } from '../../../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_SATISFACTION = ['high', 'medium', 'low'] as const;

function normalizePersonas(raw: PersonaDetail[]): PersonaDetail[] {
  return (raw ?? []).map((p) => ({
    name: p.name ?? '',
    age: p.age ?? '',
    occupation: p.occupation ?? '',
    income: p.income,
    pain: p.pain ?? '',
    currentSolution: p.currentSolution ?? '',
    desiredOutcome: p.desiredOutcome ?? '',
    willingnessToPay: p.willingnessToPay ?? '',
  }));
}

function normalizeJourney(raw: CustomerJourneyStep[]): CustomerJourneyStep[] {
  return (raw ?? []).map((s) => ({
    stage: s.stage ?? '',
    action: s.action ?? '',
    touchpoint: s.touchpoint ?? '',
    painPoint: s.painPoint ?? '',
    opportunity: s.opportunity ?? '',
  }));
}

function buildResult(parsed: Omit<IdeaTargetCustomerData, 'type'>): IdeaTargetCustomerData {
  return {
    type: 'idea-target-customer',
    personas: normalizePersonas(parsed.personas),
    customerJourney: normalizeJourney(parsed.customerJourney),
    currentAlternatives: (parsed.currentAlternatives ?? []).map((a) => ({
      name: a.name ?? '',
      usage: a.usage ?? '',
      satisfaction: VALID_SATISFACTION.includes(a.satisfaction as (typeof VALID_SATISFACTION)[number])
        ? (a.satisfaction as 'high' | 'medium' | 'low')
        : 'medium',
      switchingBarrier: a.switchingBarrier ?? '',
    })),
    willingnessAnalysis: (parsed.willingnessAnalysis ?? []).map((w) => ({
      segment: w.segment ?? '',
      priceRange: w.priceRange ?? '',
      paymentModel: w.paymentModel ?? '',
      reasoning: w.reasoning ?? '',
    })),
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<IdeaTargetCustomerData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<IdeaTargetCustomerData, 'type'>>(raw);
  return buildResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<IdeaTargetCustomerData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<IdeaTargetCustomerData, 'type'>>(raw);
  return buildResult(parsed);
}

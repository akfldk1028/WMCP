import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { RiskAssessmentData, RiskItem, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_CATEGORIES = ['market', 'technical', 'financial', 'regulatory', 'competitive'] as const;
const VALID_LEVELS = ['low', 'medium', 'high'] as const;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val ?? 3)));
}

function normalizeRisks(raw: RiskItem[]): RiskItem[] {
  return (raw ?? []).map((r) => ({
    category: VALID_CATEGORIES.includes(r.category as (typeof VALID_CATEGORIES)[number])
      ? (r.category as RiskItem['category'])
      : 'market',
    risk: r.risk ?? '',
    probability: clamp(r.probability, 1, 5),
    impact: clamp(r.impact, 1, 5),
    mitigation: r.mitigation ?? '',
  }));
}

export async function generate(ctx: PipelineContext): Promise<RiskAssessmentData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<RiskAssessmentData, 'type'>>(raw);

  return {
    type: 'risk-assessment',
    risks: normalizeRisks(parsed.risks),
    overallRiskLevel: VALID_LEVELS.includes(parsed.overallRiskLevel as (typeof VALID_LEVELS)[number])
      ? (parsed.overallRiskLevel as RiskAssessmentData['overallRiskLevel'])
      : 'medium',
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<RiskAssessmentData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<RiskAssessmentData, 'type'>>(raw);

  return {
    type: 'risk-assessment',
    risks: normalizeRisks(parsed.risks),
    overallRiskLevel: VALID_LEVELS.includes(parsed.overallRiskLevel as (typeof VALID_LEVELS)[number])
      ? (parsed.overallRiskLevel as RiskAssessmentData['overallRiskLevel'])
      : 'medium',
    summary: parsed.summary ?? '',
  };
}

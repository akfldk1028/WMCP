import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { DifferentiationData, UniqueFeature, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

function normalizeFeatures(raw: UniqueFeature[]): UniqueFeature[] {
  return (raw ?? []).map((f) => ({
    feature: f.feature ?? '',
    description: f.description ?? '',
    competitorLack: f.competitorLack ?? '',
  }));
}

export async function generate(ctx: PipelineContext): Promise<DifferentiationData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<DifferentiationData, 'type'>>(raw);

  return {
    type: 'differentiation',
    uniqueFeatures: normalizeFeatures(parsed.uniqueFeatures),
    positioningStatement: parsed.positioningStatement ?? '',
    moat: parsed.moat ?? '',
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<DifferentiationData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<DifferentiationData, 'type'>>(raw);

  return {
    type: 'differentiation',
    uniqueFeatures: normalizeFeatures(parsed.uniqueFeatures),
    positioningStatement: parsed.positioningStatement ?? '',
    moat: parsed.moat ?? '',
    summary: parsed.summary ?? '',
  };
}

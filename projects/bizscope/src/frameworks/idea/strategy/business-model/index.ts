import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { BusinessModelData, RevenueModel, UnitEconomic, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

function normalizeModels(raw: RevenueModel[]): RevenueModel[] {
  return (raw ?? []).map((m) => ({
    modelType: m.modelType ?? '',
    description: m.description ?? '',
    pricing: m.pricing ?? '',
    pros: m.pros ?? [],
    cons: m.cons ?? [],
    recommended: m.recommended ?? false,
  }));
}

function normalizeEconomics(raw: UnitEconomic[]): UnitEconomic[] {
  return (raw ?? []).map((e) => ({
    metric: e.metric ?? '',
    value: e.value ?? '',
  }));
}

export async function generate(ctx: PipelineContext): Promise<BusinessModelData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<BusinessModelData, 'type'>>(raw);

  return {
    type: 'business-model',
    models: normalizeModels(parsed.models),
    unitEconomics: normalizeEconomics(parsed.unitEconomics),
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<BusinessModelData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<BusinessModelData, 'type'>>(raw);

  return {
    type: 'business-model',
    models: normalizeModels(parsed.models),
    unitEconomics: normalizeEconomics(parsed.unitEconomics),
    summary: parsed.summary ?? '',
  };
}

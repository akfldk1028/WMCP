import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { MarketSizeData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

export async function generate(ctx: PipelineContext): Promise<MarketSizeData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<MarketSizeData, 'type'>>(raw);

  return {
    type: 'market-size',
    tam: {
      value: parsed.tam?.value ?? '',
      description: parsed.tam?.description ?? '',
    },
    sam: {
      value: parsed.sam?.value ?? '',
      description: parsed.sam?.description ?? '',
    },
    som: {
      value: parsed.som?.value ?? '',
      description: parsed.som?.description ?? '',
    },
    growthRate: parsed.growthRate ?? '',
    trends: parsed.trends ?? [],
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<MarketSizeData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<MarketSizeData, 'type'>>(raw);

  return {
    type: 'market-size',
    tam: {
      value: parsed.tam?.value ?? '',
      description: parsed.tam?.description ?? '',
    },
    sam: {
      value: parsed.sam?.value ?? '',
      description: parsed.sam?.description ?? '',
    },
    som: {
      value: parsed.som?.value ?? '',
      description: parsed.som?.description ?? '',
    },
    growthRate: parsed.growthRate ?? '',
    trends: parsed.trends ?? [],
    summary: parsed.summary ?? '',
  };
}

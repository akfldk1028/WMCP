import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { BusinessModelDetailData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

export async function generate(ctx: PipelineContext): Promise<BusinessModelDetailData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<BusinessModelDetailData, 'type'>>(raw);

  return {
    type: 'business-model-detail',
    businessModelType: parsed.businessModelType ?? '',
    revenueStreams: (parsed.revenueStreams ?? []).map((r) => ({
      name: r.name ?? '',
      description: r.description ?? '',
      percentage: r.percentage,
    })),
    platformComponents: parsed.platformComponents ?? [],
    valueChain: parsed.valueChain ?? [],
    commissionStructure: parsed.commissionStructure,
    keyPartners: parsed.keyPartners ?? [],
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<BusinessModelDetailData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<BusinessModelDetailData, 'type'>>(raw);

  return {
    type: 'business-model-detail',
    businessModelType: parsed.businessModelType ?? '',
    revenueStreams: (parsed.revenueStreams ?? []).map((r) => ({
      name: r.name ?? '',
      description: r.description ?? '',
      percentage: r.percentage,
    })),
    platformComponents: parsed.platformComponents ?? [],
    valueChain: parsed.valueChain ?? [],
    commissionStructure: parsed.commissionStructure,
    keyPartners: parsed.keyPartners ?? [],
    summary: parsed.summary ?? '',
  };
}

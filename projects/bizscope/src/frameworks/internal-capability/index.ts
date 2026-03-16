import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { InternalCapabilityData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage } from './prompts';

export async function generate(
  ctx: PipelineContext,
): Promise<InternalCapabilityData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<InternalCapabilityData, 'type'>>(raw);

  return {
    type: 'internal-capability',
    capabilities: (parsed.capabilities ?? []).map((c) => ({
      area: c.area ?? '',
      strengths: c.strengths ?? [],
      weaknesses: c.weaknesses ?? [],
      score: Math.max(1, Math.min(5, Math.round(c.score ?? 3))),
    })),
    overallStrengths: parsed.overallStrengths ?? [],
    overallWeaknesses: parsed.overallWeaknesses ?? [],
    summary: parsed.summary ?? '',
  };
}

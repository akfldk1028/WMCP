import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { InternalCapabilityData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

function normalizeIdItem(item: unknown, prefix: string, index: number): { id: string; description: string } {
  if (typeof item === 'string') return { id: `${prefix}${index + 1}`, description: item };
  const obj = item as Record<string, unknown>;
  return {
    id: (obj.id as string) ?? `${prefix}${index + 1}`,
    description: (obj.description as string) ?? String(item),
  };
}

function parseCapability(raw: Record<string, unknown>) {
  const rawStrengths = (raw.strengths ?? []) as unknown[];
  const rawWeaknesses = (raw.weaknesses ?? []) as unknown[];
  return {
    area: (raw.area as string) ?? '',
    strengths: rawStrengths.map((s, i) => normalizeIdItem(s, 'S', i)),
    weaknesses: rawWeaknesses.map((w, i) => normalizeIdItem(w, 'W', i)),
    score: Math.max(1, Math.min(5, Math.round((raw.score as number) ?? 3))),
  };
}

function parseResult(parsed: Record<string, unknown>): InternalCapabilityData {
  const capabilities = ((parsed.capabilities ?? []) as Record<string, unknown>[]).map(parseCapability);

  const rawOverallStrengths = (parsed.overallStrengths ?? []) as unknown[];
  const rawOverallWeaknesses = (parsed.overallWeaknesses ?? []) as unknown[];

  return {
    type: 'internal-capability',
    capabilities,
    overallStrengths: rawOverallStrengths.map((s, i) => normalizeIdItem(s, 'S', i)),
    overallWeaknesses: rawOverallWeaknesses.map((w, i) => normalizeIdItem(w, 'W', i)),
    summary: (parsed.summary as string) ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<InternalCapabilityData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Record<string, unknown>>(raw);
  return parseResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<InternalCapabilityData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Record<string, unknown>>(raw);
  return parseResult(parsed);
}

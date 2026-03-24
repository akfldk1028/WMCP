import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { ReferenceCaseData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

export async function generate(ctx: PipelineContext): Promise<ReferenceCaseData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<ReferenceCaseData, 'type'>>(raw);

  return {
    type: 'reference-case',
    cases: (parsed.cases ?? []).map((c) => ({
      company: c.company ?? '',
      industry: c.industry ?? '',
      strategy: c.strategy ?? '',
      outcome: c.outcome ?? '',
      applicability: c.applicability ?? '',
    })),
    implications: parsed.implications ?? [],
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<ReferenceCaseData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<ReferenceCaseData, 'type'>>(raw);

  return {
    type: 'reference-case',
    cases: (parsed.cases ?? []).map((c) => ({
      company: c.company ?? '',
      industry: c.industry ?? '',
      strategy: c.strategy ?? '',
      outcome: c.outcome ?? '',
      applicability: c.applicability ?? '',
    })),
    implications: parsed.implications ?? [],
    summary: parsed.summary ?? '',
  };
}

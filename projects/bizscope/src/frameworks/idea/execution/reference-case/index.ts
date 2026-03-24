import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { IdeaReferenceCaseData, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

function buildResult(parsed: Omit<IdeaReferenceCaseData, 'type'>): IdeaReferenceCaseData {
  return {
    type: 'idea-reference-case',
    successCases: (parsed.successCases ?? []).map((c) => ({
      company: c.company ?? '',
      industry: c.industry ?? '',
      similarity: c.similarity ?? '',
      strategy: c.strategy ?? '',
      outcome: c.outcome ?? '',
      keyLesson: c.keyLesson ?? '',
      timeToSuccess: c.timeToSuccess ?? '',
    })),
    failureCase: {
      company: parsed.failureCase?.company ?? '',
      industry: parsed.failureCase?.industry ?? '',
      reason: parsed.failureCase?.reason ?? '',
      lesson: parsed.failureCase?.lesson ?? '',
    },
    implications: parsed.implications ?? [],
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<IdeaReferenceCaseData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<IdeaReferenceCaseData, 'type'>>(raw);
  return buildResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<IdeaReferenceCaseData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<IdeaReferenceCaseData, 'type'>>(raw);
  return buildResult(parsed);
}

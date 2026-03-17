import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { IdeaOverviewData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

export async function generate(ctx: PipelineContext): Promise<IdeaOverviewData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<IdeaOverviewData, 'type'>>(raw);

  return {
    type: 'idea-overview',
    ideaName: parsed.ideaName ?? ctx.ideaInput?.name ?? '',
    problemStatement: parsed.problemStatement ?? '',
    solution: parsed.solution ?? '',
    targetUser: parsed.targetUser ?? '',
    uniqueValue: parsed.uniqueValue ?? '',
    category: parsed.category ?? '',
    keywords: parsed.keywords ?? [],
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<IdeaOverviewData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<IdeaOverviewData, 'type'>>(raw);

  return {
    type: 'idea-overview',
    ideaName: parsed.ideaName ?? ctx.ideaInput?.name ?? '',
    problemStatement: parsed.problemStatement ?? '',
    solution: parsed.solution ?? '',
    targetUser: parsed.targetUser ?? '',
    uniqueValue: parsed.uniqueValue ?? '',
    category: parsed.category ?? '',
    keywords: parsed.keywords ?? [],
  };
}

import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { CompetitorData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

export async function generate(ctx: PipelineContext): Promise<CompetitorData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<CompetitorData, 'type'>>(raw);

  return {
    type: 'competitor-comparison',
    competitors: (parsed.competitors ?? []).map((c) => ({
      name: c.name ?? '',
      strengths: c.strengths ?? [],
      weaknesses: c.weaknesses ?? [],
      marketShare: c.marketShare,
      keyDifferentiator: c.keyDifferentiator ?? '',
    })),
    gaps: (parsed.gaps ?? []).map((g) => ({
      area: g.area ?? '',
      ourPosition: g.ourPosition ?? '',
      competitorBest: g.competitorBest ?? '',
      gap: g.gap ?? '',
      action: g.action ?? '',
    })),
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<CompetitorData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<CompetitorData, 'type'>>(raw);

  return {
    type: 'competitor-comparison',
    competitors: (parsed.competitors ?? []).map((c) => ({
      name: c.name ?? '',
      strengths: c.strengths ?? [],
      weaknesses: c.weaknesses ?? [],
      marketShare: c.marketShare,
      keyDifferentiator: c.keyDifferentiator ?? '',
    })),
    gaps: (parsed.gaps ?? []).map((g) => ({
      area: g.area ?? '',
      ourPosition: g.ourPosition ?? '',
      competitorBest: g.competitorBest ?? '',
      gap: g.gap ?? '',
      action: g.action ?? '',
    })),
    summary: parsed.summary ?? '',
  };
}

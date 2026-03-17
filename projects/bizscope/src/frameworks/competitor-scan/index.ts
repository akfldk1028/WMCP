import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { CompetitorScanData, ScannedCompetitor, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

function normalizeCompetitors(raw: ScannedCompetitor[]): ScannedCompetitor[] {
  return (raw ?? []).map((c) => ({
    name: c.name ?? '',
    description: c.description ?? '',
    url: c.url,
    funding: c.funding,
    users: c.users,
    strengths: c.strengths ?? [],
    weaknesses: c.weaknesses ?? [],
  }));
}

export async function generate(ctx: PipelineContext): Promise<CompetitorScanData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<CompetitorScanData, 'type'>>(raw);

  return {
    type: 'competitor-scan',
    competitors: normalizeCompetitors(parsed.competitors),
    marketGaps: parsed.marketGaps ?? [],
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<CompetitorScanData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<CompetitorScanData, 'type'>>(raw);

  return {
    type: 'competitor-scan',
    competitors: normalizeCompetitors(parsed.competitors),
    marketGaps: parsed.marketGaps ?? [],
    summary: parsed.summary ?? '',
  };
}

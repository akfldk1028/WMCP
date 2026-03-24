import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { FiveForceDetailData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_AXES = new Set(['rivalry', 'newEntrants', 'supplierPower', 'buyerPower', 'substitutes']);
const VALID_DIRECTIONS = new Set(['increase', 'decrease', 'neutral']);

function clampScore(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score || 3)));
}

function validateDirection(dir: string): 'increase' | 'decrease' | 'neutral' {
  if (VALID_DIRECTIONS.has(dir)) return dir as 'increase' | 'decrease' | 'neutral';
  return 'neutral';
}

function parseResult(parsed: Omit<FiveForceDetailData, 'type'>): FiveForceDetailData {
  return {
    type: 'five-forces-detail',
    axes: (parsed.axes ?? [])
      .filter((a) => VALID_AXES.has(a.axis))
      .map((a) => ({
        axis: a.axis,
        label: a.label ?? '',
        score: clampScore(a.score),
        analysis: a.analysis ?? '',
        pestInfluences: (a.pestInfluences ?? []).map((p) => ({
          pestFactor: p.pestFactor ?? '',
          influence: p.influence ?? '',
          direction: validateDirection(p.direction),
        })),
      })),
    overallCompetitiveIntensity: clampScore(parsed.overallCompetitiveIntensity),
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<FiveForceDetailData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<FiveForceDetailData, 'type'>>(raw);
  return parseResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<FiveForceDetailData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<FiveForceDetailData, 'type'>>(raw);
  return parseResult(parsed);
}

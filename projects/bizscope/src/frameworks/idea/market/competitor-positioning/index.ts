import { generateSection } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type { CompetitorPositioningData, PositionedCompetitor, PipelineContext } from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_SIZE = ['small', 'medium', 'large'] as const;
const VALID_THREAT = ['high', 'medium', 'low'] as const;

function normalizePositions(raw: PositionedCompetitor[]): PositionedCompetitor[] {
  return (raw ?? []).map((p) => ({
    name: p.name ?? '',
    x: typeof p.x === 'number' ? p.x : 50,
    y: typeof p.y === 'number' ? p.y : 50,
    size: VALID_SIZE.includes(p.size as (typeof VALID_SIZE)[number])
      ? (p.size as PositionedCompetitor['size'])
      : 'medium',
    isOurs: p.isOurs ?? false,
  }));
}

function buildResult(parsed: Omit<CompetitorPositioningData, 'type'>): CompetitorPositioningData {
  return {
    type: 'competitor-positioning',
    axes: {
      x: {
        label: parsed.axes?.x?.label ?? '',
        lowEnd: parsed.axes?.x?.lowEnd ?? '',
        highEnd: parsed.axes?.x?.highEnd ?? '',
      },
      y: {
        label: parsed.axes?.y?.label ?? '',
        lowEnd: parsed.axes?.y?.lowEnd ?? '',
        highEnd: parsed.axes?.y?.highEnd ?? '',
      },
    },
    positions: normalizePositions(parsed.positions),
    indirectCompetitors: (parsed.indirectCompetitors ?? []).map((c) => ({
      name: c.name ?? '',
      overlapArea: c.overlapArea ?? '',
      threatLevel: VALID_THREAT.includes(c.threatLevel as (typeof VALID_THREAT)[number])
        ? (c.threatLevel as 'high' | 'medium' | 'low')
        : 'medium',
    })),
    substitutes: (parsed.substitutes ?? []).map((s) => ({
      name: s.name ?? '',
      description: s.description ?? '',
      switchingCost: s.switchingCost ?? '',
    })),
    vulnerabilities: (parsed.vulnerabilities ?? []).map((v) => ({
      competitor: v.competitor ?? '',
      weakness: v.weakness ?? '',
      exploitStrategy: v.exploitStrategy ?? '',
    })),
    marketWhitespace: parsed.marketWhitespace ?? [],
    summary: parsed.summary ?? '',
  };
}

export async function generate(ctx: PipelineContext): Promise<CompetitorPositioningData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<CompetitorPositioningData, 'type'>>(raw);
  return buildResult(parsed);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<CompetitorPositioningData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<CompetitorPositioningData, 'type'>>(raw);
  return buildResult(parsed);
}

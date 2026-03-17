import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { TOWSData, TOWSCell, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_SW = ['S', 'W'] as const;
const VALID_OT = ['O', 'T'] as const;

export async function generate(ctx: PipelineContext): Promise<TOWSData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<TOWSData, 'type' | 'strengths' | 'weaknesses' | 'opportunities' | 'threats'>>(raw);

  const cells: TOWSCell[] = (parsed.cells ?? [])
    .filter((c) => c.active)
    .map((c) => ({
      swType: VALID_SW.includes(c.swType as (typeof VALID_SW)[number])
        ? (c.swType as TOWSCell['swType'])
        : 'S',
      swIndex: Math.max(1, Math.round(c.swIndex ?? 1)),
      otType: VALID_OT.includes(c.otType as (typeof VALID_OT)[number])
        ? (c.otType as TOWSCell['otType'])
        : 'O',
      otIndex: Math.max(1, Math.round(c.otIndex ?? 1)),
      active: true,
      strategyCode: c.strategyCode ?? `${c.swType}${c.swIndex}${c.otType}${c.otIndex}`,
    }));

  const derivedStrategyCodes = cells.map((c) => c.strategyCode);

  return {
    type: 'tows-cross-matrix',
    strengths: ctx.swot?.strengths ?? [],
    weaknesses: ctx.swot?.weaknesses ?? [],
    opportunities: ctx.swot?.opportunities ?? [],
    threats: ctx.swot?.threats ?? [],
    cells,
    derivedStrategyCodes,
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<TOWSData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<TOWSData, 'type' | 'strengths' | 'weaknesses' | 'opportunities' | 'threats'>>(raw);

  const cells: TOWSCell[] = (parsed.cells ?? [])
    .filter((c) => c.active)
    .map((c) => ({
      swType: VALID_SW.includes(c.swType as (typeof VALID_SW)[number])
        ? (c.swType as TOWSCell['swType'])
        : 'S',
      swIndex: Math.max(1, Math.round(c.swIndex ?? 1)),
      otType: VALID_OT.includes(c.otType as (typeof VALID_OT)[number])
        ? (c.otType as TOWSCell['otType'])
        : 'O',
      otIndex: Math.max(1, Math.round(c.otIndex ?? 1)),
      active: true,
      strategyCode: c.strategyCode ?? `${c.swType}${c.swIndex}${c.otType}${c.otIndex}`,
    }));

  const derivedStrategyCodes = cells.map((c) => c.strategyCode);

  return {
    type: 'tows-cross-matrix',
    strengths: ctx.swot?.strengths ?? [],
    weaknesses: ctx.swot?.weaknesses ?? [],
    opportunities: ctx.swot?.opportunities ?? [],
    threats: ctx.swot?.threats ?? [],
    cells,
    derivedStrategyCodes,
    summary: parsed.summary ?? '',
  };
}

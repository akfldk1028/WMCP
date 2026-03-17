import { generateSection } from '@/lib/claude';
import type { PESTData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';
import { parsePESTResponse } from './parse';

export async function generate(ctx: PipelineContext): Promise<PESTData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  return parsePESTResponse(raw);
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<PESTData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  return parsePESTResponse(raw);
}

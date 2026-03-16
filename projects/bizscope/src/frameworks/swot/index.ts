import type { SWOTData, PipelineContext } from '../types';
import { mergeSWOT } from './merge';

export async function generate(ctx: PipelineContext): Promise<SWOTData> {
  if (!ctx.pest || !ctx.internalCapability) {
    throw new Error('PEST and InternalCapability data are required for SWOT');
  }

  return mergeSWOT(ctx.pest, ctx.internalCapability);
}

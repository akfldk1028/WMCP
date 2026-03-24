import type { SWOTData, PipelineContext } from '../types';
import { mergeSWOT } from './merge';

export async function generate(ctx: PipelineContext): Promise<SWOTData> {
  if (!ctx.keyEnvVariables || !ctx.internalCapability) {
    throw new Error('KeyEnvVariables and InternalCapability data are required for SWOT');
  }

  return mergeSWOT(ctx.keyEnvVariables, ctx.internalCapability);
}

import type { MatrixData, PipelineContext } from '../types';
import { computeMatrix } from './compute';

export async function generate(ctx: PipelineContext): Promise<MatrixData> {
  if (!ctx.pest) {
    throw new Error('PEST data is required for matrix computation');
  }

  return {
    type: 'possibility-impact-matrix',
    points: computeMatrix(ctx.pest.factors),
  };
}

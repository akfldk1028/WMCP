import type { PriorityMatrixData, PipelineContext } from '../types';
import { computePriorityMatrix } from './compute';

export async function generate(
  ctx: PipelineContext,
): Promise<PriorityMatrixData> {
  if (!ctx.strategyCombination || !ctx.sevenS) {
    throw new Error('StrategyCombination and 7S data are required for priority matrix');
  }

  const strategies = computePriorityMatrix(
    ctx.strategyCombination.strategies,
    ctx.sevenS.items,
  );

  const topPicks = strategies
    .filter((s) => s.quadrant === 'quick-win')
    .slice(0, 3)
    .map((s) => s.strategy);

  // If fewer than 3 quick-wins, fill with top major-projects
  if (topPicks.length < 3) {
    const majorProjects = strategies
      .filter((s) => s.quadrant === 'major-project')
      .slice(0, 3 - topPicks.length)
      .map((s) => s.strategy);
    topPicks.push(...majorProjects);
  }

  return {
    type: 'priority-matrix',
    strategies,
    topPicks,
  };
}

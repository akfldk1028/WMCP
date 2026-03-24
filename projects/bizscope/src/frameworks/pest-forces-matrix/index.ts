import type { PESTForcesMatrixData, PESTForcesMatrixCell, PipelineContext } from '../types';

export async function generate(ctx: PipelineContext): Promise<PESTForcesMatrixData> {
  if (!ctx.pest || !ctx.fiveForceDetail) {
    throw new Error('PEST and FiveForceDetail data are required');
  }

  const pestFactors = ctx.pest.factors;
  const axes = ctx.fiveForceDetail.axes;

  // Build cross-matrix cells: each PEST factor x each 5Forces axis
  const cells: PESTForcesMatrixCell[] = [];
  for (const factor of pestFactors) {
    for (const axis of axes) {
      const axisKey = axis.axis;
      const forceScore = factor.fiveForces[axisKey === 'rivalry' ? 'rivalry'
        : axisKey === 'newEntrants' ? 'newEntrants'
        : axisKey === 'supplierPower' ? 'supplierPower'
        : axisKey === 'buyerPower' ? 'buyerPower'
        : 'substitutes'] ?? 0;

      // Normalize to -5 to +5: threats have negative influence, opportunities positive
      const sign = factor.classification === 'threat' ? -1 : 1;
      const influenceScore = sign * forceScore;

      cells.push({
        pestFactorId: factor.id,
        pestFactor: factor.factor,
        pestCategory: factor.category,
        axis: axis.axis,
        influenceScore,
      });
    }
  }

  // Summarize per axis
  const axisImpactSummary = axes.map((axis) => {
    const axisCells = cells.filter((c) => c.axis === axis.axis);
    const totalImpact = axisCells.reduce((sum, c) => sum + c.influenceScore, 0);
    const sorted = [...axisCells].sort((a, b) => Math.abs(b.influenceScore) - Math.abs(a.influenceScore));
    return {
      axis: axis.axis,
      totalImpact,
      topInfluencers: sorted.slice(0, 3).map((c) => c.pestFactor),
    };
  });

  // Priority ranking of PEST factors by total absolute influence across all axes
  const factorInfluence = new Map<string, { label: string; total: number }>();
  for (const cell of cells) {
    const existing = factorInfluence.get(cell.pestFactorId);
    if (existing) {
      existing.total += Math.abs(cell.influenceScore);
    } else {
      factorInfluence.set(cell.pestFactorId, { label: cell.pestFactor, total: Math.abs(cell.influenceScore) });
    }
  }

  const priorityRanking = [...factorInfluence.entries()]
    .map(([, { label, total }]) => ({ pestFactor: label, totalInfluence: total, rank: 0 }))
    .sort((a, b) => b.totalInfluence - a.totalInfluence)
    .map((item, i) => ({ ...item, rank: i + 1 }));

  const topFactor = priorityRanking[0]?.pestFactor ?? '';
  const topAxis = [...axisImpactSummary].sort((a, b) => Math.abs(b.totalImpact) - Math.abs(a.totalImpact))[0]?.axis ?? '';

  return {
    type: 'pest-forces-matrix',
    cells,
    axisImpactSummary,
    priorityRanking,
    summary: `총 ${cells.length}개 교차점 분석. 가장 영향력 큰 요인: ${topFactor}. 가장 영향받는 축: ${topAxis}.`,
  };
}

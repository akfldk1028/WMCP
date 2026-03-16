import type { MatrixPoint, PESTFactor } from '../types';

function assignQuadrant(
  possibility: number,
  impact: number,
): MatrixPoint['quadrant'] {
  const highPossibility = possibility > 0.5;
  const highImpact = impact > 3;
  if (highPossibility && highImpact) return 'high-high';
  if (highPossibility && !highImpact) return 'high-low';
  if (!highPossibility && highImpact) return 'low-high';
  return 'low-low';
}

export function computeMatrix(factors: PESTFactor[]): MatrixPoint[] {
  return factors.map((f) => ({
    id: f.id,
    label: f.factor,
    possibility: f.probability,
    impact: f.impact,
    classification: f.classification,
    quadrant: assignQuadrant(f.probability, f.impact),
  }));
}

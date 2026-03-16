import type {
  StrategyItem,
  SevenSItem,
  PrioritizedStrategy,
} from '../types';

function assignQuadrant(
  difficulty: number,
  impact: number,
): PrioritizedStrategy['quadrant'] {
  const lowDifficulty = difficulty <= 3;
  const highImpact = impact > 3;
  if (lowDifficulty && highImpact) return 'quick-win';
  if (!lowDifficulty && highImpact) return 'major-project';
  if (lowDifficulty && !highImpact) return 'fill-in';
  return 'thankless';
}

/**
 * Adjust strategy difficulty/impact based on 7S alignment data.
 * If a strategy is referenced by 7S items, average their difficulty/impact in.
 */
function adjustWithSevenS(
  strategy: StrategyItem,
  sevenSItems: SevenSItem[],
): { difficulty: number; impact: number } {
  const related = sevenSItems.filter((item) =>
    item.relatedStrategies.some((rs) =>
      strategy.strategy.includes(rs) || rs.includes(strategy.strategy),
    ),
  );

  if (related.length === 0) {
    // Use feasibility inverted as difficulty (high feasibility = low difficulty)
    const difficulty = 6 - strategy.feasibility;
    return { difficulty, impact: strategy.impact };
  }

  const avgDifficulty =
    related.reduce((sum, i) => sum + i.difficulty, 0) / related.length;
  // Blend strategy feasibility (inverted) with 7S difficulty
  const baseDifficulty = 6 - strategy.feasibility;
  const difficulty = Math.round((baseDifficulty + avgDifficulty) / 2);

  const avgImpact =
    related.reduce((sum, i) => sum + i.impact, 0) / related.length;
  const impact = Math.round((strategy.impact + avgImpact) / 2);

  return {
    difficulty: Math.max(1, Math.min(5, difficulty)),
    impact: Math.max(1, Math.min(5, impact)),
  };
}

export function computePriorityMatrix(
  strategies: StrategyItem[],
  sevenSItems: SevenSItem[],
): PrioritizedStrategy[] {
  const prioritized: PrioritizedStrategy[] = strategies.map((s) => {
    const { difficulty, impact } = adjustWithSevenS(s, sevenSItems);
    return {
      id: s.id,
      strategy: s.strategy,
      difficulty,
      impact,
      quadrant: assignQuadrant(difficulty, impact),
      rank: 0,
    };
  });

  // Sort: quick-wins first, then by impact desc, then difficulty asc
  const quadrantOrder: Record<PrioritizedStrategy['quadrant'], number> = {
    'quick-win': 0,
    'major-project': 1,
    'fill-in': 2,
    'thankless': 3,
  };

  prioritized.sort((a, b) => {
    const qDiff = quadrantOrder[a.quadrant] - quadrantOrder[b.quadrant];
    if (qDiff !== 0) return qDiff;
    const impactDiff = b.impact - a.impact;
    if (impactDiff !== 0) return impactDiff;
    return a.difficulty - b.difficulty;
  });

  prioritized.forEach((s, i) => {
    s.rank = i + 1;
  });

  return prioritized;
}

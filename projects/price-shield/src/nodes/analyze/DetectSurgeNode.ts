import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceIssue, PriceSnapshot } from '../../types.js';

interface SurgeInput {
  url?: string;
  snapshots?: PriceSnapshot[];
}

interface SurgeConfig {
  url?: string;
  days?: number;
  surgeThreshold?: number;
}

interface SurgeOutput {
  issues: PriceIssue[];
  isSurging: boolean;
  currentPrice?: number;
  averagePrice?: number;
}

export class DetectSurgeNode implements NodeDefinition<SurgeInput, SurgeOutput, SurgeConfig> {
  readonly type = 'detect-surge';

  async execute(input: SurgeInput, config: SurgeConfig, ctx: PipelineContext): Promise<SurgeOutput> {
    const surgeThreshold = config.surgeThreshold ?? 20; // 20% above average
    let snapshots = input.snapshots;

    if (!snapshots || snapshots.length === 0) {
      const url = config.url ?? input.url;
      if (url) {
        snapshots = await ctx.storage.querySnapshots(url, undefined, config.days ?? 30);
      }
    }

    if (!snapshots || snapshots.length < 2) {
      return { issues: [], isSurging: false };
    }

    const sorted = [...snapshots].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
    const latest = sorted[sorted.length - 1];
    const history = sorted.slice(0, -1);

    const avgPrice = history.reduce((sum, s) => sum + s.priceCents, 0) / history.length;
    const surgePercent = avgPrice > 0 ? ((latest.priceCents - avgPrice) / avgPrice) * 100 : 0;

    const issues: PriceIssue[] = [];
    if (surgePercent >= surgeThreshold) {
      issues.push({
        type: 'surge-pricing',
        severity: Math.min(100, Math.round(surgePercent * 2)),
        description: `Current price is ${surgePercent.toFixed(1)}% above the ${history.length}-sample average`,
        evidence: `Current: ${(latest.priceCents / 100).toFixed(2)}, Avg: ${(avgPrice / 100).toFixed(2)}`,
        estimatedExtraCostCents: Math.round(latest.priceCents - avgPrice),
      });
    }

    return {
      issues,
      isSurging: issues.length > 0,
      currentPrice: latest.priceCents,
      averagePrice: Math.round(avgPrice),
    };
  }
}

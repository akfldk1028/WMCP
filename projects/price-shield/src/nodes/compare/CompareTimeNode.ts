import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceSnapshot, PriceTrend } from '../../types.js';

interface TimeInput {
  url?: string;
  snapshots?: PriceSnapshot[];
}

interface TimeConfig {
  url?: string;
  productName?: string;
  days?: number;
  stableThreshold?: number;
}

interface TimeOutput {
  trend: PriceTrend | null;
}

export class CompareTimeNode implements NodeDefinition<TimeInput, TimeOutput, TimeConfig> {
  readonly type = 'compare-time';

  async execute(input: TimeInput, config: TimeConfig, ctx: PipelineContext): Promise<TimeOutput> {
    let snapshots = input.snapshots;

    if (!snapshots || snapshots.length === 0) {
      const url = config.url ?? input.url;
      if (!url) return { trend: null };
      snapshots = await ctx.storage.querySnapshots(url, config.productName, config.days ?? 30);
    }

    if (snapshots.length < 2) return { trend: null };

    const sorted = [...snapshots].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const changePercent = first.priceCents > 0
      ? ((last.priceCents - first.priceCents) / first.priceCents) * 100
      : 0;

    const stableThreshold = config.stableThreshold ?? 3;
    const periodMs = new Date(last.capturedAt).getTime() - new Date(first.capturedAt).getTime();
    const periodDays = Math.max(1, Math.round(periodMs / 86_400_000));

    let direction: 'rising' | 'falling' | 'stable';
    if (Math.abs(changePercent) < stableThreshold) {
      direction = 'stable';
    } else if (changePercent > 0) {
      direction = 'rising';
    } else {
      direction = 'falling';
    }

    return {
      trend: {
        direction,
        changePercent: Math.round(changePercent * 10) / 10,
        periodDays,
        snapshots: sorted,
      },
    };
  }
}

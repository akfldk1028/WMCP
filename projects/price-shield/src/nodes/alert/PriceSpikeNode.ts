import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceIssue, PriceTrend } from '../../types.js';

interface SpikeInput {
  trend?: PriceTrend | null;
  url?: string;
}

interface SpikeConfig {
  spikeThreshold?: number;
  webhookUrl?: string;
}

interface SpikeOutput {
  spiked: boolean;
  spikePercent: number;
  issues: PriceIssue[];
  message: string;
  notified: boolean;
}

export class PriceSpikeNode implements NodeDefinition<SpikeInput, SpikeOutput, SpikeConfig> {
  readonly type = 'price-spike-alert';

  async execute(input: SpikeInput, config: SpikeConfig, _ctx: PipelineContext): Promise<SpikeOutput> {
    const spikeThreshold = config.spikeThreshold ?? 15;
    const trend = input.trend;

    if (!trend || trend.direction !== 'rising') {
      return { spiked: false, spikePercent: 0, issues: [], message: 'No price spike detected', notified: false };
    }

    const spikePercent = trend.changePercent;
    const spiked = spikePercent >= spikeThreshold;
    const issues: PriceIssue[] = [];
    let notified = false;

    if (spiked) {
      issues.push({
        type: 'surge-pricing',
        severity: Math.min(100, Math.round(spikePercent * 2)),
        description: `Price spiked ${spikePercent.toFixed(1)}% over ${trend.periodDays} days`,
        evidence: `${trend.snapshots.length} snapshots analyzed`,
        estimatedExtraCostCents: 0,
      });

      if (config.webhookUrl) {
        try {
          await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'price-spike',
              url: input.url ?? 'unknown',
              spikePercent,
              message: `Price spiked ${spikePercent.toFixed(1)}%`,
            }),
            signal: AbortSignal.timeout(5_000),
          });
          notified = true;
        } catch {
          // Webhook failure is non-fatal
        }
      }
    }

    return {
      spiked,
      spikePercent,
      issues,
      message: spiked
        ? `WARNING: Price spiked ${spikePercent.toFixed(1)}% — consider waiting`
        : `Price rose ${spikePercent.toFixed(1)}% (below ${spikeThreshold}% threshold)`,
      notified,
    };
  }
}

import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceTrend } from '../../types.js';

interface DropInput {
  trend?: PriceTrend | null;
  url?: string;
}

interface DropConfig {
  dropThreshold?: number;
  webhookUrl?: string;
}

interface DropOutput {
  dropped: boolean;
  dropPercent: number;
  message: string;
  notified: boolean;
}

export class PriceDropNode implements NodeDefinition<DropInput, DropOutput, DropConfig> {
  readonly type = 'price-drop-alert';

  async execute(input: DropInput, config: DropConfig, _ctx: PipelineContext): Promise<DropOutput> {
    const dropThreshold = config.dropThreshold ?? 10;
    const trend = input.trend;

    if (!trend || trend.direction !== 'falling') {
      return { dropped: false, dropPercent: 0, message: 'No price drop detected', notified: false };
    }

    const dropPercent = Math.abs(trend.changePercent);
    const dropped = dropPercent >= dropThreshold;
    let notified = false;

    if (dropped && config.webhookUrl) {
      try {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'price-drop',
            url: input.url ?? 'unknown',
            dropPercent,
            message: `Price dropped ${dropPercent.toFixed(1)}% over ${trend.periodDays} days`,
          }),
          signal: AbortSignal.timeout(5_000),
        });
        notified = true;
      } catch {
        // Webhook failure is non-fatal
      }
    }

    return {
      dropped,
      dropPercent,
      message: dropped
        ? `Price dropped ${dropPercent.toFixed(1)}% — good time to buy!`
        : `Price fell ${dropPercent.toFixed(1)}% (below ${dropThreshold}% threshold)`,
      notified,
    };
  }
}

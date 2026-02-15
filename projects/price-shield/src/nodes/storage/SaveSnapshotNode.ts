import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceComponent } from '../../types.js';

interface SaveInput {
  url?: string;
  prices?: PriceComponent[];
  userAgent?: string;
  productName?: string;
}

interface SaveConfig {
  productName?: string;
}

interface SaveOutput {
  snapshotId: string;
  savedAt: string;
}

export class SaveSnapshotNode implements NodeDefinition<SaveInput, SaveOutput, SaveConfig> {
  readonly type = 'save-snapshot';

  async execute(input: SaveInput, config: SaveConfig, ctx: PipelineContext): Promise<SaveOutput> {
    const url = input.url ?? 'unknown';
    const productName = config.productName ?? input.productName ?? 'unknown';
    const prices = input.prices ?? [];

    // Take the highest price as the representative price
    const priceCents = prices.length > 0
      ? Math.max(...prices.map((p) => p.amountCents))
      : 0;
    const currency = prices.length > 0 ? prices[0].currency : 'USD';

    const id = await ctx.storage.saveSnapshot({
      url,
      productName,
      priceCents,
      currency,
      capturedAt: new Date().toISOString(),
      userAgent: input.userAgent,
    });

    return { snapshotId: id, savedAt: new Date().toISOString() };
  }
}

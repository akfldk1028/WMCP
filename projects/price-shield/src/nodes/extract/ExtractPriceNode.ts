import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceComponent } from '../../types.js';
import { extractPrices } from '@wmcp/shopguard/price';

interface ExtractInput {
  html: string;
}

interface ExtractOutput {
  prices: PriceComponent[];
  count: number;
}

export class ExtractPriceNode implements NodeDefinition<ExtractInput, ExtractOutput> {
  readonly type = 'extract-price';

  async execute(input: ExtractInput, _config: Record<string, unknown>, _ctx: PipelineContext): Promise<ExtractOutput> {
    const prices = extractPrices(input.html);
    return { prices, count: prices.length };
  }
}

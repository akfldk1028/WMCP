import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceComponent, CrossSiteComparison } from '../../types.js';
import { extractPrices } from '@wmcp/shopguard/price';

interface CompareInput {
  urls?: string[];
}

interface CompareConfig {
  urls?: string[];
  productName?: string;
}

interface CompareOutput {
  comparison: CrossSiteComparison | null;
  sources: Array<{ url: string; prices: PriceComponent[] }>;
}

export class CompareSitesNode implements NodeDefinition<CompareInput, CompareOutput, CompareConfig> {
  readonly type = 'compare-sites';

  async execute(input: CompareInput, config: CompareConfig, _ctx: PipelineContext): Promise<CompareOutput> {
    const urls = config.urls ?? input.urls ?? [];
    if (urls.length < 2) {
      throw new Error('CompareSitesNode: at least 2 URLs required');
    }

    const productName = config.productName ?? 'product';
    const sources: Array<{ url: string; prices: PriceComponent[] }> = [];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 Chrome/146.0.0.0' },
          signal: AbortSignal.timeout(10_000),
        });
        const html = await res.text();
        sources.push({ url, prices: extractPrices(html) });
      } catch {
        sources.push({ url, prices: [] });
      }
    }

    // Find highest price per source (as representative)
    const withPrices = sources
      .filter((s) => s.prices.length > 0)
      .map((s) => {
        const maxPrice = Math.max(...s.prices.map((p) => p.amountCents));
        const currency = s.prices[0].currency;
        return { url: s.url, priceCents: maxPrice, currency };
      });

    if (withPrices.length < 2) {
      return { comparison: null, sources };
    }

    // Only compare same-currency
    const currency = withPrices[0].currency;
    const sameCurrency = withPrices.filter((s) => s.currency === currency);
    if (sameCurrency.length < 2) {
      return { comparison: null, sources };
    }

    const sorted = [...sameCurrency].sort((a, b) => a.priceCents - b.priceCents);
    const cheapest = sorted[0];
    const mostExpensive = sorted[sorted.length - 1];
    const spreadPercent = cheapest.priceCents > 0
      ? Math.round(((mostExpensive.priceCents - cheapest.priceCents) / cheapest.priceCents) * 100)
      : 0;

    return {
      comparison: {
        productName,
        cheapest: { url: cheapest.url, priceCents: cheapest.priceCents, currency },
        mostExpensive: { url: mostExpensive.url, priceCents: mostExpensive.priceCents, currency },
        spreadPercent,
        sources: sameCurrency,
      },
      sources,
    };
  }
}

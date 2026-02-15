import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceIssue, PriceComponent } from '../../types.js';
import { extractPrices } from '@wmcp/shopguard/price';

interface DynamicInput {
  url?: string;
}

interface DynamicConfig {
  url?: string;
  userAgents?: string[];
  threshold?: number;
}

interface DynamicOutput {
  issues: PriceIssue[];
  pricesByUA: Array<{ userAgent: string; prices: PriceComponent[] }>;
  isDynamic: boolean;
}

const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/146.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/146.0.0.0 Mobile Safari/537.36',
];

export class DetectDynamicPricingNode implements NodeDefinition<DynamicInput, DynamicOutput, DynamicConfig> {
  readonly type = 'detect-dynamic-pricing';

  async execute(input: DynamicInput, config: DynamicConfig, _ctx: PipelineContext): Promise<DynamicOutput> {
    const url = config.url ?? input.url;
    if (!url) throw new Error('DetectDynamicPricingNode: url is required');

    const userAgents = config.userAgents ?? DEFAULT_USER_AGENTS;
    const threshold = config.threshold ?? 5; // 5% difference triggers alert

    const pricesByUA: Array<{ userAgent: string; prices: PriceComponent[] }> = [];

    for (const ua of userAgents) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': ua },
          signal: AbortSignal.timeout(10_000),
        });
        const html = await res.text();
        const prices = extractPrices(html);
        pricesByUA.push({ userAgent: ua, prices });
      } catch {
        pricesByUA.push({ userAgent: ua, prices: [] });
      }
    }

    const issues: PriceIssue[] = [];
    const maxPrices = pricesByUA
      .map((p) => p.prices.length > 0 ? Math.max(...p.prices.map((x) => x.amountCents)) : 0)
      .filter((p) => p > 0);

    if (maxPrices.length >= 2) {
      const min = Math.min(...maxPrices);
      const max = Math.max(...maxPrices);
      const diffPercent = min > 0 ? ((max - min) / min) * 100 : 0;

      if (diffPercent >= threshold) {
        issues.push({
          type: 'dynamic-pricing',
          severity: Math.min(100, Math.round(diffPercent * 3)),
          description: `Price varies ${diffPercent.toFixed(1)}% across different devices/browsers`,
          evidence: `Min: ${(min / 100).toFixed(2)}, Max: ${(max / 100).toFixed(2)}`,
          estimatedExtraCostCents: max - min,
        });
      }
    }

    return {
      issues,
      pricesByUA,
      isDynamic: issues.length > 0,
    };
  }
}

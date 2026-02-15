import type { Pipeline } from '../runtime/types.js';

/**
 * Preset: Cross-site price comparison.
 * Fetches multiple URLs, compares prices across them.
 */
export function createCompareSitesPipeline(
  urls: string[],
  productName?: string,
): Pipeline {
  return {
    nodes: [
      { id: 'compare', type: 'compare-sites', config: { urls, productName: productName ?? 'product' } },
    ],
    edges: [],
  };
}

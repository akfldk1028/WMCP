import type { Pipeline } from '../runtime/types.js';

/**
 * Preset: Single-page price analysis.
 * Fetches a URL, extracts prices, detects issues, scores, and generates a report.
 */
export function createAnalyzePagePipeline(url: string, format: 'json' | 'markdown' | 'text' = 'json'): Pipeline {
  return {
    nodes: [
      { id: 'fetch', type: 'fetch-page', config: { url } },
      { id: 'extract', type: 'extract-price', config: {} },
      { id: 'fees', type: 'detect-hidden-fees', config: {} },
      { id: 'traps', type: 'detect-subscription-traps', config: {} },
      { id: 'score', type: 'score', config: {} },
      { id: 'report', type: 'report', config: { format } },
    ],
    edges: [
      { from: 'fetch', to: 'extract' },
      { from: 'fetch', to: 'fees' },
      { from: 'fetch', to: 'traps' },
      { from: 'fees', to: 'score' },
      { from: 'traps', to: 'score' },
      { from: 'fetch', to: 'report', mapping: { url: 'url' } },
      { from: 'extract', to: 'report' },
      { from: 'score', to: 'report' },
    ],
  };
}

import type { Pipeline } from '../runtime/types.js';

/**
 * Preset: Price tracking pipeline.
 * Fetches current price, saves snapshot, queries history,
 * analyzes time trend, and checks for drops/spikes.
 */
export function createTrackPricePipeline(
  url: string,
  productName: string,
  options?: { days?: number; dropThreshold?: number; spikeThreshold?: number; webhookUrl?: string },
): Pipeline {
  const days = options?.days ?? 30;

  return {
    nodes: [
      { id: 'fetch', type: 'fetch-page', config: { url } },
      { id: 'extract', type: 'extract-price', config: {} },
      { id: 'save', type: 'save-snapshot', config: { productName } },
      { id: 'history', type: 'query-history', config: { url, productName, days } },
      { id: 'trend', type: 'compare-time', config: { url, productName, days } },
      { id: 'drop', type: 'price-drop-alert', config: {
        dropThreshold: options?.dropThreshold ?? 10,
        webhookUrl: options?.webhookUrl,
      } },
      { id: 'spike', type: 'price-spike-alert', config: {
        spikeThreshold: options?.spikeThreshold ?? 15,
        webhookUrl: options?.webhookUrl,
      } },
    ],
    edges: [
      { from: 'fetch', to: 'extract' },
      { from: 'fetch', to: 'save', mapping: { url: 'url', userAgent: 'userAgent' } },
      { from: 'extract', to: 'save' },
      { from: 'save', to: 'history' },
      { from: 'history', to: 'trend' },
      { from: 'trend', to: 'drop' },
      { from: 'fetch', to: 'drop', mapping: { url: 'url' } },
      { from: 'trend', to: 'spike' },
      { from: 'fetch', to: 'spike', mapping: { url: 'url' } },
    ],
  };
}

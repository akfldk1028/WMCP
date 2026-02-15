import { defaultRegistry } from '../runtime/registry.js';

// Input
import { FetchPageNode } from './input/FetchPageNode.js';

// Extract
import { ExtractPriceNode } from './extract/ExtractPriceNode.js';

// Analyze
import { DetectHiddenFeesNode } from './analyze/DetectHiddenFeesNode.js';
import { DetectTrapsNode } from './analyze/DetectTrapsNode.js';
import { DetectDynamicPricingNode } from './analyze/DetectDynamicNode.js';
import { DetectSurgeNode } from './analyze/DetectSurgeNode.js';

// Compare
import { CompareSitesNode } from './compare/CompareSitesNode.js';
import { CompareTimeNode } from './compare/CompareTimeNode.js';

// Alert
import { PriceDropNode } from './alert/PriceDropNode.js';
import { PriceSpikeNode } from './alert/PriceSpikeNode.js';

// Storage
import { SaveSnapshotNode } from './storage/SaveSnapshotNode.js';
import { QueryHistoryNode } from './storage/QueryHistoryNode.js';

// Output
import { ScoreNode } from './output/ScoreNode.js';
import { ReportNode } from './output/ReportNode.js';

export function registerAllNodes(registry = defaultRegistry): void {
  registry.register('fetch-page', () => new FetchPageNode());
  registry.register('extract-price', () => new ExtractPriceNode());
  registry.register('detect-hidden-fees', () => new DetectHiddenFeesNode());
  registry.register('detect-subscription-traps', () => new DetectTrapsNode());
  registry.register('detect-dynamic-pricing', () => new DetectDynamicPricingNode());
  registry.register('detect-surge', () => new DetectSurgeNode());
  registry.register('compare-sites', () => new CompareSitesNode());
  registry.register('compare-time', () => new CompareTimeNode());
  registry.register('price-drop-alert', () => new PriceDropNode());
  registry.register('price-spike-alert', () => new PriceSpikeNode());
  registry.register('save-snapshot', () => new SaveSnapshotNode());
  registry.register('query-history', () => new QueryHistoryNode());
  registry.register('score', () => new ScoreNode());
  registry.register('report', () => new ReportNode());
}

// Re-export all node classes
export { FetchPageNode } from './input/FetchPageNode.js';
export { ExtractPriceNode } from './extract/ExtractPriceNode.js';
export { DetectHiddenFeesNode } from './analyze/DetectHiddenFeesNode.js';
export { DetectTrapsNode } from './analyze/DetectTrapsNode.js';
export { DetectDynamicPricingNode } from './analyze/DetectDynamicNode.js';
export { DetectSurgeNode } from './analyze/DetectSurgeNode.js';
export { CompareSitesNode } from './compare/CompareSitesNode.js';
export { CompareTimeNode } from './compare/CompareTimeNode.js';
export { PriceDropNode } from './alert/PriceDropNode.js';
export { PriceSpikeNode } from './alert/PriceSpikeNode.js';
export { SaveSnapshotNode } from './storage/SaveSnapshotNode.js';
export { QueryHistoryNode } from './storage/QueryHistoryNode.js';
export { ScoreNode } from './output/ScoreNode.js';
export { ReportNode } from './output/ReportNode.js';

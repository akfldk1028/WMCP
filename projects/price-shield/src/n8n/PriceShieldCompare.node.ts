import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class PriceShieldCompare implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Price Shield Compare',
    name: 'priceShieldCompare',
    group: ['transform'],
    version: 1,
    description: 'Compare prices across multiple sites for the same product',
    defaults: { name: 'Price Shield Compare' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'URLs',
        name: 'urls',
        type: 'string',
        default: '',
        required: true,
        description: 'Comma-separated URLs to compare',
      },
      {
        displayName: 'Product Name',
        name: 'productName',
        type: 'string',
        default: 'product',
        description: 'Name of the product being compared',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const urlStr = this.getNodeParameter('urls', i) as string;
      const productName = this.getNodeParameter('productName', i) as string;
      const urls = urlStr.split(',').map((u) => u.trim()).filter(Boolean);

      const { defaultRegistry, PipelineExecutor } = await import('../runtime/index.js');
      const { registerAllNodes } = await import('../nodes/index.js');
      const { MemoryAdapter } = await import('../storage/memory.js');
      const { createCompareSitesPipeline } = await import('../presets/compare-sites.js');

      registerAllNodes(defaultRegistry);
      const executor = new PipelineExecutor(defaultRegistry);
      const pipeline = createCompareSitesPipeline(urls, productName);
      const ctx = { storage: new MemoryAdapter(), results: new Map() };

      const result = await executor.execute(pipeline, ctx);
      const compare = result.outputs.get('compare') as { comparison: unknown } | undefined;

      results.push({
        json: {
          productName,
          urls,
          comparison: compare?.comparison ?? null,
          durationMs: result.durationMs,
        },
      });
    }

    return [results];
  }
}

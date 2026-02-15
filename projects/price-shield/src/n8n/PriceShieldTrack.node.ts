import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class PriceShieldTrack implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Price Shield Track',
    name: 'priceShieldTrack',
    group: ['transform'],
    version: 1,
    description: 'Track price changes over time with drop/spike alerts',
    defaults: { name: 'Price Shield Track' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        required: true,
        description: 'URL to track',
      },
      {
        displayName: 'Product Name',
        name: 'productName',
        type: 'string',
        default: 'product',
        description: 'Name of the product being tracked',
      },
      {
        displayName: 'History Days',
        name: 'days',
        type: 'number',
        default: 30,
        description: 'Number of days of history to analyze',
      },
      {
        displayName: 'Drop Threshold %',
        name: 'dropThreshold',
        type: 'number',
        default: 10,
        description: 'Percentage drop to trigger alert',
      },
      {
        displayName: 'Spike Threshold %',
        name: 'spikeThreshold',
        type: 'number',
        default: 15,
        description: 'Percentage spike to trigger alert',
      },
      {
        displayName: 'Webhook URL',
        name: 'webhookUrl',
        type: 'string',
        default: '',
        description: 'Optional webhook for alerts',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const url = this.getNodeParameter('url', i) as string;
      const productName = this.getNodeParameter('productName', i) as string;
      const days = this.getNodeParameter('days', i) as number;
      const dropThreshold = this.getNodeParameter('dropThreshold', i) as number;
      const spikeThreshold = this.getNodeParameter('spikeThreshold', i) as number;
      const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;

      const { defaultRegistry, PipelineExecutor } = await import('../runtime/index.js');
      const { registerAllNodes } = await import('../nodes/index.js');
      const { MemoryAdapter } = await import('../storage/memory.js');
      const { createTrackPricePipeline } = await import('../presets/track-price.js');

      registerAllNodes(defaultRegistry);
      const executor = new PipelineExecutor(defaultRegistry);
      const pipeline = createTrackPricePipeline(url, productName, {
        days,
        dropThreshold,
        spikeThreshold,
        webhookUrl: webhookUrl || undefined,
      });
      const ctx = { storage: new MemoryAdapter(), results: new Map() };

      const result = await executor.execute(pipeline, ctx);

      results.push({
        json: {
          url,
          productName,
          drop: result.outputs.get('drop') ?? null,
          spike: result.outputs.get('spike') ?? null,
          durationMs: result.durationMs,
        },
      });
    }

    return [results];
  }
}

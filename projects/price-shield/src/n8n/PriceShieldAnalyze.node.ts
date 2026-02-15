import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class PriceShieldAnalyze implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Price Shield Analyze',
    name: 'priceShieldAnalyze',
    group: ['transform'],
    version: 1,
    description: 'Analyze a page for hidden fees, subscription traps, and pricing issues',
    defaults: { name: 'Price Shield Analyze' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        required: true,
        description: 'URL of the page to analyze',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'JSON', value: 'json' },
          { name: 'Markdown', value: 'markdown' },
          { name: 'Text', value: 'text' },
        ],
        default: 'json',
        description: 'Output format for the report',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const url = this.getNodeParameter('url', i) as string;
      const format = this.getNodeParameter('format', i) as string;

      // Dynamic import to avoid bundling issues
      const { defaultRegistry, PipelineExecutor } = await import('../runtime/index.js');
      const { registerAllNodes } = await import('../nodes/index.js');
      const { MemoryAdapter } = await import('../storage/memory.js');
      const { createAnalyzePagePipeline } = await import('../presets/analyze-page.js');

      registerAllNodes(defaultRegistry);
      const executor = new PipelineExecutor(defaultRegistry);
      const pipeline = createAnalyzePagePipeline(url, format as 'json' | 'markdown' | 'text');
      const ctx = { storage: new MemoryAdapter(), results: new Map() };

      const result = await executor.execute(pipeline, ctx);
      const report = result.outputs.get('report') as { report: unknown; formatted: string } | undefined;

      results.push({
        json: {
          url,
          report: report?.report ?? {},
          formatted: report?.formatted ?? '',
          durationMs: result.durationMs,
        },
      });
    }

    return [results];
  }
}

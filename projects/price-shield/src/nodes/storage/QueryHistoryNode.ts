import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceSnapshot } from '../../types.js';

interface QueryInput {
  url?: string;
}

interface QueryConfig {
  url?: string;
  productName?: string;
  days?: number;
}

interface QueryOutput {
  snapshots: PriceSnapshot[];
  count: number;
}

export class QueryHistoryNode implements NodeDefinition<QueryInput, QueryOutput, QueryConfig> {
  readonly type = 'query-history';

  async execute(input: QueryInput, config: QueryConfig, ctx: PipelineContext): Promise<QueryOutput> {
    const url = config.url ?? input.url;
    if (!url) throw new Error('QueryHistoryNode: url is required');

    const snapshots = await ctx.storage.querySnapshots(
      url,
      config.productName,
      config.days ?? 30,
    );

    return { snapshots, count: snapshots.length };
  }
}

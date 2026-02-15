import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceIssue } from '../../types.js';
import { detectSubscriptionTraps } from '@wmcp/shopguard/price';

interface TrapsInput {
  html: string;
}

interface TrapsOutput {
  issues: PriceIssue[];
}

export class DetectTrapsNode implements NodeDefinition<TrapsInput, TrapsOutput> {
  readonly type = 'detect-subscription-traps';

  async execute(input: TrapsInput, _config: Record<string, unknown>, _ctx: PipelineContext): Promise<TrapsOutput> {
    const issues = detectSubscriptionTraps(input.html);
    return { issues };
  }
}

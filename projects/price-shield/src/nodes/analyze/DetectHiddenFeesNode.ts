import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceIssue } from '../../types.js';
import { detectHiddenFees } from '@wmcp/shopguard/price';

interface FeesInput {
  html: string;
}

interface FeesOutput {
  issues: PriceIssue[];
  totalHiddenFeeCents: number;
}

export class DetectHiddenFeesNode implements NodeDefinition<FeesInput, FeesOutput> {
  readonly type = 'detect-hidden-fees';

  async execute(input: FeesInput, _config: Record<string, unknown>, _ctx: PipelineContext): Promise<FeesOutput> {
    const issues = detectHiddenFees(input.html);
    const totalHiddenFeeCents = issues.reduce((sum, i) => sum + i.estimatedExtraCostCents, 0);
    return { issues, totalHiddenFeeCents };
  }
}

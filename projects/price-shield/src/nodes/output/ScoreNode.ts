import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceIssue } from '../../types.js';
import { calculatePriceTrustScore } from '@wmcp/shopguard/price';

interface ScoreInput {
  issues: PriceIssue[];
}

interface ScoreOutput {
  trustScore: number;
  grade: string;
  issueCount: number;
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  if (score >= 20) return 'E';
  return 'F';
}

export class ScoreNode implements NodeDefinition<ScoreInput, ScoreOutput> {
  readonly type = 'score';

  async execute(input: ScoreInput, _config: Record<string, unknown>, _ctx: PipelineContext): Promise<ScoreOutput> {
    // Collect issues from all incoming nodes (may arrive as separate fields)
    const allIssues: PriceIssue[] = [];
    if (Array.isArray(input.issues)) {
      allIssues.push(...input.issues);
    }
    // Also check for other issue-bearing fields merged from multiple parents
    for (const [key, val] of Object.entries(input)) {
      if (key !== 'issues' && Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === 'object' && 'type' in item && 'severity' in item) {
            allIssues.push(item as PriceIssue);
          }
        }
      }
    }

    const trustScore = calculatePriceTrustScore(allIssues);
    return {
      trustScore,
      grade: scoreToGrade(trustScore),
      issueCount: allIssues.length,
    };
  }
}

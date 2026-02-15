import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';
import type { PriceComponent, PriceIssue, AnalysisReport } from '../../types.js';

interface ReportInput {
  url?: string;
  prices?: PriceComponent[];
  issues?: PriceIssue[];
  trustScore?: number;
  grade?: string;
  [key: string]: unknown;
}

interface ReportConfig {
  format?: 'json' | 'markdown' | 'text';
}

interface ReportOutput {
  report: AnalysisReport;
  formatted: string;
}

const GRADE_SUMMARIES: Record<string, string> = {
  A: 'Highly trustworthy — no significant issues detected',
  B: 'Generally trustworthy — minor concerns found',
  C: 'Mixed signals — some suspicious patterns detected',
  D: 'Caution advised — multiple warning signs',
  E: 'High risk — significant manipulation detected',
  F: 'Avoid — strong evidence of deception',
};

export class ReportNode implements NodeDefinition<ReportInput, ReportOutput, ReportConfig> {
  readonly type = 'report';

  async execute(input: ReportInput, config: ReportConfig, _ctx: PipelineContext): Promise<ReportOutput> {
    const format = config.format ?? 'json';
    const grade = input.grade ?? '?';
    const trustScore = input.trustScore ?? 0;

    // Collect all issues from merged inputs
    const allIssues: PriceIssue[] = [];
    for (const val of Object.values(input)) {
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === 'object' && 'type' in item && 'severity' in item && 'description' in item) {
            allIssues.push(item as PriceIssue);
          }
        }
      }
    }

    const report: AnalysisReport = {
      url: (input.url as string) ?? 'unknown',
      analyzedAt: new Date().toISOString(),
      prices: input.prices ?? [],
      issues: allIssues,
      trustScore,
      grade,
      summary: GRADE_SUMMARIES[grade] ?? 'Analysis complete',
    };

    let formatted: string;
    if (format === 'markdown') {
      formatted = formatMarkdown(report);
    } else if (format === 'text') {
      formatted = formatText(report);
    } else {
      formatted = JSON.stringify(report, null, 2);
    }

    return { report, formatted };
  }
}

function formatMarkdown(r: AnalysisReport): string {
  const lines = [
    `# Price Shield Report`,
    ``,
    `**URL:** ${r.url}`,
    `**Score:** ${r.trustScore}/100 (Grade ${r.grade})`,
    `**Summary:** ${r.summary}`,
    ``,
  ];

  if (r.prices.length > 0) {
    lines.push(`## Detected Prices`, ``);
    for (const p of r.prices) {
      lines.push(`- ${p.label}: ${p.currency} ${(p.amountCents / 100).toFixed(2)}`);
    }
    lines.push(``);
  }

  if (r.issues.length > 0) {
    lines.push(`## Issues Found`, ``);
    for (const issue of r.issues) {
      lines.push(`- **${issue.type}** (severity ${issue.severity}): ${issue.description}`);
    }
    lines.push(``);
  }

  return lines.join('\n');
}

function formatText(r: AnalysisReport): string {
  const lines = [
    `=== Price Shield Report ===`,
    `URL: ${r.url}`,
    `Score: ${r.trustScore}/100 (${r.grade})`,
    `Summary: ${r.summary}`,
    `Prices: ${r.prices.length}`,
    `Issues: ${r.issues.length}`,
  ];
  for (const issue of r.issues) {
    lines.push(`  [${issue.type}] ${issue.description}`);
  }
  return lines.join('\n');
}

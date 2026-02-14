export interface ToolVariant {
  id: string;
  toolName: string;
  description: string;
  weight: number; // 0-1, traffic allocation
}

export interface ABTest {
  id: string;
  toolName: string;
  variants: ToolVariant[];
  startedAt: string;
  status: 'running' | 'paused' | 'completed';
  winnerVariantId?: string;
}

export interface ToolMetrics {
  variantId: string;
  impressions: number;   // times this description was shown to agents
  selections: number;    // times agent selected this tool
  completions: number;   // times tool call succeeded
  errors: number;
  avgResponseTime: number;
  selectionRate: number; // selections / impressions
  successRate: number;   // completions / selections
  score: number;         // composite score
}

export interface OptimizationResult {
  original: string;
  optimized: string;
  changes: OptimizationChange[];
  expectedImprovement: number; // estimated % improvement
}

export interface OptimizationChange {
  type: 'add_action_verb' | 'add_constraints' | 'add_examples' | 'simplify' | 'add_input_description' | 'remove_ambiguity';
  description: string;
  before: string;
  after: string;
}

export interface DescriptionTemplate {
  pattern: string;
  category: 'crud' | 'search' | 'transform' | 'navigate' | 'auth' | 'general';
  template: string;
  example: string;
}

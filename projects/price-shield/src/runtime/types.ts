/**
 * Core node pipeline runtime types.
 */
import type { StorageAdapter } from '../storage/adapter.js';

/**
 * A pipeline node definition. Each node type implements this.
 */
export interface NodeDefinition<I = unknown, O = unknown, C = Record<string, unknown>> {
  readonly type: string;
  execute(input: I, config: C, ctx: PipelineContext): Promise<O>;
}

/**
 * A node instance in a pipeline graph.
 */
export interface PipelineNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

/**
 * An edge connecting two nodes.
 */
export interface Edge {
  from: string;
  to: string;
  mapping?: Record<string, string>;
}

/**
 * A complete pipeline definition (DAG).
 */
export interface Pipeline {
  nodes: PipelineNode[];
  edges: Edge[];
}

/**
 * Shared context available to all nodes during execution.
 */
export interface PipelineContext {
  storage: StorageAdapter;
  results: Map<string, unknown>;
}

/**
 * Result of a pipeline execution.
 */
export interface PipelineResult {
  outputs: Map<string, unknown>;
  executionOrder: string[];
  durationMs: number;
}

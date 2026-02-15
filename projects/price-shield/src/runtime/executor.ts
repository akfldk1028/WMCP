import type { Pipeline, PipelineContext, PipelineNode, PipelineResult, Edge } from './types.js';
import type { NodeRegistry } from './registry.js';

/**
 * Topological sort (Kahn's algorithm).
 * Returns node IDs in execution order.
 */
function topoSort(nodes: PipelineNode[], edges: Edge[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    adjacency.get(edge.from)?.push(edge.to);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  if (order.length !== nodes.length) {
    throw new Error('Pipeline contains a cycle — cannot execute');
  }

  return order;
}

/**
 * Merge outputs from parent nodes into a single input object.
 * If mapping is specified on an edge, renames fields accordingly.
 */
function mergeInputs(
  nodeId: string,
  edges: Edge[],
  results: Map<string, unknown>,
): Record<string, unknown> {
  const incomingEdges = edges.filter((e) => e.to === nodeId);
  if (incomingEdges.length === 0) return {};

  const merged: Record<string, unknown> = {};

  for (const edge of incomingEdges) {
    const parentOutput = results.get(edge.from);
    if (parentOutput === undefined) continue;

    if (typeof parentOutput === 'object' && parentOutput !== null && !Array.isArray(parentOutput)) {
      const out = parentOutput as Record<string, unknown>;
      if (edge.mapping) {
        for (const [fromKey, toKey] of Object.entries(edge.mapping)) {
          if (fromKey in out) {
            merged[toKey] = out[fromKey];
          }
        }
      } else {
        Object.assign(merged, out);
      }
    } else {
      // Scalar/array output — store under source node id
      merged[edge.from] = parentOutput;
    }
  }

  return merged;
}

/**
 * Execute a pipeline by topologically sorting its nodes
 * and running them sequentially.
 */
export class PipelineExecutor {
  constructor(private registry: NodeRegistry) {}

  async execute(pipeline: Pipeline, ctx: PipelineContext): Promise<PipelineResult> {
    const start = Date.now();
    const order = topoSort(pipeline.nodes, pipeline.edges);
    const nodeMap = new Map(pipeline.nodes.map((n) => [n.id, n]));

    for (const nodeId of order) {
      const pNode = nodeMap.get(nodeId)!;
      const definition = this.registry.create(pNode.type);
      const input = mergeInputs(nodeId, pipeline.edges, ctx.results);
      const output = await definition.execute(input, pNode.config, ctx);
      ctx.results.set(nodeId, output);
    }

    return {
      outputs: ctx.results,
      executionOrder: order,
      durationMs: Date.now() - start,
    };
  }
}

import { describe, it, expect, beforeEach } from 'vitest';
import { NodeRegistry } from '../../src/runtime/registry.js';
import { PipelineExecutor } from '../../src/runtime/executor.js';
import { MemoryAdapter } from '../../src/storage/memory.js';
import type { Pipeline, PipelineContext, NodeDefinition } from '../../src/runtime/types.js';

// Simple test nodes
class DoubleNode implements NodeDefinition<{ value: number }, { value: number }> {
  readonly type = 'double';
  async execute(input: { value: number }) {
    return { value: input.value * 2 };
  }
}

class AddNode implements NodeDefinition<{ a: number; b: number }, { value: number }> {
  readonly type = 'add';
  async execute(input: { a: number; b: number }) {
    return { value: (input.a ?? 0) + (input.b ?? 0) };
  }
}

class SourceNode implements NodeDefinition<unknown, { value: number }> {
  readonly type = 'source';
  async execute(_input: unknown, config: Record<string, unknown>) {
    return { value: (config.value as number) ?? 0 };
  }
}

describe('PipelineExecutor', () => {
  let registry: NodeRegistry;
  let executor: PipelineExecutor;
  let ctx: PipelineContext;

  beforeEach(() => {
    registry = new NodeRegistry();
    registry.register('source', () => new SourceNode());
    registry.register('double', () => new DoubleNode());
    registry.register('add', () => new AddNode());
    executor = new PipelineExecutor(registry);
    ctx = { storage: new MemoryAdapter(), results: new Map() };
  });

  it('executes a single node', async () => {
    const pipeline: Pipeline = {
      nodes: [{ id: 'src', type: 'source', config: { value: 5 } }],
      edges: [],
    };
    const result = await executor.execute(pipeline, ctx);
    expect(result.outputs.get('src')).toEqual({ value: 5 });
    expect(result.executionOrder).toEqual(['src']);
  });

  it('executes a linear pipeline', async () => {
    const pipeline: Pipeline = {
      nodes: [
        { id: 'src', type: 'source', config: { value: 3 } },
        { id: 'dbl', type: 'double', config: {} },
      ],
      edges: [{ from: 'src', to: 'dbl' }],
    };
    const result = await executor.execute(pipeline, ctx);
    expect(result.outputs.get('dbl')).toEqual({ value: 6 });
  });

  it('executes a DAG with fan-in', async () => {
    const pipeline: Pipeline = {
      nodes: [
        { id: 'a', type: 'source', config: { value: 10 } },
        { id: 'b', type: 'source', config: { value: 20 } },
        { id: 'sum', type: 'add', config: {} },
      ],
      edges: [
        { from: 'a', to: 'sum', mapping: { value: 'a' } },
        { from: 'b', to: 'sum', mapping: { value: 'b' } },
      ],
    };
    const result = await executor.execute(pipeline, ctx);
    expect(result.outputs.get('sum')).toEqual({ value: 30 });
  });

  it('detects cycles', async () => {
    const pipeline: Pipeline = {
      nodes: [
        { id: 'a', type: 'source', config: { value: 1 } },
        { id: 'b', type: 'double', config: {} },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'a' },
      ],
    };
    await expect(executor.execute(pipeline, ctx)).rejects.toThrow('cycle');
  });

  it('throws on unknown node type', async () => {
    const pipeline: Pipeline = {
      nodes: [{ id: 'x', type: 'nonexistent', config: {} }],
      edges: [],
    };
    await expect(executor.execute(pipeline, ctx)).rejects.toThrow('Unknown node type');
  });

  it('reports execution duration', async () => {
    const pipeline: Pipeline = {
      nodes: [{ id: 's', type: 'source', config: { value: 1 } }],
      edges: [],
    };
    const result = await executor.execute(pipeline, ctx);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

import type { NodeDefinition } from './types.js';

type NodeFactory = () => NodeDefinition;

/**
 * Registry mapping node type strings to their factory functions.
 */
export class NodeRegistry {
  private factories = new Map<string, NodeFactory>();

  register(type: string, factory: NodeFactory): void {
    this.factories.set(type, factory);
  }

  create(type: string): NodeDefinition {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`Unknown node type: "${type}". Available: ${[...this.factories.keys()].join(', ')}`);
    }
    return factory();
  }

  has(type: string): boolean {
    return this.factories.has(type);
  }

  types(): string[] {
    return [...this.factories.keys()];
  }
}

/** Global default registry */
export const defaultRegistry = new NodeRegistry();

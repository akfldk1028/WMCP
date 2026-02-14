import type { DiscoveryConfig, ToolInfo, ToolRegistration } from './types.js';

/**
 * Generate a unique identifier, preferring crypto.randomUUID where available
 * and falling back to a Math.random-based UUID v4 approximation.
 */
function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // crypto may exist but randomUUID may throw in insecure contexts
  }

  // Fallback: RFC-4122 v4-ish UUID via Math.random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * ToolDiscovery maintains a local registry of tools and supports publishing
 * tool definitions to a remote registry, as well as generating JSON-LD
 * manifests and HTML meta tags for tool discovery.
 */
export class ToolDiscovery {
  private readonly config: DiscoveryConfig;
  private readonly registry: Map<string, ToolInfo> = new Map();

  constructor(config: DiscoveryConfig = { enabled: false }) {
    this.config = config;
  }

  /** Whether discovery is enabled. */
  get enabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Register a tool in the local discovery registry.
   * If `autoPublish` is enabled and a `registryUrl` is configured, the tool
   * definition will also be POSTed to the remote registry.
   */
  register(tool: ToolRegistration): void {
    const info: ToolInfo = {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      registeredAt: Date.now(),
      callCount: 0,
      avgResponseTime: 0,
    };

    this.registry.set(tool.name, info);

    if (this.config.autoPublish) {
      // Fire-and-forget: do not block registration on remote publishing
      this.publish(info).catch(() => {
        // Silently ignore publish failures during auto-publish
      });
    }
  }

  /**
   * Remove a tool from the local registry.
   */
  unregister(toolName: string): void {
    this.registry.delete(toolName);
  }

  /**
   * List all registered tools.
   */
  getTools(): ToolInfo[] {
    return Array.from(this.registry.values());
  }

  /**
   * Simple text search across tool names and descriptions.
   * Returns tools whose name or description contains the query (case-insensitive).
   */
  findTool(query: string): ToolInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.getTools().filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Update runtime stats for a tool after a call completes.
   */
  recordCall(toolName: string, duration: number): void {
    const info = this.registry.get(toolName);
    if (!info) return;

    const totalTime = info.avgResponseTime * info.callCount + duration;
    info.callCount += 1;
    info.avgResponseTime = totalTime / info.callCount;
    info.lastCalledAt = Date.now();
  }

  /**
   * POST a tool definition to the configured remote registry URL.
   * Requires `registryUrl` to be set in the discovery config.
   */
  async publish(tool: ToolInfo): Promise<void> {
    if (!this.config.registryUrl) {
      return;
    }

    const payload = {
      ...tool,
      metadata: this.config.metadata ?? {},
      publishedAt: Date.now(),
    };

    const response = await fetch(this.config.registryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to publish tool "${tool.name}" to registry: ${response.status} ${response.statusText}`,
      );
    }
  }

  /**
   * Generate a JSON-LD manifest of all registered tools using
   * Schema.org Action vocabulary.
   */
  toManifest(): string {
    const tools = this.getTools();

    const manifest = {
      '@context': 'https://schema.org',
      '@type': 'WebAPI',
      '@id': generateId(),
      name: this.config.metadata?.siteName ?? 'WebMCP Tool Registry',
      description: this.config.metadata?.description ?? 'Tools available via WebMCP',
      potentialAction: tools.map((tool) => ({
        '@type': 'Action',
        name: tool.name,
        description: tool.description,
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `webmcp://tool/${tool.name}`,
          contentType: 'application/json',
        },
        'input': tool.inputSchema,
        additionalProperty: {
          '@type': 'PropertyValue',
          name: 'callCount',
          value: tool.callCount,
        },
      })),
      ...(this.config.metadata ?? {}),
    };

    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Generate HTML meta tags and a JSON-LD script block that can be
   * embedded in a page for tool discovery (similar to schema.org markup).
   */
  toHTML(): string {
    const tools = this.getTools();
    const siteName = this.config.metadata?.siteName ?? 'WebMCP Tool Registry';
    const lines: string[] = [];

    // Meta tags for general discovery
    lines.push(`<meta name="webmcp:tools" content="${tools.length}">`);
    lines.push(`<meta name="webmcp:registry" content="${siteName}">`);

    for (const tool of tools) {
      lines.push(
        `<meta name="webmcp:tool:${tool.name}" content="${this.escapeAttr(tool.description)}">`,
      );
    }

    // JSON-LD script block
    lines.push(`<script type="application/ld+json">`);
    lines.push(this.toManifest());
    lines.push(`</script>`);

    return lines.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private escapeAttr(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

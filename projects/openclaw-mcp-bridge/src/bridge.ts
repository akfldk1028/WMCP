/**
 * MCP Bridge Server
 *
 * Exposes WebMCP tools discovered on websites as MCP tools via JSON-RPC
 * over stdio. Compatible with OpenClaw, Claude Code, and any MCP client.
 *
 * Protocol: MCP (Model Context Protocol) JSON-RPC 2.0 over stdio.
 */

import { scanUrls } from './scanner.js';
import type { BridgeConfig, BridgedTool, MCPToolResult } from './types.js';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export class MCPBridgeServer {
  private tools: Map<string, BridgedTool> = new Map();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private readonly config: BridgeConfig;

  constructor(config: BridgeConfig) {
    this.config = config;
  }

  /**
   * Initialize: scan target URLs and discover tools.
   */
  async initialize(): Promise<void> {
    await this.refreshTools();

    if (this.config.autoRefresh) {
      const interval = this.config.refreshIntervalMs ?? 5 * 60 * 1000;
      this.refreshTimer = setInterval(() => {
        this.refreshTools().catch((err) => this.log('Refresh error:', err));
      }, interval);

      if (typeof this.refreshTimer === 'object' && this.refreshTimer !== null && 'unref' in (this.refreshTimer as object)) {
        (this.refreshTimer as unknown as { unref: () => void }).unref();
      }
    }
  }

  /**
   * Re-scan all target URLs for tools.
   */
  async refreshTools(): Promise<void> {
    const results = await scanUrls(this.config.targetUrls);

    this.tools.clear();
    for (const result of results) {
      if (result.error) {
        this.log(`Scan error for ${result.url}: ${result.error}`);
        continue;
      }
      for (const tool of result.tools) {
        // Prefix tool name with source domain to avoid collisions
        const domain = new URL(result.url).hostname.replace(/\./g, '_');
        const key = `${domain}__${tool.name}`;
        tool.name = key;
        this.tools.set(key, tool);
      }
    }

    this.log(`Discovered ${this.tools.size} tools from ${this.config.targetUrls.length} URLs`);
  }

  /**
   * Start the stdio JSON-RPC server.
   */
  async startStdio(): Promise<void> {
    await this.initialize();

    process.stdin.setEncoding('utf-8');
    let buffer = '';

    process.stdin.on('data', (chunk: string) => {
      buffer += chunk;

      // Process complete JSON-RPC messages (newline-delimited)
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const request = JSON.parse(trimmed) as JsonRpcRequest;
          this.handleRequest(request)
            .then((response) => {
              if (response) {
                process.stdout.write(JSON.stringify(response) + '\n');
              }
            })
            .catch((err) => {
              this.log('Request handler error:', err);
            });
        } catch {
          const errResponse: JsonRpcResponse = {
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error' },
          };
          process.stdout.write(JSON.stringify(errResponse) + '\n');
        }
      }
    });

    this.log('MCP Bridge server started on stdio');
  }

  /**
   * Handle a single JSON-RPC request.
   */
  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
    const { method, params, id } = request;

    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'openclaw-mcp-bridge',
              version: '0.1.0',
            },
          },
        };

      case 'notifications/initialized':
        // Client acknowledges initialization; no response needed
        return null;

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          result: {
            tools: Array.from(this.tools.values()).map((tool) => ({
              name: tool.name,
              description: `${tool.description} (from ${tool.sourceUrl})`,
              inputSchema: tool.inputSchema,
            })),
          },
        };

      case 'tools/call': {
        try {
          const toolName = (params as Record<string, unknown>)?.name as string;
          const args = ((params as Record<string, unknown>)?.arguments ?? {}) as Record<string, unknown>;
          const result = await this.callTool(toolName, args);
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            result,
          };
        } catch (err) {
          return {
            jsonrpc: '2.0',
            id: id ?? null,
            error: { code: -32603, message: err instanceof Error ? err.message : String(err) },
          };
        }
      }

      case 'ping':
        return { jsonrpc: '2.0', id: id ?? null, result: {} };

      default:
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  }

  /**
   * Invoke a bridged tool by making the HTTP request to the source website.
   */
  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Tool not found: ${toolName}` }],
        isError: true,
      };
    }

    try {
      let response: Response;

      if (tool.method === 'GET') {
        const params = new URLSearchParams(
          Object.entries(args).map(([k, v]) => [k, String(v)]),
        );
        response = await fetch(`${tool.endpoint}?${params.toString()}`, {
          headers: {
            'X-WebMCP-Tool': tool.name,
            'X-Agent-Invoked': 'true',
          },
        });
      } else {
        response = await fetch(tool.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WebMCP-Tool': tool.name,
            'X-Agent-Invoked': 'true',
          },
          body: JSON.stringify(args),
        });
      }

      const text = await response.text();

      // Try to return structured JSON if possible
      try {
        const json = JSON.parse(text);
        return {
          content: [{ type: 'text', text: JSON.stringify(json, null, 2) }],
        };
      } catch {
        return {
          content: [{ type: 'text', text }],
        };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error calling tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Get the number of discovered tools.
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Get all discovered tool names.
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Stop the server and clean up.
   */
  destroy(): void {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.error('[openclaw-mcp-bridge]', ...args);
    }
  }
}

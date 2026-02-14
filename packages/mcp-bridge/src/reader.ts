/**
 * MCPServerReader - Reads tool definitions from an MCP server
 *
 * Supports:
 * - HTTP/SSE endpoint (GET /tools/list)
 * - JSON file (exported tools list)
 * - stdio (spawn MCP server process and read tools/list)
 */
import type { MCPToolDefinition, MCPToolsListResponse } from '@wmcp/core';

export type MCPSource =
  | { type: 'http'; url: string }
  | { type: 'json'; data: MCPToolsListResponse }
  | { type: 'file'; path: string };

export class MCPServerReader {
  private source: MCPSource;

  constructor(source: MCPSource) {
    this.source = source;
  }

  async readTools(): Promise<MCPToolDefinition[]> {
    switch (this.source.type) {
      case 'http':
        return this.readFromHTTP();
      case 'json':
        return this.source.data.tools;
      case 'file':
        return this.readFromFile();
      default:
        throw new Error(`Unsupported source type`);
    }
  }

  private async readFromHTTP(): Promise<MCPToolDefinition[]> {
    if (this.source.type !== 'http') throw new Error('Not HTTP source');

    const response = await fetch(this.source.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.status}`);
    }

    const result = await response.json() as { result?: MCPToolsListResponse };
    return result.result?.tools ?? [];
  }

  private async readFromFile(): Promise<MCPToolDefinition[]> {
    if (this.source.type !== 'file') throw new Error('Not file source');

    const { readFile } = await import('node:fs/promises');
    const content = await readFile(this.source.path, 'utf-8');
    const data = JSON.parse(content) as MCPToolsListResponse;
    return data.tools;
  }
}

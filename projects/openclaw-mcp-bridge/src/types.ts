/**
 * Types for the OpenClaw MCP Bridge.
 *
 * This bridge exposes WebMCP tools discovered on websites as standard MCP
 * tools that any MCP client (OpenClaw, Claude Code, etc.) can invoke.
 */

export interface BridgeConfig {
  /** URLs of websites to scan for WebMCP tools. */
  targetUrls: string[];

  /** Port for the MCP server (stdio mode ignores this). */
  port?: number;

  /** Transport mode: stdio for CLI integration, http for standalone. */
  transport: 'stdio' | 'http';

  /** Whether to re-scan periodically for new tools. */
  autoRefresh?: boolean;

  /** Refresh interval in milliseconds (default: 5 minutes). */
  refreshIntervalMs?: number;

  /** Enable debug logging. */
  debug?: boolean;
}

/** A WebMCP tool discovered on a website, adapted for MCP exposure. */
export interface BridgedTool {
  /** MCP tool name (derived from WebMCP toolname). */
  name: string;

  /** Tool description for LLM consumption. */
  description: string;

  /** JSON Schema for the tool's input parameters. */
  inputSchema: Record<string, unknown>;

  /** The source website URL where this tool was found. */
  sourceUrl: string;

  /** How the tool was discovered. */
  discoveryMethod: 'declarative' | 'imperative' | 'potential';

  /** The form action or API endpoint to invoke. */
  endpoint: string;

  /** HTTP method for invocation. */
  method: 'GET' | 'POST';
}

/** Result of scanning a website for tools. */
export interface ScanResult {
  url: string;
  tools: BridgedTool[];
  scannedAt: string;
  error?: string;
}

/** MCP-compliant tool call result. */
export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

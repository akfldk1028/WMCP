/**
 * High-level conversion: MCP → WebMCP (one-shot)
 */
import type { MCPToolDefinition } from '@wmcp/core';
import { MCPServerReader, type MCPSource } from './reader.js';
import { WebMCPCodeGenerator, type GeneratorOptions } from './generator.js';

export interface ConvertResult {
  toolCount: number;
  files: Map<string, string>;
  tools: MCPToolDefinition[];
}

export async function convertMCPToWebMCP(
  source: MCPSource,
  options?: Partial<GeneratorOptions>,
): Promise<ConvertResult> {
  const reader = new MCPServerReader(source);
  const tools = await reader.readTools();

  const generator = new WebMCPCodeGenerator({
    format: options?.format ?? 'all',
    proxyBaseUrl: options?.proxyBaseUrl ?? '/api',
    includePolyfill: options?.includePolyfill ?? true,
    includeFeatureDetection: options?.includeFeatureDetection ?? true,
  });

  const files = generator.generate(tools);

  return { toolCount: tools.length, files, tools };
}

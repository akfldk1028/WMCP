/**
 * Zod schemas for validation - can convert to JSON Schema for WebMCP
 */
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// ===== Tool Registration Schema =====

export const toolAnnotationsSchema = z.object({
  title: z.string().optional(),
  readOnlyHint: z.boolean().optional(),
  destructiveHint: z.boolean().optional(),
  idempotentHint: z.boolean().optional(),
  openWorldHint: z.boolean().optional(),
});

export const toolInputSchema = z.object({
  name: z.string().min(1).regex(/^[a-z][a-z0-9_-]*$/i, 'Tool name must be alphanumeric with hyphens/underscores'),
  description: z.string().min(10, 'Description should be at least 10 characters for agent understanding'),
  inputSchema: z.record(z.unknown()),
  annotations: toolAnnotationsSchema.optional(),
});

// ===== MCP Tool Schema (for converter) =====

export const mcpToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.unknown()).optional(),
    required: z.array(z.string()).optional(),
  }),
});

export const mcpToolsListSchema = z.object({
  tools: z.array(mcpToolSchema),
});

// ===== Declarative API Schema =====

export const declarativeAttributesSchema = z.object({
  toolname: z.string().min(1),
  tooldescription: z.string().min(10),
  toolautosubmit: z.boolean().optional(),
});

// ===== Utility: Convert Zod → JSON Schema for WebMCP =====

export function toWebMCPSchema(zodSchema: z.ZodType): Record<string, unknown> {
  return zodToJsonSchema(zodSchema, { target: 'openApi3' }) as Record<string, unknown>;
}

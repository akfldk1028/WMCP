/**
 * WebMCP core type definitions
 * Based on the WebMCP spec (index.bs) and Chrome 146 implementation
 */

// ===== WebMCP Tool Definition =====

export interface WebMCPToolInput {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  annotations?: ToolAnnotations;
}

export interface WebMCPTool extends WebMCPToolInput {
  execute: (input: Record<string, unknown>, client?: ModelContextClient) => Promise<ToolResult>;
}

export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ModelContextClient {
  requestUserInteraction: (options?: UserInteractionOptions) => Promise<UserInteractionResult>;
}

export interface UserInteractionOptions {
  reason?: string;
}

export interface UserInteractionResult {
  interacted: boolean;
}

export interface ToolResult {
  content: ToolContent[];
}

export interface ToolContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
}

// ===== MCP Server Tool (for conversion) =====

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

export interface MCPToolsListResponse {
  tools: MCPToolDefinition[];
}

// ===== JSON Schema subset =====

export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  description?: string;
}

export interface JsonSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

// ===== Declarative API =====

export interface DeclarativeToolAttributes {
  toolname: string;
  tooldescription: string;
  toolautosubmit?: boolean;
}

// ===== Scoring =====

export interface CategoryScore {
  score: number;
  max: number;
  details: string[];
}

export interface DetailedScore {
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: {
    structure: CategoryScore;
    tools: CategoryScore;
    declarative: CategoryScore;
    imperative: CategoryScore;
  };
}

// ===== Scanner Result =====

export interface ScanResult {
  url: string;
  timestamp: string;
  forms: FormInfo[];
  existingTools: WebMCPToolInput[];
  recommendations: ToolRecommendation[];
  score: number; // 0-100 WebMCP readiness score
  detailedScore: DetailedScore;
}

export interface FormInfo {
  action: string;
  method: string;
  fields: FormFieldInfo[];
  hasToolAttributes: boolean;
  hasToolDescription: boolean;
  hasToolAutosubmit: boolean;
  suggestedToolName?: string;
}

export interface FormFieldInfo {
  name: string;
  type: string;
  label?: string;
  required: boolean;
  placeholder?: string;
}

export interface ToolRecommendation {
  type: 'declarative' | 'imperative';
  priority: 'high' | 'medium' | 'low';
  description: string;
  code: string;
}

// ===== Business/Analytics =====

export interface ToolCallEvent {
  toolName: string;
  agentId?: string;
  timestamp: string;
  inputParams: Record<string, unknown>;
  success: boolean;
  responseTime: number;
  agentInvoked: boolean;
}

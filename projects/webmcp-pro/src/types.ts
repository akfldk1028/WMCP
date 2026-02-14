export interface WebMCPProConfig {
  analytics?: AnalyticsConfig;
  security?: SecurityConfig;
  rateLimit?: RateLimitConfig;
  discovery?: DiscoveryConfig;
  debug?: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  onToolCall?: (event: ToolAnalyticsEvent) => void;
  onToolRegister?: (toolName: string) => void;
  onError?: (error: ToolErrorEvent) => void;
}

export interface ToolAnalyticsEvent {
  toolName: string;
  timestamp: number;
  duration: number;
  success: boolean;
  agentInvoked: boolean;
  inputKeys: string[];
}

export interface ToolErrorEvent {
  toolName: string;
  error: string;
  timestamp: number;
}

export interface SecurityConfig {
  allowedOrigins?: string[];
  blockedToolPatterns?: RegExp[];
  sanitizeInputs?: boolean;
  maxInputSize?: number;
  requireUserInteraction?: boolean;
}

export interface RateLimitConfig {
  maxCallsPerMinute?: number;
  maxCallsPerHour?: number;
  maxConcurrent?: number;
  cooldownMs?: number;
}

export interface DiscoveryConfig {
  enabled: boolean;
  registryUrl?: string;
  autoPublish?: boolean;
  metadata?: Record<string, string>;
}

export interface ToolRegistration {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (input: Record<string, unknown>, client?: unknown) => Promise<ToolResult>;
}

export interface ToolResult {
  content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
}

export interface ToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  registeredAt: number;
  callCount: number;
  lastCalledAt?: number;
  avgResponseTime: number;
}

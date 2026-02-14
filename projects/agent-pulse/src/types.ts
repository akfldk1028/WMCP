/**
 * AgentPulse type definitions.
 *
 * These types are intentionally self-contained and do not depend on
 * @wmcp/core.  The overlap with ToolCallEvent is deliberate -- AgentPulse
 * keeps a slimmer, privacy-conscious surface (e.g. inputKeys instead of
 * full inputParams).
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface AgentPulseConfig {
  /** Unique identifier for the site being tracked. */
  siteId: string;

  /**
   * The HTTP endpoint that receives event batches.
   * @default "/api/agent-pulse"
   */
  endpoint?: string;

  /**
   * Probability (0 -- 1) that any given event is actually recorded.
   * Useful for high-traffic sites that want to reduce volume.
   * @default 1
   */
  sampleRate?: number;

  /** When true, logs internal activity to the console. */
  debug?: boolean;

  /**
   * Maximum number of events buffered before an automatic flush.
   * @default 10
   */
  batchSize?: number;

  /**
   * Milliseconds between periodic flush cycles.
   * @default 5000
   */
  flushInterval?: number;
}

// ---------------------------------------------------------------------------
// Event envelope
// ---------------------------------------------------------------------------

export type AgentPulseEventType =
  | 'tool_call'
  | 'tool_register'
  | 'agent_visit'
  | 'tool_error';

export interface AgentPulseEvent {
  type: AgentPulseEventType;
  siteId: string;
  sessionId: string;
  timestamp: string;
  data: ToolCallData | ToolRegisterData | AgentVisitData | ToolErrorData;
}

// ---------------------------------------------------------------------------
// Event data payloads
// ---------------------------------------------------------------------------

/** Recorded every time a registered WebMCP tool is invoked. */
export interface ToolCallData {
  toolName: string;
  /** True when Chrome 146+ reports the invocation came from an AI agent. */
  agentInvoked: boolean;
  responseTimeMs: number;
  success: boolean;
  /** Only the *keys* of the input object -- never the values (privacy). */
  inputKeys: string[];
}

/** Recorded when a new tool is registered via navigator.modelContext. */
export interface ToolRegisterData {
  toolName: string;
  /** Whether the tool definition includes an inputSchema. */
  hasSchema: boolean;
  /** Whether the tool was registered declaratively (HTML attributes). */
  declarative: boolean;
}

/** Recorded once per session to capture top-level page context. */
export interface AgentVisitData {
  toolCount: number;
  userAgent: string;
  referrer: string;
}

/** Recorded when a tool invocation throws or rejects. */
export interface ToolErrorData {
  toolName: string;
  errorType: string;
  message: string;
}

/**
 * @wmcp/agent-pulse -- Lightweight WebMCP analytics.
 *
 * Track AI agent interactions on your site using Chrome 146's
 * `event.agentInvoked` signal and the WebMCP `navigator.modelContext` API.
 */

export { AgentPulseTracker } from './tracker.js';
export { EventCollector } from './collector.js';
export { getSnippet, getInlineSnippet } from './snippet.js';
export type {
  AgentPulseConfig,
  AgentPulseEvent,
  AgentPulseEventType,
  ToolCallData,
  ToolRegisterData,
  AgentVisitData,
  ToolErrorData,
} from './types.js';

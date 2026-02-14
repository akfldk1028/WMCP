/**
 * AgentPulseTracker -- the main tracking harness that hooks into the
 * WebMCP API surface exposed by Chrome 146+.
 *
 * It monkey-patches `navigator.modelContext.registerTool` so that every
 * tool registration and invocation is automatically instrumented.  It
 * also listens for form `submit` events to detect the new
 * `event.agentInvoked` signal.
 */

import { EventCollector } from './collector.js';
import type {
  AgentPulseConfig,
  AgentPulseEvent,
  AgentVisitData,
  ToolCallData,
  ToolErrorData,
  ToolRegisterData,
} from './types.js';

// ---------------------------------------------------------------------------
// Minimal type declarations for the WebMCP API surface we interact with.
// These are intentionally narrow so we don't pull in @wmcp/core.
// ---------------------------------------------------------------------------

interface ModelContextTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
  execute: (input: Record<string, unknown>, ...rest: unknown[]) => Promise<unknown>;
}

interface ModelContext {
  registerTool: (tool: ModelContextTool) => void;
  tools?: ModelContextTool[];
}

// ---------------------------------------------------------------------------
// Session statistics
// ---------------------------------------------------------------------------

export interface SessionStats {
  totalCalls: number;
  agentCalls: number;
  humanCalls: number;
  avgResponseTimeMs: number;
}

// ---------------------------------------------------------------------------
// AgentPulseTracker
// ---------------------------------------------------------------------------

export class AgentPulseTracker {
  private readonly collector: EventCollector;
  private readonly config: AgentPulseConfig;

  // Session-level accumulators for getStats().
  private totalCalls = 0;
  private agentCalls = 0;
  private humanCalls = 0;
  private totalResponseTimeMs = 0;

  // References kept for cleanup.
  private originalRegisterTool: ((tool: ModelContextTool) => void) | null = null;
  private formSubmitHandler: ((e: Event) => void) | null = null;

  /** Queue of agentInvoked flags from form submits (FIFO). */
  private agentInvokedQueue: boolean[] = [];

  /** Guard against duplicate init() calls. */
  private initialized = false;

  constructor(config: AgentPulseConfig) {
    this.config = config;
    this.collector = new EventCollector(config);
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Start tracking.  Call this once after the DOM is ready (or at any point
   * -- the hooks are safe to install at any time).
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.installFormSubmitListener();
    this.installModelContextHooks();
    this.trackAgentVisit();
  }

  /** Return aggregated stats for the current session. */
  getStats(): SessionStats {
    return {
      totalCalls: this.totalCalls,
      agentCalls: this.agentCalls,
      humanCalls: this.humanCalls,
      avgResponseTimeMs:
        this.totalCalls > 0 ? this.totalResponseTimeMs / this.totalCalls : 0,
    };
  }

  /** Tear down all hooks, timers, and listeners. */
  destroy(): void {
    // Restore original registerTool if we patched it.
    if (this.originalRegisterTool) {
      const mc = this.getModelContext();
      if (mc) {
        mc.registerTool = this.originalRegisterTool;
      }
      this.originalRegisterTool = null;
    }

    // Remove form submit listener.
    if (this.formSubmitHandler && typeof document !== 'undefined') {
      document.removeEventListener('submit', this.formSubmitHandler, true);
      this.formSubmitHandler = null;
    }

    this.agentInvokedQueue.length = 0;
    this.initialized = false;
    this.collector.destroy();
  }

  // -----------------------------------------------------------------------
  // Internals -- Model Context hooks
  // -----------------------------------------------------------------------

  /** Safely retrieve navigator.modelContext (may not exist). */
  private getModelContext(): ModelContext | null {
    if (typeof navigator === 'undefined') return null;
    // The property doesn't exist in TypeScript's lib.dom yet.
    const mc = (navigator as unknown as Record<string, unknown>).modelContext;
    if (mc && typeof (mc as ModelContext).registerTool === 'function') {
      return mc as ModelContext;
    }
    return null;
  }

  /**
   * Monkey-patch `navigator.modelContext.registerTool` so we intercept both
   * the registration and every subsequent invocation of each tool.
   */
  private installModelContextHooks(): void {
    const mc = this.getModelContext();
    if (!mc) return;

    this.originalRegisterTool = mc.registerTool.bind(mc);

    mc.registerTool = (tool: ModelContextTool): void => {
      // 1. Track the registration event.
      this.trackToolRegister(tool);

      // 2. Wrap the execute function so every call is instrumented.
      const wrappedTool: ModelContextTool = {
        ...tool,
        execute: this.wrapExecute(tool),
      };

      // 3. Forward to the real registerTool.
      this.originalRegisterTool!(wrappedTool);
    };

    // Instrument tools that were already registered before init() was called.
    if (Array.isArray(mc.tools)) {
      for (const tool of mc.tools) {
        this.trackToolRegister(tool);
        tool.execute = this.wrapExecute(tool);
      }
    }
  }

  /** Return a wrapped version of `tool.execute` that records analytics. */
  private wrapExecute(
    tool: ModelContextTool,
  ): (input: Record<string, unknown>, ...rest: unknown[]) => Promise<unknown> {
    const originalExecute = tool.execute;

    return async (input: Record<string, unknown>, ...rest: unknown[]): Promise<unknown> => {
      const startMs = performance.now();
      let success = true;

      try {
        const result = await originalExecute.call(tool, input, ...rest);
        return result;
      } catch (error) {
        success = false;
        this.trackToolError(tool.name, error);
        throw error;
      } finally {
        const responseTimeMs = performance.now() - startMs;
        const agentInvoked = this.consumeAgentInvokedFlag();

        this.trackToolCall({
          toolName: tool.name,
          agentInvoked,
          responseTimeMs,
          success,
          inputKeys: Object.keys(input),
        });
      }
    };
  }

  // -----------------------------------------------------------------------
  // Internals -- Form submit listener (agentInvoked detection)
  // -----------------------------------------------------------------------

  /**
   * Listen for all form submit events on the document.  Chrome 146 adds
   * `event.agentInvoked` to SubmitEvent when a form submission was
   * triggered by an AI agent.
   */
  private installFormSubmitListener(): void {
    if (typeof document === 'undefined') return;

    this.formSubmitHandler = (e: Event): void => {
      // The `agentInvoked` property lives on the SubmitEvent but
      // TypeScript doesn't know about it yet.
      const agentInvoked = (e as unknown as Record<string, unknown>).agentInvoked;
      if (typeof agentInvoked === 'boolean') {
        this.agentInvokedQueue.push(agentInvoked);
      }
    };

    // Use capturing so we see the event before any other handler can
    // stopPropagation.
    document.addEventListener('submit', this.formSubmitHandler, true);
  }

  /**
   * Dequeue the oldest agentInvoked flag (FIFO).
   * Returns false when the queue is empty -- the conservative default.
   */
  private consumeAgentInvokedFlag(): boolean {
    return this.agentInvokedQueue.shift() ?? false;
  }

  // -----------------------------------------------------------------------
  // Internals -- Event creation helpers
  // -----------------------------------------------------------------------

  private emit(event: AgentPulseEvent): void {
    this.collector.track(event);
  }

  private makeEvent(
    type: AgentPulseEvent['type'],
    data: AgentPulseEvent['data'],
  ): AgentPulseEvent {
    return {
      type,
      siteId: this.config.siteId,
      sessionId: this.collector.sessionId,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  private trackToolRegister(tool: ModelContextTool): void {
    const data: ToolRegisterData = {
      toolName: tool.name,
      hasSchema: tool.inputSchema != null,
      declarative: false, // Imperative registrations are never declarative.
    };

    // Heuristic: if the tool name matches a form's `toolname` attribute
    // pattern it was likely registered via declarative HTML.
    if (typeof document !== 'undefined') {
      const form = document.querySelector(
        `form[toolname="${tool.name}"]`,
      );
      if (form) {
        data.declarative = true;
      }
    }

    this.emit(this.makeEvent('tool_register', data));
  }

  private trackToolCall(data: ToolCallData): void {
    this.totalCalls++;
    if (data.agentInvoked) {
      this.agentCalls++;
    } else {
      this.humanCalls++;
    }
    this.totalResponseTimeMs += data.responseTimeMs;

    this.emit(this.makeEvent('tool_call', data));
  }

  private trackToolError(toolName: string, error: unknown): void {
    const data: ToolErrorData = {
      toolName,
      errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    };
    this.emit(this.makeEvent('tool_error', data));
  }

  private trackAgentVisit(): void {
    const mc = this.getModelContext();
    const toolCount = Array.isArray(mc?.tools) ? mc!.tools!.length : 0;

    const data: AgentVisitData = {
      toolCount,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    };
    this.emit(this.makeEvent('agent_visit', data));
  }
}

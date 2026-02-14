import type { AnalyticsConfig, ToolAnalyticsEvent, ToolErrorEvent } from './types.js';

interface ToolBreakdown {
  calls: number;
  successes: number;
  avgTime: number;
}

export interface AggregateStats {
  totalCalls: number;
  successRate: number;
  avgResponseTime: number;
  toolBreakdown: Record<string, ToolBreakdown>;
}

/**
 * AnalyticsTracker records tool call events, registration events, and errors,
 * forwarding them to configured callbacks and maintaining aggregate statistics.
 */
export class AnalyticsTracker {
  private readonly config: AnalyticsConfig;

  /** Per-tool aggregate tracking. */
  private readonly toolStats: Map<
    string,
    { calls: number; successes: number; totalTime: number }
  > = new Map();

  /** Global counters. */
  private totalCalls = 0;
  private totalSuccesses = 0;
  private totalResponseTime = 0;

  constructor(config: AnalyticsConfig = { enabled: false }) {
    this.config = config;
  }

  /** Whether analytics tracking is currently enabled. */
  get enabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Record a completed tool call event.
   * Invokes the `onToolCall` callback (if configured) and updates internal stats.
   */
  trackToolCall(event: ToolAnalyticsEvent): void {
    if (!this.config.enabled) return;

    // Update global stats
    this.totalCalls += 1;
    this.totalResponseTime += event.duration;
    if (event.success) {
      this.totalSuccesses += 1;
    }

    // Update per-tool stats
    const existing = this.toolStats.get(event.toolName) ?? {
      calls: 0,
      successes: 0,
      totalTime: 0,
    };
    existing.calls += 1;
    existing.totalTime += event.duration;
    if (event.success) {
      existing.successes += 1;
    }
    this.toolStats.set(event.toolName, existing);

    // Fire callback
    this.config.onToolCall?.(event);
  }

  /**
   * Record that a tool was registered.
   * Invokes the `onToolRegister` callback if configured.
   */
  trackRegistration(toolName: string): void {
    if (!this.config.enabled) return;
    this.config.onToolRegister?.(toolName);
  }

  /**
   * Record a tool call error.
   * Invokes the `onError` callback if configured.
   */
  trackError(event: ToolErrorEvent): void {
    if (!this.config.enabled) return;
    this.config.onError?.(event);
  }

  /**
   * Return aggregate statistics across all tracked tool calls.
   */
  getStats(): AggregateStats {
    const toolBreakdown: Record<string, ToolBreakdown> = {};
    for (const [name, stats] of this.toolStats) {
      toolBreakdown[name] = {
        calls: stats.calls,
        successes: stats.successes,
        avgTime: stats.calls > 0 ? stats.totalTime / stats.calls : 0,
      };
    }

    return {
      totalCalls: this.totalCalls,
      successRate: this.totalCalls > 0 ? this.totalSuccesses / this.totalCalls : 0,
      avgResponseTime: this.totalCalls > 0 ? this.totalResponseTime / this.totalCalls : 0,
      toolBreakdown,
    };
  }

  /**
   * Return a human-readable summary of the current analytics state.
   */
  getSummary(): string {
    const stats = this.getStats();
    const lines: string[] = [
      `WebMCP Pro Analytics Summary`,
      `----------------------------`,
      `Total calls: ${stats.totalCalls}`,
      `Success rate: ${(stats.successRate * 100).toFixed(1)}%`,
      `Avg response time: ${stats.avgResponseTime.toFixed(1)}ms`,
      ``,
      `Tool breakdown:`,
    ];

    for (const [name, breakdown] of Object.entries(stats.toolBreakdown)) {
      const rate = breakdown.calls > 0
        ? ((breakdown.successes / breakdown.calls) * 100).toFixed(1)
        : '0.0';
      lines.push(
        `  ${name}: ${breakdown.calls} calls, ${rate}% success, avg ${breakdown.avgTime.toFixed(1)}ms`,
      );
    }

    if (Object.keys(stats.toolBreakdown).length === 0) {
      lines.push('  (no tools called yet)');
    }

    return lines.join('\n');
  }
}

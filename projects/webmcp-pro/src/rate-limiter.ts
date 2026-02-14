import type { RateLimitConfig } from './types.js';

const DEFAULT_MAX_CALLS_PER_MINUTE = 60;
const DEFAULT_MAX_CALLS_PER_HOUR = 1000;
const DEFAULT_MAX_CONCURRENT = 5;
const DEFAULT_COOLDOWN_MS = 100;

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Internal tracking state for a single tool. */
interface ToolUsageRecord {
  /** Timestamps of calls within the sliding windows. */
  callTimestamps: number[];
  /** Number of currently in-flight calls. */
  activeCalls: number;
  /** Timestamp of the most recent call start. */
  lastCallTime: number;
}

export interface UsageStats {
  callsInLastMinute: number;
  callsInLastHour: number;
  activeCalls: number;
  lastCallTime: number;
  minuteLimit: number;
  hourLimit: number;
  concurrentLimit: number;
}

/**
 * RateLimiter enforces per-tool call limits using a sliding window approach.
 *
 * It tracks calls-per-minute, calls-per-hour, concurrent call count, and a
 * minimum cooldown between consecutive calls to the same tool.
 */
export class RateLimiter {
  private readonly config: Required<RateLimitConfig>;
  private readonly records: Map<string, ToolUsageRecord> = new Map();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      maxCallsPerMinute: config.maxCallsPerMinute ?? DEFAULT_MAX_CALLS_PER_MINUTE,
      maxCallsPerHour: config.maxCallsPerHour ?? DEFAULT_MAX_CALLS_PER_HOUR,
      maxConcurrent: config.maxConcurrent ?? DEFAULT_MAX_CONCURRENT,
      cooldownMs: config.cooldownMs ?? DEFAULT_COOLDOWN_MS,
    };

    // Periodically prune stale timestamps to prevent unbounded memory growth.
    this.cleanupTimer = setInterval(() => this.cleanup(), ONE_MINUTE_MS);

    // Allow the timer to be garbage-collected without keeping the process alive.
    if (typeof this.cleanupTimer === 'object' && this.cleanupTimer !== null && 'unref' in (this.cleanupTimer as object)) {
      (this.cleanupTimer as unknown as { unref: () => void }).unref();
    }
  }

  /**
   * Attempt to acquire permission to call the given tool.
   *
   * Returns `{ allowed: true }` when the call may proceed, or
   * `{ allowed: false, retryAfterMs }` indicating the earliest time at
   * which a retry might succeed.
   */
  acquire(toolName: string): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    const record = this.getOrCreateRecord(toolName);

    // Prune timestamps outside the 1-hour window
    this.pruneTimestamps(record, now);

    // --- Cooldown check ---
    const timeSinceLastCall = now - record.lastCallTime;
    if (record.lastCallTime > 0 && timeSinceLastCall < this.config.cooldownMs) {
      return { allowed: false, retryAfterMs: this.config.cooldownMs - timeSinceLastCall };
    }

    // --- Concurrent check ---
    if (record.activeCalls >= this.config.maxConcurrent) {
      // Cannot predict when a slot opens; suggest a short retry.
      return { allowed: false, retryAfterMs: this.config.cooldownMs };
    }

    // --- Per-minute sliding window ---
    const oneMinuteAgo = now - ONE_MINUTE_MS;
    const callsInLastMinute = record.callTimestamps.filter((t) => t > oneMinuteAgo).length;
    if (callsInLastMinute >= this.config.maxCallsPerMinute) {
      const oldestInWindow = record.callTimestamps.find((t) => t > oneMinuteAgo);
      const retryAfterMs = oldestInWindow ? oldestInWindow - oneMinuteAgo : ONE_MINUTE_MS;
      return { allowed: false, retryAfterMs };
    }

    // --- Per-hour sliding window ---
    const oneHourAgo = now - ONE_HOUR_MS;
    const callsInLastHour = record.callTimestamps.filter((t) => t > oneHourAgo).length;
    if (callsInLastHour >= this.config.maxCallsPerHour) {
      const oldestInWindow = record.callTimestamps.find((t) => t > oneHourAgo);
      const retryAfterMs = oldestInWindow ? oldestInWindow - oneHourAgo : ONE_HOUR_MS;
      return { allowed: false, retryAfterMs };
    }

    // --- All checks passed: record the call ---
    record.callTimestamps.push(now);
    record.activeCalls += 1;
    record.lastCallTime = now;

    return { allowed: true };
  }

  /**
   * Release one active-call slot for the given tool.
   * Must be called after the tool call completes (success or failure).
   */
  release(toolName: string): void {
    const record = this.records.get(toolName);
    if (record && record.activeCalls > 0) {
      record.activeCalls -= 1;
    }
  }

  /**
   * Return current usage statistics for a tool.
   */
  getUsage(toolName: string): UsageStats {
    const now = Date.now();
    const record = this.records.get(toolName);

    if (!record) {
      return {
        callsInLastMinute: 0,
        callsInLastHour: 0,
        activeCalls: 0,
        lastCallTime: 0,
        minuteLimit: this.config.maxCallsPerMinute,
        hourLimit: this.config.maxCallsPerHour,
        concurrentLimit: this.config.maxConcurrent,
      };
    }

    const oneMinuteAgo = now - ONE_MINUTE_MS;
    const oneHourAgo = now - ONE_HOUR_MS;

    return {
      callsInLastMinute: record.callTimestamps.filter((t) => t > oneMinuteAgo).length,
      callsInLastHour: record.callTimestamps.filter((t) => t > oneHourAgo).length,
      activeCalls: record.activeCalls,
      lastCallTime: record.lastCallTime,
      minuteLimit: this.config.maxCallsPerMinute,
      hourLimit: this.config.maxCallsPerHour,
      concurrentLimit: this.config.maxConcurrent,
    };
  }

  /**
   * Reset counters for a specific tool, or all tools if no name is given.
   */
  reset(toolName?: string): void {
    if (toolName) {
      this.records.delete(toolName);
    } else {
      this.records.clear();
    }
  }

  /**
   * Stop the background cleanup timer. Call this when the rate limiter
   * is no longer needed to allow clean shutdown.
   */
  destroy(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private getOrCreateRecord(toolName: string): ToolUsageRecord {
    let record = this.records.get(toolName);
    if (!record) {
      record = { callTimestamps: [], activeCalls: 0, lastCallTime: 0 };
      this.records.set(toolName, record);
    }
    return record;
  }

  private pruneTimestamps(record: ToolUsageRecord, now: number): void {
    const oneHourAgo = now - ONE_HOUR_MS;
    record.callTimestamps = record.callTimestamps.filter((t) => t > oneHourAgo);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [toolName, record] of this.records) {
      this.pruneTimestamps(record, now);
      // Remove entirely empty records that have no active calls
      if (record.callTimestamps.length === 0 && record.activeCalls === 0) {
        this.records.delete(toolName);
      }
    }
  }
}

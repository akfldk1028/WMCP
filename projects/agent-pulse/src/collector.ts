/**
 * EventCollector -- batches AgentPulse events and ships them to the
 * configured endpoint.  It respects sample-rate filtering, periodic
 * flush intervals, and uses `navigator.sendBeacon` as a last-resort
 * delivery mechanism on page unload.
 */

import type { AgentPulseConfig, AgentPulseEvent } from './types.js';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_ENDPOINT = '/api/agent-pulse';
const DEFAULT_SAMPLE_RATE = 1;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL = 5_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a session id.  Prefer the standard `crypto.randomUUID()` API
 *  available in all modern browsers; fall back to a simple random hex string
 *  for legacy environments. */
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: 32 hex chars (128 bits of randomness).
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// EventCollector
// ---------------------------------------------------------------------------

export class EventCollector {
  private readonly endpoint: string;
  private readonly sampleRate: number;
  private readonly batchSize: number;
  private readonly debug: boolean;

  private queue: AgentPulseEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;

  /** A stable id for the current browser session. */
  readonly sessionId: string;

  constructor(private readonly config: AgentPulseConfig) {
    this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
    this.sampleRate = config.sampleRate ?? DEFAULT_SAMPLE_RATE;
    this.batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE;
    this.debug = config.debug ?? false;

    this.sessionId = generateSessionId();

    // Periodic flush.
    const interval = config.flushInterval ?? DEFAULT_FLUSH_INTERVAL;
    this.flushTimer = setInterval(() => {
      this.flush();
    }, interval);

    // Last-chance delivery on page unload.
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('pagehide', this.handlePageHide);
    }

    this.log('Collector initialised', { sessionId: this.sessionId, endpoint: this.endpoint });
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Queue an event for delivery.  Sampling is applied here. */
  track(event: AgentPulseEvent): void {
    if (this.destroyed) return;

    // Sample-rate gate: skip this event with probability (1 - sampleRate).
    if (this.sampleRate < 1 && Math.random() > this.sampleRate) {
      this.log('Event sampled out', { type: event.type });
      return;
    }

    this.queue.push(event);
    this.log('Event tracked', { type: event.type, queueLength: this.queue.length });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /** Send the current queue to the endpoint and clear it. */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);
    this.log('Flushing batch', { count: batch.length });

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });

      if (!response.ok) {
        this.log('Flush failed', { status: response.status });
        // Re-enqueue so they can be retried on the next flush.
        this.queue.unshift(...batch);
      } else {
        this.log('Flush succeeded', { status: response.status });
      }
    } catch (error) {
      this.log('Flush error', { error });
      // Re-enqueue for retry.
      this.queue.unshift(...batch);
    }
  }

  /** Tear down timers and event listeners. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('pagehide', this.handlePageHide);
    }

    // Best-effort delivery of remaining events.
    this.sendBeacon();
    this.log('Collector destroyed');
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  /** Use `navigator.sendBeacon` for fire-and-forget delivery. */
  private sendBeacon(): void {
    if (this.queue.length === 0) return;
    if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return;

    const batch = this.queue.splice(0);
    const blob = new Blob([JSON.stringify({ events: batch })], {
      type: 'application/json',
    });
    const queued = navigator.sendBeacon(this.endpoint, blob);
    this.log('sendBeacon', { queued, count: batch.length });

    if (!queued) {
      // If the browser rejected the beacon, put events back so that a
      // future flush (if the page survives) can retry.
      this.queue.unshift(...batch);
    }
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      this.sendBeacon();
    }
  };

  private handlePageHide = (): void => {
    this.sendBeacon();
  };

  private log(message: string, data?: Record<string, unknown>): void {
    if (!this.debug) return;
    // eslint-disable-next-line no-console
    console.log(`[AgentPulse] ${message}`, data ?? '');
  }
}

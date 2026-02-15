import type { PriceSnapshot } from '../types.js';
import type { StorageAdapter } from './adapter.js';

/**
 * In-memory storage adapter for testing and simple CLI usage.
 */
export class MemoryAdapter implements StorageAdapter {
  private snapshots = new Map<string, PriceSnapshot>();
  private counter = 0;

  async saveSnapshot(snapshot: Omit<PriceSnapshot, 'id'>): Promise<string> {
    const id = `mem-${++this.counter}`;
    this.snapshots.set(id, { ...snapshot, id });
    return id;
  }

  async querySnapshots(
    url: string,
    productName?: string,
    days?: number,
  ): Promise<PriceSnapshot[]> {
    const cutoff = days
      ? new Date(Date.now() - days * 86_400_000).toISOString()
      : undefined;

    const results: PriceSnapshot[] = [];
    for (const snap of this.snapshots.values()) {
      if (snap.url !== url) continue;
      if (productName && snap.productName !== productName) continue;
      if (cutoff && snap.capturedAt < cutoff) continue;
      results.push(snap);
    }

    return results.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  }

  async deleteSnapshot(id: string): Promise<void> {
    this.snapshots.delete(id);
  }

  /** For testing: get all stored snapshots */
  getAll(): PriceSnapshot[] {
    return [...this.snapshots.values()];
  }
}

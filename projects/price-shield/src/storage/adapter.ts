import type { PriceSnapshot } from '../types.js';

/**
 * Abstract storage interface for price snapshots.
 * Implementations: MemoryAdapter (test), SQLiteAdapter (prod).
 */
export interface StorageAdapter {
  saveSnapshot(snapshot: Omit<PriceSnapshot, 'id'>): Promise<string>;
  querySnapshots(url: string, productName?: string, days?: number): Promise<PriceSnapshot[]>;
  deleteSnapshot(id: string): Promise<void>;
}

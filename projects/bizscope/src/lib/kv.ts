/**
 * BizScope AI — Upstash Redis KV for license management.
 * Key prefix: bsai: (shares Redis instance with ShopGuard safely).
 */

import { Redis } from '@upstash/redis';

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // Return a lazy proxy that throws on first use — allows build to pass without env vars
    return new Proxy({} as Redis, {
      get(_, prop) {
        if (typeof prop === 'string') {
          return () => { throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN'); };
        }
      },
    });
  }
  return new Redis({ url, token });
}

const redis = createRedis();

export type BsaiPlan = 'pro' | 'credits';

export interface LicenseRecord {
  plan: BsaiPlan;
  credits: number;
  email: string;
  createdAt: number;
}

// --- Key helpers ---

const KEY = (licenseKey: string) => `bsai:key:${licenseKey}`;
const SUB = (subscriptionId: string) => `bsai:sub:${subscriptionId}`;
const ORDER = (orderId: string) => `bsai:order:${orderId}`;

/** Validate license key format: bsai_ + 32 hex chars */
export const LICENSE_KEY_RE = /^bsai_[a-f0-9]{32}$/;
export function isValidKeyFormat(key: string): boolean {
  return LICENSE_KEY_RE.test(key);
}

// --- Public API ---

export function generateLicenseKey(): string {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `bsai_${random}`;
}

/** Create or overwrite a license key record. */
export async function provisionKey(
  licenseKey: string,
  plan: BsaiPlan,
  email: string,
  subscriptionId?: string,
): Promise<void> {
  const record: LicenseRecord = {
    plan,
    credits: plan === 'pro' ? -1 : 0, // -1 = unlimited
    email,
    createdAt: Date.now(),
  };
  await redis.set(KEY(licenseKey), JSON.stringify(record));

  if (subscriptionId) {
    await redis.set(SUB(subscriptionId), licenseKey);
  }
}

/** Revoke a license key. */
export async function revokeKey(licenseKey: string): Promise<void> {
  await redis.del(KEY(licenseKey));
}

/** Revoke by LemonSqueezy subscription ID. */
export async function revokeBySubscription(subscriptionId: string): Promise<void> {
  const licenseKey = await redis.get<string>(SUB(subscriptionId));
  if (licenseKey) {
    await revokeKey(licenseKey);
    await redis.del(SUB(subscriptionId));
  }
}

/** Add credits to an existing key, or create a new credits key. */
export async function addCredits(
  licenseKey: string,
  amount: number,
  email: string,
  orderId: string,
): Promise<void> {
  // Dedup check
  const existingOrder = await redis.get<string>(ORDER(orderId));
  if (existingOrder) return;

  const existing = await redis.get(KEY(licenseKey));
  if (existing) {
    const record = parseRecord(existing);
    if (record.plan === 'pro') return; // Pro has unlimited, no-op
    record.credits += amount;
    await redis.set(KEY(licenseKey), JSON.stringify(record));
  } else {
    const record: LicenseRecord = {
      plan: 'credits',
      credits: amount,
      email,
      createdAt: Date.now(),
    };
    await redis.set(KEY(licenseKey), JSON.stringify(record));
  }

  await redis.set(ORDER(orderId), licenseKey);
}

function parseRecord(raw: unknown): LicenseRecord {
  if (typeof raw === 'object' && raw !== null) return raw as LicenseRecord;
  return JSON.parse(raw as string);
}

/** Use one credit. Returns true if allowed, false if insufficient. */
export async function useCredit(licenseKey: string): Promise<boolean> {
  const raw = await redis.get(KEY(licenseKey));
  if (!raw) return false;

  const record = parseRecord(raw);
  if (record.plan === 'pro') return true; // unlimited
  if (record.credits <= 0) return false;

  record.credits -= 1;
  await redis.set(KEY(licenseKey), JSON.stringify(record));
  return true;
}

/** Get license info for a key. Returns null if invalid. */
export async function getLicenseInfo(licenseKey: string): Promise<LicenseRecord | null> {
  const raw = await redis.get(KEY(licenseKey));
  if (!raw) return null;
  return parseRecord(raw);
}

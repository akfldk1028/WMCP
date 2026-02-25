/** Persistent API key management via Vercel KV */

import { kv } from '@vercel/kv';
import type { Plan } from './auth';

interface KeyRecord {
  plan: Plan;
  email: string;
  lemonSubscriptionId: string;
  createdAt: number;
}

/** Store an API key with its plan and metadata */
export async function provisionKey(
  apiKey: string,
  plan: Plan,
  email: string,
  lemonSubscriptionId: string,
): Promise<void> {
  // key:<apiKey> -> plan (used by auth.ts resolveKey)
  await kv.set(`key:${apiKey}`, plan);

  // keymeta:<apiKey> -> full record (for admin/debugging)
  const record: KeyRecord = { plan, email, lemonSubscriptionId, createdAt: Date.now() };
  await kv.set(`keymeta:${apiKey}`, JSON.stringify(record));

  // Index by subscription ID for revocation
  await kv.set(`sub:${lemonSubscriptionId}`, apiKey);
}

/** Revoke an API key (on subscription cancellation/expiry) */
export async function revokeKey(apiKey: string): Promise<void> {
  // Get metadata to clean up subscription index
  const meta = await kv.get<string>(`keymeta:${apiKey}`);
  if (meta) {
    try {
      const record: KeyRecord = JSON.parse(meta);
      await kv.del(`sub:${record.lemonSubscriptionId}`);
    } catch { /* ignore parse errors */ }
  }

  await kv.del(`key:${apiKey}`);
  await kv.del(`keymeta:${apiKey}`);
  await kv.del(`rate:${apiKey}`);
}

/** Revoke by Lemonsqueezy subscription ID */
export async function revokeBySubscription(subscriptionId: string): Promise<void> {
  const apiKey = await kv.get<string>(`sub:${subscriptionId}`);
  if (apiKey) {
    await revokeKey(apiKey);
  }
}

/** Look up plan for an API key */
export async function getKeyPlan(apiKey: string): Promise<Plan | null> {
  return kv.get<Plan>(`key:${apiKey}`);
}

/** Generate a random API key */
export function generateApiKey(plan: Plan): string {
  const prefix = plan === 'enterprise' ? 'sg_ent' : plan === 'developer' ? 'sg_dev' : 'sg_con';
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${random}`;
}

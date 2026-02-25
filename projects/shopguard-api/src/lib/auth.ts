import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export type Plan = 'free' | 'consumer' | 'developer' | 'enterprise';

export interface ApiKeyInfo {
  key: string;
  plan: Plan;
  remaining: number;
}

const PLAN_LIMITS: Record<Plan, number> = {
  free: 50,
  consumer: 200,
  developer: 5_000,
  enterprise: 50_000,
};

const DAY_SECONDS = 86_400;

/** Resolve API key to a plan. Checks KV store first, then env vars as fallback. */
async function resolveKey(key: string): Promise<{ plan: Plan } | null> {
  const masterKey = process.env.SHOPGUARD_MASTER_KEY;
  if (masterKey && key === masterKey) return { plan: 'enterprise' };

  // Demo key for testing
  if (key === 'sg_demo_free') return { plan: 'free' };

  // Check KV for key->plan mapping (set by Lemonsqueezy webhook)
  try {
    const kvPlan = await kv.get<Plan>(`key:${key}`);
    if (kvPlan) return { plan: kvPlan };
  } catch {
    // KV unavailable — fall through to env vars
  }

  // Legacy: env var fallback (comma-separated)
  const consumerKeys = (process.env.SHOPGUARD_CONSUMER_KEYS || process.env.SHOPGUARD_PRO_KEYS || '').split(',').filter(Boolean);
  if (consumerKeys.includes(key)) return { plan: 'consumer' };

  const devKeys = (process.env.SHOPGUARD_DEVELOPER_KEYS || '').split(',').filter(Boolean);
  if (devKeys.includes(key)) return { plan: 'developer' };

  return null;
}

/** Rate limiting via Vercel KV with daily TTL. Falls back to no-limit on KV failure. */
async function checkRateLimit(key: string, plan: Plan): Promise<{ allowed: boolean; remaining: number }> {
  const limit = PLAN_LIMITS[plan];
  const kvKey = `rate:${key}`;

  try {
    const count = await kv.incr(kvKey);
    // Set TTL on first request of the day
    if (count === 1) {
      await kv.expire(kvKey, DAY_SECONDS);
    }

    if (count > limit) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: limit - count };
  } catch {
    // KV unavailable — allow request but warn
    return { allowed: true, remaining: limit };
  }
}

export function withAuth(
  handler: (req: NextRequest, info: ApiKeyInfo) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    const key = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.headers.get('x-api-key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing API key. Pass via Authorization: Bearer <key> or X-API-Key header.' },
        { status: 401 }
      );
    }

    const resolved = await resolveKey(key);
    if (!resolved) {
      return NextResponse.json(
        { error: 'Invalid API key.' },
        { status: 403 }
      );
    }

    const { allowed, remaining } = await checkRateLimit(key, resolved.plan);
    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded (${PLAN_LIMITS[resolved.plan]}/day). Upgrade your plan for higher limits.`, plan: resolved.plan },
        { status: 429 }
      );
    }

    const res = await handler(req, { key, plan: resolved.plan, remaining });
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    res.headers.set('X-Plan', resolved.plan);
    return res;
  };
}

import { NextRequest, NextResponse } from 'next/server';

export type Plan = 'free' | 'pro';

export interface ApiKeyInfo {
  key: string;
  plan: Plan;
  remaining: number;
}

// In-memory rate limiting (replace with Redis/KV in production)
const usage = new Map<string, { count: number; resetAt: number }>();

const FREE_LIMIT = 50;    // 50 requests/day
const PRO_LIMIT = 10000;  // 10k requests/day

// Valid API keys (replace with DB/Lemonsqueezy lookup in production)
function resolveKey(key: string): { plan: Plan } | null {
  const masterKey = process.env.SHOPGUARD_MASTER_KEY;
  if (masterKey && key === masterKey) return { plan: 'pro' };

  // Demo key for testing
  if (key === 'sg_demo_free') return { plan: 'free' };

  // Pro keys from env (comma-separated)
  const proKeys = (process.env.SHOPGUARD_PRO_KEYS || '').split(',').filter(Boolean);
  if (proKeys.includes(key)) return { plan: 'pro' };

  return null;
}

function checkRateLimit(key: string, plan: Plan): { allowed: boolean; remaining: number } {
  const limit = plan === 'pro' ? PRO_LIMIT : FREE_LIMIT;
  const now = Date.now();
  const dayMs = 86400000;

  let entry = usage.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + dayMs };
    usage.set(key, entry);
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
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

    const resolved = resolveKey(key);
    if (!resolved) {
      return NextResponse.json(
        { error: 'Invalid API key.' },
        { status: 403 }
      );
    }

    const { allowed, remaining } = checkRateLimit(key, resolved.plan);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Upgrade to pro for higher limits.' },
        { status: 429 }
      );
    }

    const res = await handler(req, { key, plan: resolved.plan, remaining });
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    res.headers.set('X-Plan', resolved.plan);
    return res;
  };
}

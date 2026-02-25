import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { validateLicense } from '@/lib/lemonsqueezy';
import { runServerPipeline } from '@/lib/pipeline';

// Extension API key — prevents casual abuse (not a secret, embedded in extension)
const EXT_API_KEY = process.env.SHOPGUARD_EXT_KEY || 'sg_ext_v040';

const FREE_DAILY_LIMIT = 5;
const DAY_SECONDS = 86_400;

async function checkRateLimit(deviceId: string): Promise<{ allowed: boolean; remaining: number }> {
  const kvKey = `ext:${deviceId}`;

  try {
    const count = await kv.incr(kvKey);
    if (count === 1) {
      await kv.expire(kvKey, DAY_SECONDS);
    }

    if (count > FREE_DAILY_LIMIT) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: FREE_DAILY_LIMIT - count };
  } catch {
    // KV unavailable — allow request
    return { allowed: true, remaining: FREE_DAILY_LIMIT };
  }
}

export async function POST(req: NextRequest) {
  // Verify extension API key
  const apiKey = req.headers.get('x-shopguard-key');
  if (apiKey !== EXT_API_KEY) {
    return NextResponse.json(
      { error: 'Invalid or missing extension API key.' },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.snapshot || !body?.deviceId) {
    return NextResponse.json(
      { error: 'Required: { snapshot, deviceId }' },
      { status: 400 },
    );
  }

  // Pro license check — if valid, skip rate limit
  let isPro = false;
  if (body.licenseKey && typeof body.licenseKey === 'string') {
    isPro = await validateLicense(body.licenseKey);
  }

  // Rate limit for free users
  if (!isPro) {
    const { allowed, remaining } = await checkRateLimit(body.deviceId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Daily limit reached (5/day). Upgrade to Pro for unlimited.', errorCode: 'rate_limit' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } },
      );
    }
    const result = await runServerPipeline(body.snapshot);
    const res = NextResponse.json(result);
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    return res;
  }

  const result = await runServerPipeline(body.snapshot);
  return NextResponse.json(result);
}

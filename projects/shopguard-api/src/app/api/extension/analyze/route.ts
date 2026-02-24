import { NextRequest, NextResponse } from 'next/server';
import { validateLicense } from '@/lib/lemonsqueezy';
import { runServerPipeline } from '@/lib/pipeline';

// Extension API key — prevents casual abuse (not a secret, embedded in extension)
const EXT_API_KEY = process.env.SHOPGUARD_EXT_KEY || 'sg_ext_v040';

// In-memory rate limiting (per deviceId)
// Note: resets on Vercel cold start. Replace with Vercel KV for production.
const usage = new Map<string, { count: number; resetAt: number }>();
const FREE_DAILY_LIMIT = 5;
const DAY_MS = 86_400_000;
const MAX_ENTRIES = 10_000;

function checkRateLimit(deviceId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Prevent unbounded memory growth — prune expired entries
  if (usage.size > MAX_ENTRIES) {
    for (const [key, entry] of usage) {
      if (now > entry.resetAt) usage.delete(key);
    }
  }

  let entry = usage.get(deviceId);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + DAY_MS };
    usage.set(deviceId, entry);
  }
  if (entry.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: FREE_DAILY_LIMIT - entry.count };
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
    const { allowed, remaining } = checkRateLimit(body.deviceId);
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

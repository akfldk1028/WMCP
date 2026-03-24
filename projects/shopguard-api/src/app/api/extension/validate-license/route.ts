import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { validateLicense } from '@/lib/lemonsqueezy';

const VALIDATE_DAILY_LIMIT = 20;
const DAY_SECONDS = 86_400;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.licenseKey || typeof body.licenseKey !== 'string') {
    return NextResponse.json({ error: 'Required: { licenseKey }' }, { status: 400 });
  }

  // Rate limit by IP to prevent brute-force
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  try {
    const kvKey = `vlr:${ip}`;
    const count = await kv.incr(kvKey);
    if (count === 1) await kv.expire(kvKey, DAY_SECONDS);
    if (count > VALIDATE_DAILY_LIMIT) {
      return NextResponse.json({ error: 'Too many validation attempts.' }, { status: 429 });
    }
  } catch {
    // KV unavailable — allow request
  }

  const valid = await validateLicense(body.licenseKey);
  return NextResponse.json({ valid });
}

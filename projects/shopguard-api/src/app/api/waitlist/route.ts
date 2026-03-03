import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const DAY_SECONDS = 86_400;
const MAX_SIGNUPS_PER_IP = 10;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || typeof body.email !== 'string') {
    return NextResponse.json(
      { error: 'Required: { "email": "you@example.com" }' },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Invalid email address.' },
      { status: 400 },
    );
  }

  const storeUrl = typeof body.storeUrl === 'string' ? body.storeUrl.trim() : undefined;

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimitKey = `waitlist-rate:${ip}`;

  try {
    const count = await kv.incr(rateLimitKey);
    if (count === 1) {
      await kv.expire(rateLimitKey, DAY_SECONDS);
    }
    if (count > MAX_SIGNUPS_PER_IP) {
      return NextResponse.json(
        { error: 'Too many signups. Please try again tomorrow.' },
        { status: 429 },
      );
    }
  } catch {
    // KV unavailable — allow through
  }

  // Store waitlist entry
  try {
    await kv.set(`waitlist:${email}`, {
      email,
      storeUrl,
      date: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save. Please try again later.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "You're on the list! We'll notify you when Seller tools launch.",
  });
}

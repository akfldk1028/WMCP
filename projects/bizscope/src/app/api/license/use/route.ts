import { NextResponse } from 'next/server';
import { useCredit, isValidKeyFormat } from '@/lib/kv';

/** Deduct one credit from a license key. Called once per report generation. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const licenseKey = body.licenseKey as string | undefined;
  if (!licenseKey || typeof licenseKey !== 'string') {
    return NextResponse.json({ error: 'licenseKey is required' }, { status: 400 });
  }

  if (!isValidKeyFormat(licenseKey)) {
    return NextResponse.json({ error: 'Invalid key format', ok: false }, { status: 400 });
  }

  const ok = await useCredit(licenseKey);
  if (!ok) {
    return NextResponse.json({ error: 'No credits remaining', ok: false }, { status: 402 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { getLicenseInfo, isValidKeyFormat } from '@/lib/kv';

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
    return NextResponse.json({ valid: false }, { status: 200 });
  }

  const info = await getLicenseInfo(licenseKey);
  if (!info) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    plan: info.plan,
    credits: info.plan === 'pro' ? -1 : info.credits,
    ensemble: info.plan === 'pro',
  });
}

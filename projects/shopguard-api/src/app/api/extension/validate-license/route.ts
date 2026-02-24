import { NextRequest, NextResponse } from 'next/server';
import { validateLicense } from '@/lib/lemonsqueezy';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.licenseKey || typeof body.licenseKey !== 'string') {
    return NextResponse.json({ error: 'Required: { licenseKey }' }, { status: 400 });
  }

  const valid = await validateLicense(body.licenseKey);
  return NextResponse.json({ valid });
}

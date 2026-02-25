import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiKeyInfo } from '@/lib/auth';
import { extractFeeMatches, extractTrapMatches } from 'shopguard-mcp/signals';

async function handler(req: NextRequest, info: ApiKeyInfo) {
  if (info.plan === 'free') {
    return NextResponse.json({ error: 'Paid plan required for pricing analysis. Upgrade to Consumer Pro ($4.99/mo) or higher.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.html || typeof body.html !== 'string') {
    return NextResponse.json({ error: 'Required: { "html": "<page HTML>" }' }, { status: 400 });
  }

  if (body.html.length > 2_000_000) {
    return NextResponse.json({ error: 'HTML too large. Max 2MB.' }, { status: 413 });
  }

  return NextResponse.json({
    fees: extractFeeMatches(body.html),
    traps: extractTrapMatches(body.html),
  });
}

export const POST = withAuth(handler);

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { extractDarkPatternEvidence } from 'shopguard-mcp/signals';
import { enrichDarkPatterns } from '@/lib/enrich';

async function handler(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.html || typeof body.html !== 'string') {
    return NextResponse.json({ error: 'Required: { "html": "<page HTML>" }' }, { status: 400 });
  }

  if (body.html.length > 2_000_000) {
    return NextResponse.json({ error: 'HTML too large. Max 2MB.' }, { status: 413 });
  }

  const raw = extractDarkPatternEvidence(body.html);
  const results = enrichDarkPatterns(raw);
  return NextResponse.json(results);
}

export const POST = withAuth(handler);

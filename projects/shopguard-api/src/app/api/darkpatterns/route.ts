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

  const locale = body.locale || 'en';
  // Strip HTML tags to get visible text for pattern matching (avoids false positives from tag names)
  const visibleText = body.html.replace(/<[^>]*>/g, ' ');
  const raw = extractDarkPatternEvidence(visibleText, body.html);
  const results = enrichDarkPatterns(raw, locale);
  return NextResponse.json(results);
}

export const POST = withAuth(handler);

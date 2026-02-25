import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiKeyInfo } from '@/lib/auth';
import { analyzeReviewSignals } from 'shopguard-mcp/signals';
import { extractReviews } from 'shopguard-mcp/extractors';

async function handler(req: NextRequest, info: ApiKeyInfo) {
  if (info.plan === 'free') {
    return NextResponse.json({ error: 'Paid plan required for review analysis. Upgrade to Consumer Pro ($4.99/mo) or higher.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const locale = body?.locale || 'en';

  let reviews;
  if (body?.reviews && Array.isArray(body.reviews)) {
    reviews = body.reviews;
  } else if (body?.html && typeof body.html === 'string') {
    if (body.html.length > 2_000_000) {
      return NextResponse.json({ error: 'HTML too large. Max 2MB.' }, { status: 413 });
    }
    const extracted = extractReviews(body.html, locale);
    reviews = extracted.map(r => ({
      text: r.text,
      rating: r.rating ?? 3,
      date: r.date ?? '',
      author: r.author,
      verified: r.verified,
    }));
  } else {
    return NextResponse.json({ error: 'Required: { "html": "..." } or { "reviews": [...] }' }, { status: 400 });
  }

  const signals = analyzeReviewSignals(reviews, locale);
  return NextResponse.json({ reviewCount: reviews.length, signals });
}

export const POST = withAuth(handler);

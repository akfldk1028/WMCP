import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiKeyInfo } from '@/lib/auth';
import { extractPageData, extractReviews } from 'shopguard-mcp/extractors';
import { analyzeReviewSignals, extractFeeMatches, extractTrapMatches, extractDarkPatternEvidence } from 'shopguard-mcp/signals';
import { enrichDarkPatterns } from '@/lib/enrich';

async function handler(req: NextRequest, info: ApiKeyInfo) {
  const body = await req.json().catch(() => null);
  if (!body?.html || typeof body.html !== 'string') {
    return NextResponse.json(
      { error: 'Required: { "html": "<page HTML>" }' },
      { status: 400 }
    );
  }

  if (body.html.length > 2_000_000) {
    return NextResponse.json({ error: 'HTML too large. Max 2MB.' }, { status: 413 });
  }

  const locale = body.locale || 'en';
  const page = extractPageData(body.html, body.url);
  const darkPatterns = enrichDarkPatterns(extractDarkPatternEvidence(body.html));

  let reviews = null;
  let pricing = null;
  if (info.plan === 'pro') {
    const extracted = extractReviews(body.html, locale);
    if (extracted.length > 0) {
      const asReviews = extracted.map(r => ({
        text: r.text,
        rating: r.rating ?? 3,
        date: r.date ?? '',
        author: r.author,
        verified: r.verified,
      }));
      reviews = analyzeReviewSignals(asReviews, locale);
    }
    pricing = {
      fees: extractFeeMatches(body.html),
      traps: extractTrapMatches(body.html),
    };
  }

  return NextResponse.json({
    plan: info.plan,
    page: {
      title: page.title,
      platform: page.platform,
      priceContexts: page.priceContexts,
      reviewBlockCount: page.reviewBlocks.length,
      interactiveElements: page.interactiveElements.length,
    },
    darkPatterns,
    ...(info.plan === 'pro' ? { reviews, pricing } : {
      reviews: { locked: true, message: 'Upgrade to pro for review analysis' },
      pricing: { locked: true, message: 'Upgrade to pro for pricing analysis' },
    }),
  });
}

export const POST = withAuth(handler);

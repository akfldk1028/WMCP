import { NextRequest, NextResponse } from 'next/server';
import { scanUrl } from '@wmcp/scanner-engine';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const result = await scanUrl(url, { timeout: 15000 });

    return NextResponse.json({
      url: result.url,
      score: result.detailedScore.total,
      grade: result.detailedScore.grade,
      formCount: result.forms.length,
      toolCount: result.existingTools.length,
      detailedScore: result.detailedScore,
      recommendations: result.recommendations,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Scan failed: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}

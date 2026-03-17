import { NextResponse } from 'next/server';
import { searchWeb } from '@/lib/search';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const query = body.query as string | undefined;
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  const count = Math.min(Number(body.count) || 10, 20);
  const results = await searchWeb(query, count);

  return NextResponse.json({
    query,
    results: results || 'No results found.',
    resultCount: results ? results.split('\n\n').length : 0,
  });
}

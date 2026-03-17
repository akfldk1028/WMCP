import { NextResponse } from 'next/server';
import { searchWeb } from '@/lib/search';

/**
 * Financial data tool — searches for financial metrics of a company.
 * Used by bizscope-financial-data WebMCP tool.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const companyName = body.companyName as string | undefined;
  if (!companyName) {
    return NextResponse.json({ error: 'companyName is required' }, { status: 400 });
  }

  const metrics = (body.metrics as string[]) ?? [
    'revenue', 'operating profit', 'net income', 'employees', 'market cap',
  ];

  // Search for financial data with targeted queries
  const queries = [
    `${companyName} annual revenue operating profit net income 2024 2025 financial results`,
    `${companyName} market capitalization employees headcount ${metrics.join(' ')}`,
  ];

  const results = await Promise.all(queries.map((q) => searchWeb(q, 8)));
  const combined = results.filter(Boolean).join('\n\n---\n\n');

  return NextResponse.json({
    companyName,
    financialData: combined || 'No financial data found.',
    requestedMetrics: metrics,
  });
}

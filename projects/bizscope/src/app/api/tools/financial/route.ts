import { NextResponse } from 'next/server';
import { getCompanyFinancials, formatFinancialsAsResearch } from '@/lib/finance';

/**
 * Financial data tool — returns real financial data from Yahoo Finance.
 * No API key required. Supports KRX, NASDAQ, NYSE, etc.
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

  const financials = await getCompanyFinancials(companyName);

  if (!financials) {
    return NextResponse.json({
      companyName,
      error: 'Company not found in Yahoo Finance',
      financialData: '',
    });
  }

  return NextResponse.json({
    companyName: financials.name,
    ticker: financials.ticker,
    financialData: formatFinancialsAsResearch(financials),
    structured: {
      employees: financials.employees,
      marketCap: financials.marketCap,
      revenue: financials.revenue,
      netIncome: financials.netIncome,
      profitMargin: financials.profitMargin,
      debtToEquity: financials.debtToEquity,
      revenueGrowth: financials.revenueGrowth,
    },
  });
}

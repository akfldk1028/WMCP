import { NextResponse } from 'next/server';
import {
  getCompanyFinancials,
  formatFinancialsAsResearch,
  getIncomeHistory,
  getBalanceSheet,
  getStockHistory,
  getDetailedFinancials,
  formatDetailedFinancialsAsResearch,
} from '@/lib/finance';

/**
 * Financial data tool — returns real financial data from Yahoo Finance.
 * No API key required. Supports KRX, NASDAQ, NYSE, etc.
 * Used by bizscope-financial-data WebMCP tool.
 *
 * Supports `action` parameter:
 *   - (default) basic financials
 *   - "income-history" — 3-year income statements
 *   - "balance-sheet" — balance sheet history
 *   - "stock-history" — 1-year monthly stock prices
 *   - "detailed" — all of the above combined
 */
export async function POST(request: Request) {
  // API key auth (optional — enabled when BIZSCOPE_API_KEY is set)
  const apiKey = process.env.BIZSCOPE_API_KEY;
  if (apiKey) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { companyName, action } = body as { companyName?: string; action?: string };
  if (!companyName) {
    return NextResponse.json({ error: 'companyName is required' }, { status: 400 });
  }

  try {
    switch (action) {
      case 'income-history': {
        const data = await getIncomeHistory(companyName);
        return NextResponse.json({ incomeHistory: data });
      }
      case 'balance-sheet': {
        const data = await getBalanceSheet(companyName);
        return NextResponse.json({ balanceSheet: data });
      }
      case 'stock-history': {
        const data = await getStockHistory(companyName);
        return NextResponse.json({ stockHistory: data });
      }
      case 'detailed': {
        const data = await getDetailedFinancials(companyName);
        if (!data) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        return NextResponse.json({
          data: data.basic,
          incomeHistory: data.incomeHistory,
          balanceSheet: data.balanceSheet,
          stockHistory: data.stockHistory,
          formatted: formatDetailedFinancialsAsResearch(data),
        });
      }
      default: {
        // Default: basic financials (backward compatible)
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
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

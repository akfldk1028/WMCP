/**
 * Server-side financial data fetcher using yahoo-finance2.
 * No API key required. Supports KRX (005930.KS), NASDAQ, NYSE, etc.
 */

import yahooFinance from 'yahoo-finance2';

export interface CompanyFinancials {
  name: string;
  ticker: string;
  sector: string;
  industry: string;
  country: string;
  employees: number | null;
  marketCap: number | null;
  currency: string;
  revenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  totalDebt: number | null;
  cashAndEquivalents: number | null;
  revenueGrowth: number | null;
  profitMargin: number | null;
  debtToEquity: number | null;
  currentPrice: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  description: string;
}

/** Known ticker mappings for common companies */
const TICKER_MAP: Record<string, string> = {
  '삼성전자': '005930.KS',
  'samsung electronics': '005930.KS',
  'samsung': '005930.KS',
  '애플': 'AAPL',
  'apple': 'AAPL',
  '엔비디아': 'NVDA',
  'nvidia': 'NVDA',
  '테슬라': 'TSLA',
  'tesla': 'TSLA',
  'sk이노베이션': '096770.KS',
  'sk innovation': '096770.KS',
  'sk하이닉스': '000660.KS',
  '현대자동차': '005380.KS',
  '카카오': '035720.KS',
  '네이버': '035420.KS',
  'lg전자': '066570.KS',
  'microsoft': 'MSFT',
  'google': 'GOOGL',
  'alphabet': 'GOOGL',
  'amazon': 'AMZN',
  'meta': 'META',
};

function formatNumber(num: number | null | undefined, currency = 'USD'): string {
  if (num == null) return '데이터 없음';
  const isKRW = currency === 'KRW';
  const unit = isKRW ? '원' : '$';

  if (Math.abs(num) >= 1e12) {
    const val = isKRW ? (num / 1e12).toFixed(1) : (num / 1e12).toFixed(2);
    return isKRW ? `약 ${val}조${unit}` : `${unit}${val}T`;
  }
  if (Math.abs(num) >= 1e9) {
    const val = isKRW ? (num / 1e8).toFixed(0) : (num / 1e9).toFixed(2);
    return isKRW ? `약 ${val}억${unit}` : `${unit}${val}B`;
  }
  if (Math.abs(num) >= 1e6) {
    const val = (num / 1e6).toFixed(1);
    return isKRW ? `약 ${val}백만${unit}` : `${unit}${val}M`;
  }
  return `${unit}${num.toLocaleString()}`;
}

async function findTicker(companyName: string): Promise<string | null> {
  const lower = companyName.toLowerCase().trim();
  if (TICKER_MAP[lower]) return TICKER_MAP[lower];

  try {
    const results = await yahooFinance.search(companyName, { newsCount: 0 }) as { quotes?: Array<{ symbol?: string }> };
    const quote = results.quotes?.[0];
    if (quote?.symbol) return quote.symbol;
  } catch {
    // Search failed
  }
  return null;
}

/**
 * Get comprehensive financial data for a company.
 * Returns structured data that can be injected into AI prompts.
 */
export async function getCompanyFinancials(companyName: string): Promise<CompanyFinancials | null> {
  const ticker = await findTicker(companyName);
  if (!ticker) return null;

  try {
    const quotePromise = yahooFinance.quote(ticker) as Promise<Record<string, unknown> | null>;
    const profilePromise = yahooFinance.quoteSummary(ticker, {
      modules: ['assetProfile', 'financialData', 'defaultKeyStatistics', 'incomeStatementHistory'],
    }) as Promise<Record<string, unknown> | null>;

    const [quote, profile] = await Promise.all([
      quotePromise.catch(() => null),
      profilePromise.catch(() => null),
    ]);

    if (!quote) return null;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const ap = (profile as any)?.assetProfile;
    const fd = (profile as any)?.financialData;
    const ks = (profile as any)?.defaultKeyStatistics;
    const is0 = (profile as any)?.incomeStatementHistory?.incomeStatementHistory?.[0];

    const q = quote as any;
    return {
      name: q.shortName ?? q.longName ?? companyName,
      ticker,
      sector: ap?.sector ?? '',
      industry: ap?.industry ?? '',
      country: ap?.country ?? '',
      employees: ap?.fullTimeEmployees ?? null,
      marketCap: q.marketCap ?? null,
      currency: q.currency ?? 'USD',
      revenue: fd?.totalRevenue ?? is0?.totalRevenue ?? null,
      operatingIncome: fd?.operatingMargins != null && fd?.totalRevenue != null
        ? fd.totalRevenue * fd.operatingMargins
        : is0?.operatingIncome ?? null,
      netIncome: is0?.netIncome ?? null,
      totalAssets: null,
      totalDebt: fd?.totalDebt ?? null,
      cashAndEquivalents: fd?.totalCash ?? null,
      revenueGrowth: fd?.revenueGrowth ?? null,
      profitMargin: fd?.profitMargins ?? null,
      debtToEquity: fd?.debtToEquity ?? null,
      currentPrice: fd?.currentPrice ?? q.regularMarketPrice ?? null,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
      description: ap?.longBusinessSummary ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Format financial data as research text for AI prompts.
 */
export function formatFinancialsAsResearch(data: CompanyFinancials): string {
  const c = data.currency;
  const lines = [
    `=== ${data.name} (${data.ticker}) Financial Data ===`,
    `Sector: ${data.sector} | Industry: ${data.industry} | Country: ${data.country}`,
    ``,
    `[Key Metrics]`,
    `Employees: ${data.employees?.toLocaleString() ?? '데이터 없음'}`,
    `Market Cap: ${formatNumber(data.marketCap, c)}`,
    `Revenue: ${formatNumber(data.revenue, c)}`,
    `Operating Income: ${formatNumber(data.operatingIncome, c)}`,
    `Net Income: ${formatNumber(data.netIncome, c)}`,
    `Revenue Growth: ${data.revenueGrowth != null ? (data.revenueGrowth * 100).toFixed(1) + '%' : 'N/A'}`,
    `Profit Margin: ${data.profitMargin != null ? (data.profitMargin * 100).toFixed(1) + '%' : 'N/A'}`,
    ``,
    `[Balance Sheet]`,
    `Total Debt: ${formatNumber(data.totalDebt, c)}`,
    `Cash & Equivalents: ${formatNumber(data.cashAndEquivalents, c)}`,
    `Debt/Equity: ${data.debtToEquity != null ? data.debtToEquity.toFixed(2) : 'N/A'}`,
    ``,
    `[Stock Price]`,
    `Current: ${formatNumber(data.currentPrice, c)}`,
    `52-Week Range: ${formatNumber(data.fiftyTwoWeekLow, c)} ~ ${formatNumber(data.fiftyTwoWeekHigh, c)}`,
  ];

  if (data.description) {
    lines.push(``, `[Business Description]`, data.description.slice(0, 2000));
  }

  return lines.join('\n');
}

/**
 * Server-side web search for BizScope report generation.
 * Supports Brave Search (BRAVE_API_KEY) and Tavily (TAVILY_API_KEY).
 *
 * Two modes:
 * 1. searchForSection() — multi-query search tailored per section type
 * 2. searchWeb()        — general-purpose search (used by bizscope-web-search WebMCP tool)
 */

interface SearchResult {
  title: string;
  content: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Section-specific MULTI-QUERY search — 2~3 targeted queries per section
// ---------------------------------------------------------------------------

const SECTION_QUERIES: Record<string, (company: string) => string[]> = {
  'company-overview': (c) => [
    `${c} company revenue employees headquarters founded annual report`,
    `${c} latest news announcements 2025 2026`,
    `${c} products services business segments portfolio`,
  ],
  'pest-analysis': (c) => [
    `${c} regulatory political government policy sanctions trade tariff 2025 2026`,
    `${c} industry economic trends GDP inflation interest rate market outlook`,
    `${c} technology innovation AI semiconductor disruption patent R&D 2025 2026`,
  ],
  'internal-capability': (c) => [
    `${c} R&D spending investment innovation patents`,
    `${c} financial performance revenue profit debt ratio cash flow balance sheet`,
    `${c} brand value ranking employees talent retention organizational culture`,
  ],
  'tows-cross-matrix': (c) => [
    `${c} competitive advantage strategic position market opportunity threat`,
  ],
  'strategy-combination': (c) => [
    `${c} strategic initiatives growth strategy transformation plan`,
    `${c} industry best practices successful strategies case study`,
  ],
  'seven-s-alignment': (c) => [
    `${c} organizational structure management style corporate culture values`,
    `${c} talent management HR leadership skill development internal systems`,
  ],
  'strategy-current-comparison': (c) => [
    `${c} official corporate strategy vision mission annual report IR 2025 2026`,
    `${c} CEO strategy announcement press release investor presentation`,
  ],
  'competitor-comparison': (c) => [
    `${c} competitors market share comparison industry ranking`,
    `${c} vs competitor strengths weaknesses competitive positioning`,
  ],
  'final-implications': (c) => [
    `${c} industry trends forecast outlook 2025 2026 2027`,
    `${c} digital transformation case study benchmark KPI best practices`,
  ],
};

// ---------------------------------------------------------------------------
// Low-level search functions
// ---------------------------------------------------------------------------

async function searchBrave(query: string, apiKey: string, count = 8): Promise<SearchResult[]> {
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
    const res = await fetch(url, {
      headers: { 'X-Subscription-Token': apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.web?.results ?? []).map((r: Record<string, string>) => ({
      title: r.title ?? '',
      content: r.description ?? '',
      url: r.url ?? '',
    }));
  } catch {
    return [];
  }
}

async function searchTavily(query: string, apiKey: string, count = 8): Promise<SearchResult[]> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, max_results: count, search_depth: 'advanced' }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: Record<string, string>) => ({
      title: r.title ?? '',
      content: r.content ?? '',
      url: r.url ?? '',
    }));
  } catch {
    return [];
  }
}

async function runSearch(query: string, count = 8): Promise<SearchResult[]> {
  const braveKey = process.env.BRAVE_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (braveKey) return searchBrave(query, braveKey, count);
  if (tavilyKey) return searchTavily(query, tavilyKey, count);
  return [];
}

function formatResults(results: SearchResult[]): string {
  if (results.length === 0) return '';
  return results.map((r) => `[${r.title}]\n${r.content}\nSource: ${r.url}`).join('\n\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Multi-query search tailored for a specific report section.
 * Runs 2-3 targeted searches in parallel and merges results.
 */
export async function searchForSection(
  sectionType: string,
  companyName: string,
): Promise<string> {
  const queryFns = SECTION_QUERIES[sectionType];
  if (!queryFns) return '';

  const queries = queryFns(companyName);

  // Run all queries in parallel, 8 results each
  const allResults = await Promise.all(queries.map((q) => runSearch(q, 8)));

  // Merge and deduplicate by URL
  const seen = new Set<string>();
  const merged: SearchResult[] = [];
  for (const batch of allResults) {
    for (const r of batch) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        merged.push(r);
      }
    }
  }

  return formatResults(merged);
}

/**
 * General-purpose web search — used by bizscope-web-search WebMCP tool.
 * AI agent can call this with any query.
 */
export async function searchWeb(query: string, count = 10): Promise<string> {
  const results = await runSearch(query, count);
  return formatResults(results);
}

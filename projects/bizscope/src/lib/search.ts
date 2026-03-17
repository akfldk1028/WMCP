/**
 * Server-side web search for BizScope report generation.
 * Supports Tavily (preferred) and Brave Search as fallback.
 * Set TAVILY_API_KEY or BRAVE_API_KEY in env to enable.
 */

interface SearchResult {
  title: string;
  content: string;
  url: string;
}

/** Section-specific search queries — matches WebMCP tool descriptions. */
const SECTION_QUERIES: Record<string, (company: string) => string> = {
  'company-overview': (c) =>
    `${c} company profile founding date headquarters employees revenue products services key strengths recent news 2025 2026`,
  'pest-analysis': (c) =>
    `${c} industry political regulatory changes economic indicators social demographic trends technology disruption competitive structure 2025 2026`,
  'internal-capability': (c) =>
    `${c} R&D investment brand value financial health debt ratio cash flow talent HR practices operational efficiency innovation`,
  'tows-cross-matrix': (c) =>
    `${c} strategic context competitive advantage opportunities threats`,
  'strategy-combination': (c) =>
    `${c} industry best practices strategic precedents successful strategies`,
  'seven-s-alignment': (c) =>
    `${c} organizational structure corporate culture leadership style talent management skill development internal systems processes`,
  'strategy-current-comparison': (c) =>
    `${c} official corporate strategy IR materials annual report press releases CEO vision statement 2025 2026`,
  'competitor-comparison': (c) =>
    `${c} top competitors market share revenue strengths weaknesses market positioning key differentiators`,
  'final-implications': (c) =>
    `${c} industry best practices similar company transformation cases benchmark KPIs strategic recommendations`,
};

async function searchTavily(query: string, apiKey: string): Promise<SearchResult[]> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 10,
        search_depth: 'advanced',
      }),
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

async function searchBrave(query: string, apiKey: string): Promise<SearchResult[]> {
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`;
    const res = await fetch(url, {
      headers: {
        'X-Subscription-Token': apiKey,
        Accept: 'application/json',
      },
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

/**
 * Search the web for research data relevant to the given section.
 * Returns formatted text string, or empty string if no search API is configured.
 */
export async function searchForSection(
  sectionType: string,
  companyName: string,
): Promise<string> {
  const queryFn = SECTION_QUERIES[sectionType];
  if (!queryFn) return '';

  const query = queryFn(companyName);

  const tavilyKey = process.env.TAVILY_API_KEY;
  const braveKey = process.env.BRAVE_API_KEY;

  let results: SearchResult[] = [];

  if (tavilyKey) {
    results = await searchTavily(query, tavilyKey);
  } else if (braveKey) {
    results = await searchBrave(query, braveKey);
  }

  if (results.length === 0) return '';

  return results
    .map((r) => `[${r.title}]\n${r.content}\nSource: ${r.url}`)
    .join('\n\n');
}

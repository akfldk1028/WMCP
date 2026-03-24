/**
 * Server-side web search for BizScope report generation.
 * Priority: Exa (best for AI — long context, category filters) > Brave > Tavily
 *
 * Two modes:
 * 1. searchForSection() — multi-query search tailored per section type
 * 2. searchWeb()        — general-purpose search (WebMCP tool)
 */

interface SearchResult {
  title: string;
  content: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Section-specific MULTI-QUERY search config
// Each section gets 2-3 targeted queries + optional Exa category filter
// ---------------------------------------------------------------------------

interface SectionSearchConfig {
  queries: (company: string) => string[];
  exaCategory?: 'company' | 'research paper';
}

const SECTION_SEARCH: Record<string, SectionSearchConfig> = {
  // --- Company sections ---
  'company-overview': {
    queries: (c) => [
      `${c} company revenue employees headquarters founded annual report`,
      `${c} latest news announcements 2025 2026`,
      `${c} products services business segments portfolio`,
    ],
    exaCategory: 'company',
  },
  'business-model-detail': {
    queries: (c) => [
      `${c} business model revenue streams platform components value chain`,
      `${c} monetization strategy commission structure subscription advertising`,
      `${c} 3C content community commerce business model analysis`,
    ],
    exaCategory: 'company',
  },
  'kpi-performance': {
    queries: (c) => [
      `${c} KPI performance metrics MAU DAU transaction volume`,
      `${c} market share industry ranking downloads users 2025 2026`,
      `${c} key performance indicators benchmark comparison`,
    ],
    exaCategory: 'company',
  },
  'financial-analysis': {
    queries: (c) => [
      `${c} financial statements income statement revenue profit loss 2023 2024 2025`,
      `${c} cost structure operating expenses R&D marketing costs`,
      `${c} financial ratios debt ratio ROE growth rate stability`,
    ],
    exaCategory: 'company',
  },
  'pest-analysis': {
    queries: (c) => [
      `${c} regulatory political government policy sanctions trade tariff 2025 2026`,
      `${c} industry economic trends market outlook competition`,
      `${c} technology innovation AI semiconductor disruption patent R&D 2025 2026`,
    ],
  },
  'five-forces-detail': {
    queries: (c) => [
      `${c} industry competition Porter five forces analysis barriers to entry`,
      `${c} supplier buyer bargaining power substitute products rivalry`,
    ],
  },
  'internal-capability': {
    queries: (c) => [
      `${c} R&D spending investment innovation patents`,
      `${c} financial performance revenue profit debt ratio cash flow balance sheet`,
      `${c} brand value ranking employees talent retention organizational culture`,
    ],
    exaCategory: 'company',
  },
  'tows-cross-matrix': {
    queries: (c) => [
      `${c} competitive advantage strategic position market opportunity threat`,
    ],
  },
  'strategy-combination': {
    queries: (c) => [
      `${c} strategic initiatives growth strategy transformation plan`,
      `${c} industry best practices successful strategies case study`,
    ],
  },
  'seven-s-alignment': {
    queries: (c) => [
      `${c} organizational structure management style corporate culture values`,
      `${c} talent management HR leadership skill development internal systems`,
    ],
    exaCategory: 'company',
  },
  'strategy-current-comparison': {
    queries: (c) => [
      `${c} official corporate strategy vision mission annual report IR 2025 2026`,
      `${c} CEO strategy announcement press release investor presentation`,
    ],
    exaCategory: 'company',
  },
  'competitor-comparison': {
    queries: (c) => [
      `${c} competitors market share comparison industry ranking`,
      `${c} vs competitor strengths weaknesses competitive positioning`,
    ],
  },
  'reference-case': {
    queries: (c) => [
      `${c} industry success story transformation case study benchmark`,
      `${c} similar company strategy implementation results outcomes`,
      `corporate transformation digital innovation success case study global`,
    ],
    exaCategory: 'research paper',
  },
  'final-implications': {
    queries: (c) => [
      `${c} industry trends forecast outlook 2025 2026 2027`,
      `${c} digital transformation case study benchmark KPI best practices`,
    ],
    exaCategory: 'research paper',
  },
  // --- Idea sections ---
  'idea-overview': {
    queries: (c) => [
      `${c} app startup product market fit problem solution`,
      `${c} startup idea validation user research`,
    ],
  },
  'idea-target-customer': {
    queries: (c) => [
      `${c} target customer persona user research segmentation`,
      `${c} customer journey map pain points willingness to pay`,
      `${c} user behavior switching cost alternatives analysis`,
    ],
  },
  'market-size': {
    queries: (c) => [
      `${c} market size TAM SAM SOM 2025 2026`,
      `${c} industry market research growth forecast report`,
    ],
    exaCategory: 'research paper',
  },
  'market-environment': {
    queries: (c) => [
      `${c} industry trends technology disruption regulation 2025 2026`,
      `${c} PEST analysis market maturity consumer behavior change`,
      `${c} regulatory environment compliance policy impact startup`,
    ],
    exaCategory: 'research paper',
  },
  'competitor-scan': {
    queries: (c) => [
      `${c} similar apps competitors alternatives comparison`,
      `${c} Product Hunt startup competitors funding Crunchbase`,
      `${c} market landscape existing solutions review`,
    ],
    exaCategory: 'company',
  },
  'competitor-positioning': {
    queries: (c) => [
      `${c} competitive positioning map market segmentation`,
      `${c} competitor weakness vulnerability market gap opportunity`,
      `${c} substitute products indirect competition threat analysis`,
    ],
    exaCategory: 'company',
  },
  'differentiation': {
    queries: (c) => [
      `${c} unique value proposition competitive advantage moat`,
      `${c} differentiation strategy positioning`,
    ],
  },
  'business-model': {
    queries: (c) => [
      `${c} business model revenue pricing SaaS subscription freemium`,
      `${c} startup monetization strategy unit economics`,
    ],
  },
  'unit-economics': {
    queries: (c) => [
      `${c} startup unit economics CAC LTV break even point`,
      `${c} SaaS metrics burn rate runway customer acquisition cost benchmark`,
    ],
    exaCategory: 'research paper',
  },
  'go-to-market': {
    queries: (c) => [
      `${c} go to market strategy launch plan growth hacking`,
      `${c} customer acquisition channels marketing strategy startup`,
    ],
  },
  'growth-strategy': {
    queries: (c) => [
      `${c} startup growth strategy viral loop network effects`,
      `${c} partnership strategy international expansion scaling plan`,
      `${c} product-led growth community building content marketing`,
    ],
  },
  'financial-projection': {
    queries: (c) => [
      `${c} startup financial projection revenue forecast 3 year`,
      `${c} startup funding seed series A venture capital valuation`,
    ],
    exaCategory: 'research paper',
  },
  'risk-assessment': {
    queries: (c) => [
      `${c} startup risks challenges failure reasons`,
      `${c} market risk regulatory compliance barriers to entry`,
    ],
  },
  'idea-reference-case': {
    queries: (c) => [
      `${c} similar startup success story case study growth journey`,
      `${c} startup failure lessons learned postmortem analysis`,
      `${c} comparable company IPO acquisition exit outcome`,
    ],
    exaCategory: 'company',
  },
  'action-plan': {
    queries: (c) => [
      `${c} startup roadmap milestones MVP launch timeline`,
      `${c} startup team hiring budget financial projection`,
    ],
  },
};

// ---------------------------------------------------------------------------
// Low-level search providers
// ---------------------------------------------------------------------------

async function searchExa(
  query: string,
  apiKey: string,
  count = 8,
  category?: 'company' | 'research paper',
): Promise<SearchResult[]> {
  try {
    const body: Record<string, unknown> = {
      query,
      numResults: count,
      type: 'auto',
      contents: { text: { maxCharacters: 3000 } },
      livecrawl: 'fallback',
    };
    if (category) body.category = category;

    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results ?? []).map((r: Record<string, string>) => ({
      title: r.title ?? '',
      content: r.text ?? r.snippet ?? '',
      url: r.url ?? '',
    }));
  } catch {
    return [];
  }
}

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

/** Run search with provider priority: Exa > Brave > Tavily */
async function runSearch(
  query: string,
  count = 8,
  exaCategory?: 'company' | 'research paper',
): Promise<SearchResult[]> {
  const exaKey = process.env.EXA_API_KEY;
  const braveKey = process.env.BRAVE_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (exaKey) return searchExa(query, exaKey, count, exaCategory);
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
 * Uses Exa category filters when available for higher quality.
 */
export async function searchForSection(
  sectionType: string,
  companyName: string,
  ideaInput?: { name: string; description: string; targetMarket?: string },
): Promise<string> {
  const config = SECTION_SEARCH[sectionType];
  if (!config) return '';

  // For idea mode, use idea name + description keywords for richer search
  const searchTerm = ideaInput
    ? `${ideaInput.name} ${ideaInput.description.slice(0, 100)}`
    : companyName;
  const queries = config.queries(searchTerm);

  // Run all queries in parallel
  const allResults = await Promise.all(
    queries.map((q) => runSearch(q, 8, config.exaCategory)),
  );

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
 */
export async function searchWeb(query: string, count = 10): Promise<string> {
  const results = await runSearch(query, count);
  return formatResults(results);
}

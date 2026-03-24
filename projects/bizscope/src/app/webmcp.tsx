'use client';

import { useEffect } from 'react';

declare global {
  interface Navigator {
    modelContext?: {
      registerTool(tool: {
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
        execute: (input: Record<string, unknown>, agent?: unknown) => Promise<unknown>;
        annotations?: {
          readOnlyHint?: boolean;
          destructiveHint?: boolean;
          idempotentHint?: boolean;
          openWorldHint?: boolean;
        };
      }): void;
      unregisterTool(name: string): void;
    };
  }
}

const API_BASE = '';

const TOOLS = [
  // === CH01: Company Overview (4 sections) ===
  {
    name: 'bizscope-company-overview',
    description: 'Analyze company profile with governance, investment history, and valuation. Search for: founding date, HQ, employees, revenue, products, news, M&A, governance structure.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about the company' },
        previousSections: { type: 'object', description: 'Results from previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/company-overview',
  },
  {
    name: 'bizscope-business-model-detail',
    description: 'Analyze business model: revenue streams, platform components, value chain, commission structure. Search for: business model, revenue breakdown, partnerships, 3C analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about business model and revenue' },
        previousSections: { type: 'object', description: 'Results from previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/business-model-detail',
  },
  {
    name: 'bizscope-kpi-performance',
    description: 'Analyze KPIs with concrete numbers: MAU, transaction volume, downloads, market share. Search for: company KPIs, performance metrics, industry benchmarks.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about KPIs and performance' },
        previousSections: { type: 'object', description: 'Results from previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/kpi-performance',
  },
  {
    name: 'bizscope-financial-analysis',
    description: 'Analyze financials: 3-year P&L, cost structure, growth/stability/profitability indicators. Search for: financial statements, annual report, income statement.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about financial data' },
        previousSections: { type: 'object', description: 'Results from previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/financial-analysis',
  },
  // === CH02: Business Environment (5 sections) ===
  {
    name: 'bizscope-pest-analysis',
    description: 'PEST analysis with exactly 4 factors per category (P4+E4+S4+T4=16 total) + Five Forces scores. Search for: political/regulatory, economic, social/demographic, technology trends.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about PEST factors' },
        previousSections: { type: 'object', description: 'Results from previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/pest-analysis',
  },
  {
    name: 'bizscope-five-forces-detail',
    description: 'Porter 5 Forces detailed analysis per axis with PEST cross-mapping. Search for: industry competition, barriers, supplier/buyer power. Requires pest-analysis in previousSections.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about industry competition' },
        previousSections: { type: 'object', description: 'Must include "pest" from bizscope-pest-analysis' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/five-forces-detail',
  },
  {
    name: 'bizscope-pest-forces-matrix',
    description: 'Compute PEST x 5Forces cross-matrix with influence scores. Pure computation — no research needed. Requires previousSections.pest and previousSections.fiveForceDetail.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        previousSections: { type: 'object', description: 'Must include "pest" and "fiveForceDetail"' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/pest-forces-matrix',
  },
  {
    name: 'bizscope-key-env-variables',
    description: 'Derive O1~On opportunities and T1~Tn threats with priority ranking from PEST factors. Pure computation — no research needed. Requires previousSections.pest.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        previousSections: { type: 'object', description: 'Must include "pest" from bizscope-pest-analysis' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/key-env-variables',
  },
  {
    name: 'bizscope-internal-capability',
    description: 'Evaluate internal capabilities with S1~Sn strengths, W1~Wn weaknesses numbering. Search for: R&D, brand, financials, talent, operations, innovation.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about internal capabilities' },
        previousSections: { type: 'object', description: 'Results from previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/internal-capability',
  },
  // === CH03: Corporate Strategy (5 sections) ===
  {
    name: 'bizscope-swot-summary',
    description: 'Merge O/T (from key-env-variables) + S/W (from internal-capability) into SWOT. Pure computation — no research needed. Requires previousSections.keyEnvVariables and previousSections.internalCapability.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        previousSections: { type: 'object', description: 'Must include "keyEnvVariables" and "internalCapability"' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/swot-summary',
  },
  {
    name: 'bizscope-tows-cross-matrix',
    description: 'Generate TOWS cross-matrix dot analysis from SWOT data. Requires previousSections.swot.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Optional: additional strategic context' },
        previousSections: { type: 'object', description: 'Must include "swot" from bizscope-swot-summary' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/tows-cross-matrix',
  },
  {
    name: 'bizscope-strategy-combination',
    description: 'Derive 20 strategies: SO 5 + ST 5 + WO 5 + WT 5 from SWOT cross-analysis. Requires previousSections.swot and previousSections.towsCrossMatrix.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Optional: industry best practices' },
        previousSections: { type: 'object', description: 'Must include "swot" and "towsCrossMatrix"' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/strategy-combination',
  },
  {
    name: 'bizscope-seven-s-reclassify',
    description: 'Reclassify 20 strategies into McKinsey 7S framework with execution status and progress. Search for: org structure, culture, leadership, talent. Requires previousSections.strategyCombination.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about organization structure, culture, leadership' },
        previousSections: { type: 'object', description: 'Must include "strategyCombination"' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/seven-s-alignment',
  },
  {
    name: 'bizscope-priority-matrix',
    description: 'Compute priority matrix: quick-win / major-project / fill-in / thankless. Pure computation. Requires previousSections.strategyCombination and previousSections.sevenS.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        previousSections: { type: 'object', description: 'Must include "strategyCombination" and "sevenS"' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/priority-matrix',
  },
  // === CH04: Business Expansion (4 sections) ===
  {
    name: 'bizscope-strategy-current-comparison',
    description: 'Compare derived strategies vs company current strategy with completion status. Search for: official strategy, IR materials, CEO vision, press releases.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about official strategy' },
        previousSections: { type: 'object', description: 'Should include "priorityMatrix" and "sevenS"' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/strategy-current-comparison',
  },
  {
    name: 'bizscope-competitor-comparison',
    description: 'Analyze 4-5 competitors with detailed profiles including revenue, employees, founded year. Search for: top competitors, market share, revenue, strengths, weaknesses.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about competitors' },
        previousSections: { type: 'object', description: 'Results from previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/competitor-comparison',
  },
  {
    name: 'bizscope-reference-case',
    description: 'Analyze 1-3 reference success cases from other industries/competitors relevant to derived strategies. Search for: success stories, transformation cases, industry benchmarks. Requires previousSections.strategyCombination.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about success cases' },
        previousSections: { type: 'object', description: 'Should include "strategyCombination"' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/reference-case',
  },
  {
    name: 'bizscope-final-implications',
    description: 'Generate final implications with tech roadmap and recommended partners. Search for: industry best practices, benchmark KPIs, transformation cases.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about best practices' },
        previousSections: { type: 'object', description: 'Results from all previous BizScope tools' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/final-implications',
  },
  // === Idea analysis tools (15 + 1 scorecard) ===
  // CH01: 아이디어 검증
  {
    name: 'bizscope-idea-analyze',
    description: 'Start idea/app feasibility analysis. Pass idea description and AI generates overview with problem-solution analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the app/service idea' },
        ideaDescription: { type: 'string', description: 'Detailed description' },
        targetMarket: { type: 'string', description: 'Target market/users (optional)' },
        research: { type: 'string', description: 'Web search results about similar apps' },
      },
      required: ['ideaName', 'ideaDescription'],
    },
    endpoint: '/api/webmcp/idea-overview',
  },
  {
    name: 'bizscope-idea-target-customer',
    description: 'Deep-dive target customer: 3-4 detailed personas, customer journey map, switching barriers, willingness-to-pay. Requires idea-overview.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about target customers' },
        previousSections: { type: 'object', description: 'Must include ideaOverview' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/idea-target-customer',
  },
  // CH02: 시장 분석
  {
    name: 'bizscope-market-size',
    description: 'Estimate TAM/SAM/SOM market size for a business idea. Search for: market research reports, industry size, growth forecasts.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about market size' },
        previousSections: { type: 'object', description: 'Results from previous idea tools' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/market-size',
  },
  {
    name: 'bizscope-market-environment',
    description: 'Analyze market environment: PEST summary, tech trends, regulatory landscape, consumer behavior, market maturity. Requires market-size.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about market environment, regulations, trends' },
        previousSections: { type: 'object', description: 'Must include marketSize' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/market-environment',
  },
  {
    name: 'bizscope-competitor-scan',
    description: 'Scan for existing competitors/similar apps. Search for: similar apps on Product Hunt, Crunchbase, app stores.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about competitors' },
        previousSections: { type: 'object', description: 'Results from previous idea tools' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/competitor-scan',
  },
  {
    name: 'bizscope-competitor-positioning',
    description: 'Create 2-axis positioning map, analyze substitutes, competitor vulnerabilities, market whitespace. Requires competitor-scan.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about competitive positioning' },
        previousSections: { type: 'object', description: 'Must include competitorScan' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/competitor-positioning',
  },
  // CH03: 전략 수립
  {
    name: 'bizscope-differentiation',
    description: 'Analyze differentiation factors, positioning, and competitive moat. Requires competitor-scan results.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results' },
        previousSections: { type: 'object', description: 'Must include competitorScan' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/differentiation',
  },
  {
    name: 'bizscope-business-model',
    description: 'Suggest revenue models and pricing strategy. Search for: pricing models, monetization, SaaS benchmarks.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about pricing' },
        previousSections: { type: 'object', description: 'Results from previous idea tools' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/business-model',
  },
  {
    name: 'bizscope-unit-economics',
    description: 'Deep-dive unit economics: CAC, LTV, LTV/CAC, break-even, burn rate, runway, sensitivity. Requires business-model.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about unit economics benchmarks' },
        previousSections: { type: 'object', description: 'Must include businessModel' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/unit-economics',
  },
  {
    name: 'bizscope-go-to-market',
    description: 'Design GTM channel strategy and phased launch roadmap. Requires business-model.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about GTM' },
        previousSections: { type: 'object', description: 'Must include businessModel' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/go-to-market',
  },
  {
    name: 'bizscope-growth-strategy',
    description: 'Growth strategy: viral/content/partnership, network effects, expansion stages, international. Requires go-to-market.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about growth strategies' },
        previousSections: { type: 'object', description: 'Must include goToMarket' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/growth-strategy',
  },
  // CH04: 실행 & 판정
  {
    name: 'bizscope-financial-projection',
    description: '3-year financial projection with monthly/yearly data, scenario analysis (optimistic/base/pessimistic), funding plan. Requires unit-economics.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about financial benchmarks' },
        previousSections: { type: 'object', description: 'Must include unitEconomics' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/financial-projection',
  },
  {
    name: 'bizscope-risk-assessment',
    description: 'Assess market/technical/financial/regulatory/competitive risks with pivot options and worst-case scenarios.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about risks' },
        previousSections: { type: 'object', description: 'Must include competitorScan and businessModel' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/risk-assessment',
  },
  {
    name: 'bizscope-idea-reference-case',
    description: 'Analyze 2-3 similar startup success cases and 1 failure case with lessons. Requires growth-strategy.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about similar startup stories' },
        previousSections: { type: 'object', description: 'Must include growthStrategy' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/idea-reference-case',
  },
  {
    name: 'bizscope-scorecard',
    description: 'Run full idea feasibility verdict: 9-dimension scorecard with Go/No-Go recommendation. Requires prior idea analysis data.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'Description' },
        research: { type: 'string', description: 'Additional research data' },
        previousSections: { type: 'object', description: 'Must include businessModel and riskAssessment' },
      },
      required: ['ideaName', 'previousSections'],
    },
    endpoint: '/api/webmcp/scorecard',
  },
  // === Utility tools (2) ===
  {
    name: 'bizscope-web-search',
    description: 'Search the web for any information. Call this multiple times with different queries to build comprehensive research BEFORE calling analysis tools.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query — be specific, include company name and topic' },
        count: { type: 'number', description: 'Number of results (default 10, max 20)' },
      },
      required: ['query'],
    },
    endpoint: '/api/tools/search',
  },
  {
    name: 'bizscope-financial-data',
    description: 'Get financial data for a company — revenue, profit, employees, market cap. Call this early to get concrete numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        metrics: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific metrics to search for',
        },
      },
      required: ['companyName'],
    },
    endpoint: '/api/tools/financial',
  },
  {
    name: 'bizscope-income-history',
    description: 'Get 3-year income statement history. Returns revenue, operating income, net income per year.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name or ticker' },
        action: { type: 'string', enum: ['income-history'], description: 'Fixed: income-history' },
      },
      required: ['companyName', 'action'],
    },
    endpoint: '/api/tools/financial',
  },
  {
    name: 'bizscope-balance-sheet',
    description: 'Get balance sheet history. Returns assets, liabilities, equity per year.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name or ticker' },
        action: { type: 'string', enum: ['balance-sheet'], description: 'Fixed: balance-sheet' },
      },
      required: ['companyName', 'action'],
    },
    endpoint: '/api/tools/financial',
  },
  {
    name: 'bizscope-stock-history',
    description: 'Get 1-year monthly stock price history for charting.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name or ticker' },
        action: { type: 'string', enum: ['stock-history'], description: 'Fixed: stock-history' },
      },
      required: ['companyName', 'action'],
    },
    endpoint: '/api/tools/financial',
  },
];

export function WebMCPRegistration() {
  useEffect(() => {
    if (!navigator.modelContext) return;

    const registered: string[] = [];

    for (const tool of TOOLS) {
      try {
        navigator.modelContext.registerTool({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: { readOnlyHint: true, openWorldHint: true },
          async execute(input, _agent) {
            const res = await fetch(`${API_BASE}${tool.endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            });
            if (!res.ok) {
              const text = await res.text();
              return { content: [{ type: 'text', text: JSON.stringify({ error: text }) }] };
            }
            const data = await res.json();
            return { content: [{ type: 'text', text: JSON.stringify(data) }] };
          },
        });
        registered.push(tool.name);
      } catch {
        // Tool already registered or API not available
      }
    }

    return () => {
      if (!navigator.modelContext) return;
      for (const name of registered) {
        try {
          navigator.modelContext.unregisterTool(name);
        } catch {
          // Already unregistered
        }
      }
    };
  }, []);

  return null;
}

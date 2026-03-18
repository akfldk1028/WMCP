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
  {
    name: 'bizscope-company-overview',
    description:
      'Analyze a company profile from research data. Before calling, search for: founding date, headquarters, employee count, annual revenue, main products/services, key strengths, recent news (last 6 months).',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about the company (founding, revenue, products, news, etc.)' },
        previousSections: { type: 'object', description: 'Results from previous BizScope AI tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/company-overview',
  },
  {
    name: 'bizscope-pest-analysis',
    description:
      'Perform PEST + Porter Five Forces analysis from research data. Before calling, search for: political/regulatory changes, economic indicators, social/demographic trends, technology disruptions, and industry competitive structure affecting the company.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about political, economic, social, technological factors and industry competition' },
        previousSections: { type: 'object', description: 'Results from previous BizScope AI tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/pest-analysis',
  },
  {
    name: 'bizscope-possibility-impact-matrix',
    description:
      'Compute a Possibility x Impact matrix from PEST analysis results. This is a pure computation tool — no research needed. Requires previousSections.pest to be present.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        previousSections: { type: 'object', description: 'Must include "pest" from bizscope-pest-analysis' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/possibility-impact-matrix',
  },
  {
    name: 'bizscope-internal-capability',
    description:
      'Evaluate internal capabilities from research data. Before calling, search for: R&D investment, brand value/recognition, financial health (debt ratio, cash flow), talent/HR practices, operational efficiency, innovation pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about R&D, brand, financials, talent, operations, innovation' },
        previousSections: { type: 'object', description: 'Results from previous BizScope AI tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/internal-capability',
  },
  {
    name: 'bizscope-swot-summary',
    description:
      'Merge PEST and internal capability results into a SWOT summary. This is a pure computation tool — no research needed. Requires previousSections.pest and previousSections.internalCapability.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        previousSections: { type: 'object', description: 'Must include "pest" and "internalCapability" from previous tools' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/swot-summary',
  },
  {
    name: 'bizscope-tows-cross-matrix',
    description:
      'Generate TOWS cross-matrix from SWOT data. Optionally provide additional research about the company strategic context to improve cross-analysis quality.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Optional: additional strategic context from web search' },
        previousSections: { type: 'object', description: 'Must include "swot" from bizscope-swot-summary' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/tows-cross-matrix',
  },
  {
    name: 'bizscope-strategy-combination',
    description:
      'Derive SO/ST/WO/WT strategy combinations from SWOT data. Optionally provide research about industry best practices and strategic precedents.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Optional: industry best practices and strategic precedents' },
        previousSections: { type: 'object', description: 'Must include "swot" from bizscope-swot-summary' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/strategy-combination',
  },
  {
    name: 'bizscope-seven-s-alignment',
    description:
      'Perform McKinsey 7S alignment analysis from research data. Before calling, search for: organizational structure, corporate culture, leadership style, talent management, skill development programs, internal systems/processes.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about org structure, culture, leadership, talent, skills, systems' },
        previousSections: { type: 'object', description: 'Should include "strategyCombination" from previous tools' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/seven-s-alignment',
  },
  {
    name: 'bizscope-priority-matrix',
    description:
      'Compute a priority matrix (quick-win / major-project / fill-in / thankless) from strategy combination and 7S data. This is a pure computation tool — no research needed. Requires previousSections.strategyCombination and previousSections.sevenS.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        previousSections: { type: 'object', description: 'Must include "strategyCombination" and "sevenS" from previous tools' },
      },
      required: ['companyName', 'previousSections'],
    },
    endpoint: '/api/webmcp/priority-matrix',
  },
  {
    name: 'bizscope-strategy-current-comparison',
    description:
      'Compare derived strategies with the company current strategy. Before calling, search for: official corporate strategy, IR materials, press releases, annual report strategy sections, CEO vision statements.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about official strategy, IR materials, press releases' },
        previousSections: { type: 'object', description: 'Should include "priorityMatrix" and "sevenS" from previous tools' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/strategy-current-comparison',
  },
  {
    name: 'bizscope-competitor-comparison',
    description:
      'Analyze 3-5 competitors from research data. Before calling, search for: top competitors by market share, each competitor revenue/strengths/weaknesses, market positioning, key differentiators.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about competitors: revenue, strengths, weaknesses, market share, differentiators' },
        previousSections: { type: 'object', description: 'Results from previous BizScope AI tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/competitor-comparison',
  },
  {
    name: 'bizscope-final-implications',
    description:
      'Generate final implications, action items, and roadmap from all analysis. Before calling, search for: industry best practices, similar company transformation cases, benchmark KPIs.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name to analyze' },
        research: { type: 'string', description: 'Web search results about industry best practices, similar cases, benchmark KPIs' },
        previousSections: { type: 'object', description: 'Results from all previous BizScope tool calls' },
      },
      required: ['companyName', 'research'],
    },
    endpoint: '/api/webmcp/final-implications',
  },
  // === Idea analysis tools — AI agent uses these for idea feasibility ===
  {
    name: 'bizscope-idea-analyze',
    description:
      'Start a full idea/app feasibility analysis. Pass the idea description and AI will generate an 8-section report with Go/No-Go verdict. Before calling, gather research about similar apps, market size, and competitors.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the app/service idea' },
        ideaDescription: { type: 'string', description: 'Detailed description of what the idea does, problems it solves' },
        targetMarket: { type: 'string', description: 'Target market/users (optional)' },
        research: { type: 'string', description: 'Web search results about similar apps, market data, competitors' },
      },
      required: ['ideaName', 'ideaDescription'],
    },
    endpoint: '/api/webmcp/idea-overview',
  },
  {
    name: 'bizscope-competitor-scan',
    description:
      'Scan for existing competitors/similar apps for a business idea. Before calling, search for: similar apps on Product Hunt, Crunchbase, app stores. Pass the search results as research.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about similar apps, competitors, market landscape' },
        previousSections: { type: 'object', description: 'Results from previous idea analysis tools (ideaOverview)' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/competitor-scan',
  },
  {
    name: 'bizscope-market-size',
    description:
      'Estimate TAM/SAM/SOM market size for a business idea. Before calling, search for: market research reports, industry size data, growth forecasts.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about market size, industry data, growth forecasts' },
        previousSections: { type: 'object', description: 'Results from previous idea analysis tools (ideaOverview)' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/market-size',
  },
  {
    name: 'bizscope-business-model',
    description:
      'Suggest revenue models and unit economics for a business idea. Before calling, search for: similar app pricing, monetization strategies, SaaS/subscription benchmarks.',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'What the idea does' },
        research: { type: 'string', description: 'Web search results about pricing models, monetization, unit economics' },
        previousSections: { type: 'object', description: 'Results from previous idea analysis tools' },
      },
      required: ['ideaName', 'research'],
    },
    endpoint: '/api/webmcp/business-model',
  },
  {
    name: 'bizscope-scorecard',
    description:
      'Run a full idea feasibility verdict and return only the 9-dimension scorecard with Go/No-Go recommendation. Requires prior idea analysis data in previousSections (at minimum businessModel and riskAssessment).',
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the app/service idea' },
        ideaDescription: { type: 'string', description: 'Detailed description of what the idea does' },
        research: { type: 'string', description: 'Additional research data to improve accuracy' },
        previousSections: { type: 'object', description: 'Must include results from prior idea analysis tools (especially businessModel and riskAssessment)' },
      },
      required: ['ideaName', 'previousSections'],
    },
    endpoint: '/api/webmcp/scorecard',
  },
  // === Utility tools — AI agent can call these anytime ===
  {
    name: 'bizscope-web-search',
    description:
      'Search the web for any information. Use this tool to gather research data BEFORE calling analysis tools. You should call this multiple times with different queries to build comprehensive research. For example, search for company financials, then industry trends, then recent news separately.',
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
    description:
      'Get financial data for a company — revenue, operating profit, net income, employees, market cap. Call this early in the analysis to get concrete numbers for the company overview and internal capability sections.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name' },
        metrics: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific metrics to search for (e.g. ["revenue", "R&D spending", "debt ratio"])',
        },
      },
      required: ['companyName'],
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

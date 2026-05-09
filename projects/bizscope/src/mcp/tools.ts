import type { SectionType, PipelineContext, SectionData, IdeaInput } from '@/frameworks/types';
import { runBrainstorm, quickBrainstorm, getAvailableModels } from '@/lib/brainstorm';
import { CONTEXT_KEYS, checkDependencies } from '@/frameworks/shared';
import { generateSection } from '@/lib/claude';
import { bmcGenerateTool, bmcUpdateTool, getBmcSystemPrompt, getCompletionPercentage as getBmcCompletion, type BmcData } from '@/modules/bmc';
import { planStageTools, planStatusTool, getPlanningSystemPrompt, getStagePrompt, getPlanCompletionPercentage as getPlanCompletion, type PlanStage, type ServicePlanData } from '@/modules/service-planning';
import { planToAnalysisTool, mapPlanningToAnalysis } from '@/modules/planning-bridge';

const RESEARCH_MAX_LENGTH = 15_000;

/** Sections that are pure computation (no AI, no research). */
const COMPUTE_SECTIONS: SectionType[] = [
  'key-env-variables',
  'pest-forces-matrix',
  'swot-summary',
  'priority-matrix',
];

/** AI sections where research is optional (will still call generateWithResearch with empty string). */
const RESEARCH_OPTIONAL: SectionType[] = [
  'tows-cross-matrix',
  'strategy-combination',
  'reference-case',
];

type WebMCPGenerator = (ctx: PipelineContext, research: string) => Promise<SectionData>;
type ComputeGenerator = (ctx: PipelineContext) => Promise<SectionData>;

const AI_MODULE_MAP: Partial<Record<SectionType, () => Promise<{ generateWithResearch: WebMCPGenerator }>>> = {
  'company-overview': () => import('@/frameworks/company-overview'),
  'business-model-detail': () => import('@/frameworks/business-model-detail'),
  'kpi-performance': () => import('@/frameworks/kpi-performance'),
  'financial-analysis': () => import('@/frameworks/financial-analysis'),
  'pest-analysis': () => import('@/frameworks/pest'),
  'five-forces-detail': () => import('@/frameworks/five-forces-detail'),
  'internal-capability': () => import('@/frameworks/internal-capability'),
  'tows-cross-matrix': () => import('@/frameworks/tows'),
  'strategy-combination': () => import('@/frameworks/strategy-combination'),
  'seven-s-alignment': () => import('@/frameworks/seven-s'),
  'strategy-current-comparison': () => import('@/frameworks/strategy-current'),
  'competitor-comparison': () => import('@/frameworks/competitor'),
  'reference-case': () => import('@/frameworks/reference-case'),
  'final-implications': () => import('@/frameworks/implications'),
};

const IDEA_AI_MODULE_MAP: Partial<Record<SectionType, () => Promise<{ generateWithResearch: WebMCPGenerator }>>> = {
  'idea-overview': () => import('@/frameworks/idea/validation/overview'),
  'idea-target-customer': () => import('@/frameworks/idea/validation/target-customer'),
  'market-size': () => import('@/frameworks/idea/market/size'),
  'market-environment': () => import('@/frameworks/idea/market/environment'),
  'competitor-scan': () => import('@/frameworks/idea/market/competitor-scan'),
  'competitor-positioning': () => import('@/frameworks/idea/market/competitor-positioning'),
  'differentiation': () => import('@/frameworks/idea/strategy/differentiation'),
  'business-model': () => import('@/frameworks/idea/strategy/business-model'),
  'unit-economics': () => import('@/frameworks/idea/strategy/unit-economics'),
  'go-to-market': () => import('@/frameworks/idea/strategy/go-to-market'),
  'growth-strategy': () => import('@/frameworks/idea/strategy/growth-strategy'),
  'financial-projection': () => import('@/frameworks/idea/execution/financial-projection'),
  'risk-assessment': () => import('@/frameworks/idea/execution/risk-assessment'),
  'idea-reference-case': () => import('@/frameworks/idea/execution/reference-case'),
  'action-plan': () => import('@/frameworks/idea/execution/action-plan'),
};

const COMPUTE_MODULE_MAP: Record<string, () => Promise<{ generate: ComputeGenerator }>> = {
  'key-env-variables': () => import('@/frameworks/key-env-variables'),
  'pest-forces-matrix': () => import('@/frameworks/pest-forces-matrix'),
  'swot-summary': () => import('@/frameworks/swot'),
  'priority-matrix': () => import('@/frameworks/priority-matrix'),
};

function buildContext(
  companyName: string,
  previousSections?: Record<string, unknown>,
  ideaInput?: IdeaInput,
): PipelineContext {
  const ctx: PipelineContext = { companyName };
  if (ideaInput) ctx.ideaInput = ideaInput;
  if (!previousSections) return ctx;

  for (const [, contextKey] of Object.entries(CONTEXT_KEYS)) {
    const value = previousSections[contextKey as string];
    if (value != null) {
      (ctx as unknown as Record<string, unknown>)[contextKey as string] = value;
    }
  }
  return ctx;
}

async function executeSection(
  sectionType: SectionType,
  companyName: string,
  isIdeaSection: boolean,
  research?: string,
  previousSections?: Record<string, unknown>,
  ideaInput?: IdeaInput,
): Promise<SectionData> {
  const ctx = buildContext(companyName, previousSections, ideaInput);

  // MCP server is for AI agents — use English error messages
  const depError = checkDependencies(sectionType, ctx, 'en');
  if (depError) throw new Error(depError);

  if (COMPUTE_SECTIONS.includes(sectionType)) {
    const mod = await COMPUTE_MODULE_MAP[sectionType]();
    return mod.generate(ctx);
  }

  const aiMap = isIdeaSection ? IDEA_AI_MODULE_MAP : AI_MODULE_MAP;
  const loader = aiMap[sectionType];
  if (!loader) throw new Error(`No generator for ${sectionType}`);

  if (!research && !RESEARCH_OPTIONAL.includes(sectionType)) {
    throw new Error('research is required for this section. Use bizscope-web-search first.');
  }

  const mod = await loader();
  const trimmedResearch = (research ?? '').slice(0, RESEARCH_MAX_LENGTH);
  return mod.generateWithResearch(ctx, trimmedResearch);
}

// ---------------------------------------------------------------------------
// Tool definition type
// ---------------------------------------------------------------------------

export interface MCPToolDef {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function makeCompanyTool(
  sectionType: SectionType,
  name: string,
  description: string,
  researchRequired: boolean,
): MCPToolDef {
  const properties: Record<string, unknown> = {
    companyName: { type: 'string', description: 'Company name to analyze' },
    previousSections: { type: 'object', description: 'Results from previous BizScope tool calls (keyed by context key)' },
  };
  const required = ['companyName'];

  if (researchRequired) {
    properties.research = { type: 'string', description: 'Web search results / research data (use bizscope-web-search first)' };
    required.push('research');
  }

  return {
    name,
    description,
    inputSchema: { type: 'object', properties, required },
    async execute(args) {
      return executeSection(
        sectionType,
        args.companyName as string,
        false,
        args.research as string | undefined,
        args.previousSections as Record<string, unknown> | undefined,
      );
    },
  };
}

function makeIdeaTool(
  sectionType: SectionType,
  name: string,
  description: string,
): MCPToolDef {
  return {
    name,
    description,
    inputSchema: {
      type: 'object',
      properties: {
        ideaName: { type: 'string', description: 'Name of the idea' },
        ideaDescription: { type: 'string', description: 'Detailed description' },
        targetMarket: { type: 'string', description: 'Target market (optional)' },
        research: { type: 'string', description: 'Web search results (use bizscope-web-search first)' },
        previousSections: { type: 'object', description: 'Previous tool results (keyed by context key)' },
      },
      required: ['ideaName', 'research'],
    },
    async execute(args) {
      const ideaInput: IdeaInput = {
        name: args.ideaName as string,
        description: (args.ideaDescription as string) ?? '',
        targetMarket: args.targetMarket as string | undefined,
      };
      return executeSection(
        sectionType,
        (args.ideaName as string).slice(0, 200),
        true,
        args.research as string,
        args.previousSections as Record<string, unknown> | undefined,
        ideaInput,
      );
    },
  };
}

// ---------------------------------------------------------------------------
// All 28 tools
// ---------------------------------------------------------------------------

export const MCP_TOOLS: MCPToolDef[] = [
  // === Company sections (18) ===
  makeCompanyTool('company-overview', 'bizscope-company-overview',
    'Analyze company profile. Search for: founding date, HQ, employees, revenue, products, news, M&A history, governance.', true),
  makeCompanyTool('business-model-detail', 'bizscope-business-model-detail',
    'Analyze business model in detail: revenue streams, platform components, value chain, commission structure. Requires company-overview.', true),
  makeCompanyTool('kpi-performance', 'bizscope-kpi-performance',
    'Analyze KPIs: MAU, transaction volume, downloads, market share. Requires company-overview.', true),
  makeCompanyTool('financial-analysis', 'bizscope-financial-analysis',
    'Analyze financials: 3-year P&L, cost structure, growth/stability indicators. Requires company-overview.', true),
  makeCompanyTool('pest-analysis', 'bizscope-pest-analysis',
    'PEST analysis with exactly 4 factors per category (P/E/S/T = 16 total). Requires company-overview.', true),
  makeCompanyTool('five-forces-detail', 'bizscope-five-forces-detail',
    'Porter 5 Forces detailed analysis with PEST cross-mapping. Requires pest-analysis.', true),
  makeCompanyTool('pest-forces-matrix', 'bizscope-pest-forces-matrix',
    'Compute PEST x 5Forces cross-matrix. Pure computation -- no research needed. Requires pest-analysis and five-forces-detail.', false),
  makeCompanyTool('key-env-variables', 'bizscope-key-env-variables',
    'Derive O/T environment variables with priority ranking from PEST. Pure computation -- no research needed. Requires pest-analysis.', false),
  makeCompanyTool('internal-capability', 'bizscope-internal-capability',
    'Evaluate internal capabilities with S1~Sn/W1~Wn numbering. Requires company-overview.', true),
  makeCompanyTool('swot-summary', 'bizscope-swot-summary',
    'Merge O/T (from key-env-variables) + S/W (from internal-capability) into SWOT. Pure computation -- no research needed.', false),
  makeCompanyTool('tows-cross-matrix', 'bizscope-tows-cross-matrix',
    'Generate TOWS cross-matrix from SWOT. Research optional. Requires swot-summary.', false),
  makeCompanyTool('strategy-combination', 'bizscope-strategy-combination',
    'Derive 20 strategies (SO/ST/WO/WT x 5 each) from SWOT. Research optional. Requires swot-summary and tows-cross-matrix.', false),
  makeCompanyTool('seven-s-alignment', 'bizscope-seven-s-reclassify',
    'Reclassify 20 strategies into McKinsey 7S framework with execution status. Requires strategy-combination.', true),
  makeCompanyTool('priority-matrix', 'bizscope-priority-matrix',
    'Compute priority matrix (quick-win/major-project/fill-in/thankless). Pure computation. Requires strategy-combination and seven-s-alignment.', false),
  makeCompanyTool('strategy-current-comparison', 'bizscope-strategy-current-comparison',
    'Compare derived strategies vs current company strategy. Requires priority-matrix and seven-s-alignment.', true),
  makeCompanyTool('competitor-comparison', 'bizscope-competitor-comparison',
    'Analyze 4-5 competitors in detail. Requires company-overview.', true),
  makeCompanyTool('reference-case', 'bizscope-reference-case',
    'Analyze 1-3 reference cases from other industries/competitors. Research optional. Requires strategy-combination.', false),
  makeCompanyTool('final-implications', 'bizscope-final-implications',
    'Generate final implications, tech roadmap, and recommended partners. Requires priority-matrix, strategy-current-comparison, competitor-comparison, and reference-case.', true),

  // === Idea sections (15) ===
  // CH01: 아이디어 검증
  makeIdeaTool('idea-overview', 'bizscope-idea-overview',
    'Analyze idea feasibility: problem statement, solution, target user, unique value.'),
  makeIdeaTool('idea-target-customer', 'bizscope-idea-target-customer',
    'Deep-dive target customer analysis: 3-4 detailed personas, customer journey, switching barriers, willingness to pay. Requires idea-overview.'),
  // CH02: 시장 분석
  makeIdeaTool('market-size', 'bizscope-market-size',
    'Estimate TAM/SAM/SOM market size for idea. Requires idea-overview.'),
  makeIdeaTool('market-environment', 'bizscope-market-environment',
    'Analyze market environment: PEST summary, tech trends, regulations, consumer behavior, market maturity. Requires market-size.'),
  makeIdeaTool('competitor-scan', 'bizscope-competitor-scan',
    'Scan for existing competitors/similar apps.'),
  makeIdeaTool('competitor-positioning', 'bizscope-competitor-positioning',
    'Create 2-axis positioning map, analyze substitutes, competitor vulnerabilities, market whitespace. Requires competitor-scan.'),
  // CH03: 전략 수립
  makeIdeaTool('differentiation', 'bizscope-differentiation',
    'Analyze differentiation factors and moat. Requires competitor-scan.'),
  makeIdeaTool('business-model', 'bizscope-business-model',
    'Suggest revenue models and pricing strategy. Requires idea-overview and market-size.'),
  makeIdeaTool('unit-economics', 'bizscope-unit-economics',
    'Deep-dive unit economics: CAC, LTV, LTV/CAC ratio, break-even point, burn rate, runway. Requires business-model.'),
  makeIdeaTool('go-to-market', 'bizscope-go-to-market',
    'Design GTM channel strategy and launch roadmap. Requires business-model.'),
  makeIdeaTool('growth-strategy', 'bizscope-growth-strategy',
    'Growth strategy: viral/content/partnership, network effects, expansion stages, international. Requires go-to-market.'),
  // CH04: 실행 & 판정
  makeIdeaTool('financial-projection', 'bizscope-financial-projection',
    '3-year financial projection with monthly/yearly data, scenario analysis, funding plan. Requires unit-economics.'),
  makeIdeaTool('risk-assessment', 'bizscope-risk-assessment',
    'Assess market/technical/financial/regulatory/competitive risks with pivot options. Requires competitor-scan and business-model.'),
  makeIdeaTool('idea-reference-case', 'bizscope-idea-reference-case',
    'Analyze 2-3 similar startup success cases and 1 failure case with lessons. Requires growth-strategy.'),
  makeIdeaTool('action-plan', 'bizscope-action-plan',
    'Generate action plan with milestones, team, 9-dimension scorecard, and Go/No-Go verdict. Requires business-model and risk-assessment.'),

  // === Utility tools (2) ===
  {
    name: 'bizscope-web-search',
    description: 'Search the web for any information. Use this to gather research data BEFORE calling analysis tools.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        count: { type: 'number', description: 'Number of results (default 10, max 20)' },
      },
      required: ['query'],
    },
    async execute(args) {
      const { searchWeb } = await import('@/lib/search');
      const result = await searchWeb(args.query as string, Math.min((args.count as number) ?? 10, 20));
      return { results: result };
    },
  },
  {
    name: 'bizscope-financial-data',
    description: 'Get financial data for a company -- revenue, profit, employees, market cap. Uses Yahoo Finance.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name or ticker symbol' },
        metrics: { type: 'array', items: { type: 'string' }, description: 'Specific metrics to search (optional)' },
      },
      required: ['companyName'],
    },
    async execute(args) {
      const { getCompanyFinancials, formatFinancialsAsResearch } = await import('@/lib/finance');
      const data = await getCompanyFinancials(args.companyName as string);
      if (!data) return { error: 'Company not found or financial data unavailable' };
      return { data, formatted: formatFinancialsAsResearch(data) };
    },
  },
  {
    name: 'bizscope-income-history',
    description: 'Get 3-year income statement history (revenue, operating income, net income, EBITDA per year). Returns structured data for charts.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name or ticker symbol' },
      },
      required: ['companyName'],
    },
    async execute(args) {
      const { getIncomeHistory } = await import('@/lib/finance');
      const data = await getIncomeHistory(args.companyName as string);
      return { incomeHistory: data };
    },
  },
  {
    name: 'bizscope-balance-sheet',
    description: 'Get balance sheet history (total assets, liabilities, equity, debt, cash, current ratio). Returns structured data for charts.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name or ticker symbol' },
      },
      required: ['companyName'],
    },
    async execute(args) {
      const { getBalanceSheet } = await import('@/lib/finance');
      const data = await getBalanceSheet(args.companyName as string);
      return { balanceSheet: data };
    },
  },
  {
    name: 'bizscope-stock-history',
    description: 'Get 1-year monthly stock price history (date, close price, volume). Returns structured data for price charts.',
    inputSchema: {
      type: 'object',
      properties: {
        companyName: { type: 'string', description: 'Company name or ticker symbol' },
      },
      required: ['companyName'],
    },
    async execute(args) {
      const { getStockHistory } = await import('@/lib/finance');
      const data = await getStockHistory(args.companyName as string);
      return { stockHistory: data };
    },
  },

  // === Planning tools (12) ===

  {
    ...bmcGenerateTool,
    async execute(args) {
      const systemPrompt = getBmcSystemPrompt();
      const userMessage = `Generate a complete Business Model Canvas for the following idea. Output each of the 9 blocks with 3-5 concise entries each.\n\nIdea: ${args.ideaName}\nDescription: ${args.ideaDescription}${args.research ? `\n\nResearch context:\n${(args.research as string).slice(0, 15_000)}` : ''}`;
      const text = await generateSection(systemPrompt, userMessage);
      return { content: text };
    },
  },
  {
    ...bmcUpdateTool,
    async execute(args) {
      return { block: args.block, entries: args.entries, notes: args.notes, mode: args.mode ?? 'replace' };
    },
  },
  ...planStageTools.map((tool) => ({
    ...tool,
    async execute(args: Record<string, unknown>) {
      const stage = tool.name.replace('bizscope-plan-', '') as PlanStage;
      const systemPrompt = getPlanningSystemPrompt();
      const stagePrompt = getStagePrompt(
        stage,
        args.previousStages as Partial<Record<string, { sections: Record<string, unknown> }>> | undefined,
      );
      const userMessage = `${stagePrompt}\n\nIdea: ${args.ideaName}\nDescription: ${args.ideaDescription}${args.research ? `\n\nResearch:\n${(args.research as string).slice(0, 15_000)}` : ''}`;
      const text = await generateSection(systemPrompt, userMessage);
      return { stage, content: text };
    },
  })),
  {
    ...planStatusTool,
    async execute(args: Record<string, unknown>) {
      const bmcPct = args.bmcData ? getBmcCompletion(args.bmcData as BmcData) : 0;
      const planPct = args.planData ? getPlanCompletion(args.planData as ServicePlanData) : 0;
      const overall = Math.round(((bmcPct + planPct) / 2) * 10) / 10;
      return { bmcCompletion: bmcPct, planCompletion: planPct, overall };
    },
  },
  {
    ...planToAnalysisTool,
    async execute(args: Record<string, unknown>) {
      const mapped = mapPlanningToAnalysis(args.bmcData as BmcData, args.planData as ServicePlanData);
      return { mappedSections: mapped, sectionCount: Object.keys(mapped).length };
    },
  },
  // --- Brainstorm tools (multi-model debate) ---
  {
    name: 'bizscope-brainstorm',
    description: 'Run a multi-model brainstorm debate on a topic. Multiple AI models discuss in rounds, then synthesize a verdict. Use for architecture decisions, strategy evaluation, or any topic needing diverse perspectives.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string', description: 'The topic or question to brainstorm about' },
        context: { type: 'string', description: 'Optional context (e.g. current BMC data, previous analysis results)' },
        rounds: { type: 'number', description: 'Number of debate rounds (default: 2, max: 4)' },
      },
      required: ['topic'],
    },
    async execute(args: Record<string, unknown>) {
      const topic = args.topic as string;
      const context = args.context as string | undefined;
      const rounds = Math.min(Math.max(Number(args.rounds) || 2, 1), 4);
      const result = await runBrainstorm(topic, { rounds, context });
      return {
        synthesis: result.synthesis,
        modelCount: result.modelCount,
        roundCount: result.rounds.length,
        durationMs: result.totalDurationMs,
        rounds: result.rounds.map((round) =>
          round.map((r) => ({ model: r.modelId, content: r.content.slice(0, 2000), error: r.error })),
        ),
      };
    },
  },
  {
    name: 'bizscope-brainstorm-quick',
    description: 'Get quick parallel opinions from all available AI models on a topic. Single round, no debate — faster than full brainstorm. Use for quick sanity checks or getting diverse viewpoints.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string', description: 'The topic or question' },
        context: { type: 'string', description: 'Optional context' },
      },
      required: ['topic'],
    },
    async execute(args: Record<string, unknown>) {
      const result = await quickBrainstorm(args.topic as string, args.context as string | undefined);
      return { opinions: result.opinions, modelCount: result.modelCount };
    },
  },
  {
    name: 'bizscope-brainstorm-models',
    description: 'List available AI models for brainstorming. Shows which providers are configured.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
    async execute() {
      const models = getAvailableModels();
      return {
        models: models.map((m) => ({ id: m.id, provider: m.provider, model: m.modelId })),
        count: models.length,
      };
    },
  },
];

/** Lookup tool by name. */
export function findTool(name: string): MCPToolDef | undefined {
  return MCP_TOOLS.find((t) => t.name === name);
}

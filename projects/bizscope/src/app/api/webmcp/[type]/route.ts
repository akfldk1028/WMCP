import { NextResponse } from 'next/server';
import type { SectionType, PipelineContext, SectionData, IdeaInput } from '@/frameworks/types';
import { COMPANY_SECTION_ORDER, IDEA_SECTION_ORDER } from '@/frameworks/types';
import { CONTEXT_KEYS, checkDependencies } from '@/frameworks/shared';

// --- Rate limit (20 req/min per IP) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const RESEARCH_MAX_LENGTH = 15_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    if (rateLimitMap.size > 1000) {
      for (const [key, val] of rateLimitMap) {
        if (now > val.resetAt) rateLimitMap.delete(key);
      }
    }
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? '127.0.0.1';
}

/** Sections that are pure computation (no AI, no research). */
const COMPUTE_SECTIONS: SectionType[] = [
  'possibility-impact-matrix',
  'swot-summary',
  'priority-matrix',
];

/** Reconstruct PipelineContext from previousSections object. */
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

type WebMCPGenerator = (ctx: PipelineContext, research: string) => Promise<SectionData>;
type ComputeGenerator = (ctx: PipelineContext) => Promise<SectionData>;

/** Lazy-load AI-powered generators. */
const AI_MODULE_MAP: Partial<Record<SectionType, () => Promise<{ generateWithResearch: WebMCPGenerator }>>> = {
  'company-overview': () => import('@/frameworks/company-overview'),
  'pest-analysis': () => import('@/frameworks/pest'),
  'internal-capability': () => import('@/frameworks/internal-capability'),
  'tows-cross-matrix': () => import('@/frameworks/tows'),
  'strategy-combination': () => import('@/frameworks/strategy-combination'),
  'seven-s-alignment': () => import('@/frameworks/seven-s'),
  'strategy-current-comparison': () => import('@/frameworks/strategy-current'),
  'competitor-comparison': () => import('@/frameworks/competitor'),
  'final-implications': () => import('@/frameworks/implications'),
};

/** Lazy-load pure computation generators. */
const COMPUTE_MODULE_MAP: Record<string, () => Promise<{ generate: ComputeGenerator }>> = {
  'possibility-impact-matrix': () => import('@/frameworks/matrix'),
  'swot-summary': () => import('@/frameworks/swot'),
  'priority-matrix': () => import('@/frameworks/priority-matrix'),
};

/** Lazy-load idea AI generators. */
const IDEA_AI_MODULE_MAP: Partial<Record<SectionType, () => Promise<{ generateWithResearch: WebMCPGenerator }>>> = {
  'idea-overview': () => import('@/frameworks/idea-overview'),
  'market-size': () => import('@/frameworks/market-size'),
  'competitor-scan': () => import('@/frameworks/competitor-scan'),
  'differentiation': () => import('@/frameworks/differentiation'),
  'business-model': () => import('@/frameworks/business-model'),
  'go-to-market': () => import('@/frameworks/go-to-market'),
  'risk-assessment': () => import('@/frameworks/risk-assessment'),
  'action-plan': () => import('@/frameworks/action-plan'),
};

const RESEARCH_OPTIONAL: SectionType[] = ['tows-cross-matrix', 'strategy-combination'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  // Rate limit
  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json({ error: 'Rate limit exceeded (20 req/min)' }, { status: 429 });
  }

  // API key auth (optional — enabled when BIZSCOPE_API_KEY is set)
  const apiKey = process.env.BIZSCOPE_API_KEY;
  if (apiKey) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { type } = await params;

  const ALL_SECTIONS: SectionType[] = [...COMPANY_SECTION_ORDER, ...IDEA_SECTION_ORDER];
  if (!ALL_SECTIONS.includes(type as SectionType)) {
    return NextResponse.json({ error: `Unknown section type: ${type}` }, { status: 400 });
  }

  const sectionType = type as SectionType;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { companyName, ideaName, ideaDescription, targetMarket, research, previousSections } = body as {
    companyName?: string;
    ideaName?: string;
    ideaDescription?: string;
    targetMarket?: string;
    research?: string;
    previousSections?: Record<string, unknown>;
  };

  const isIdeaSection = (IDEA_SECTION_ORDER as readonly string[]).includes(sectionType);

  // For idea sections, ideaName is the primary identifier
  const name = isIdeaSection ? (ideaName ?? companyName) : companyName;
  if (!name) {
    return NextResponse.json({ error: isIdeaSection ? 'ideaName is required' : 'companyName is required' }, { status: 400 });
  }

  const safeName = name.slice(0, 200);
  const isCompute = COMPUTE_SECTIONS.includes(sectionType);

  // Build ideaInput for idea sections
  const ideaInput: IdeaInput | undefined = isIdeaSection && ideaName
    ? { name: ideaName, description: ideaDescription ?? '', targetMarket }
    : undefined;

  // AI-powered sections require research (except optional/compute ones)
  if (!isCompute && !research && !RESEARCH_OPTIONAL.includes(sectionType)) {
    return NextResponse.json(
      { error: 'research is required for this section. Search the web first and pass results.' },
      { status: 400 },
    );
  }

  // Build context from previousSections
  const ctx = buildContext(safeName, previousSections, ideaInput);

  // Check dependencies
  const depError = checkDependencies(sectionType, ctx);
  if (depError) {
    return NextResponse.json({ error: depError }, { status: 400 });
  }

  try {
    let data: SectionData;

    if (isCompute) {
      const mod = await COMPUTE_MODULE_MAP[sectionType]();
      data = await mod.generate(ctx);
    } else {
      // Pick the right module map
      const aiMap = isIdeaSection ? IDEA_AI_MODULE_MAP : AI_MODULE_MAP;
      const loader = aiMap[sectionType];
      if (!loader) {
        return NextResponse.json({ error: `No generator for ${sectionType}` }, { status: 500 });
      }
      const mod = await loader();
      const trimmedResearch = (research ?? '').slice(0, RESEARCH_MAX_LENGTH);
      data = await mod.generateWithResearch(ctx, trimmedResearch);
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import type { SectionType, PipelineContext, SectionData, ReportMode, IdeaInput } from '@/frameworks/types';
import { COMPANY_SECTION_ORDER, IDEA_SECTION_ORDER } from '@/frameworks/types';
import { searchForSection } from '@/lib/search';
import { getCompanyFinancials, formatFinancialsAsResearch } from '@/lib/finance';
import { getLicenseInfo, useCredit } from '@/lib/kv';

// --- IP-based rate limit (20 req/min) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

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

const ALL_SECTIONS: SectionType[] = [...COMPANY_SECTION_ORDER, ...IDEA_SECTION_ORDER];

/** Pure computation sections — no AI, no search needed. */
const COMPUTE_SECTIONS: SectionType[] = [
  'possibility-impact-matrix',
  'swot-summary',
  'priority-matrix',
];

/** AI-powered company sections that need research. */
const COMPANY_AI_MODULE_MAP: Partial<
  Record<SectionType, () => Promise<{ generateWithResearch: (ctx: PipelineContext, research: string) => Promise<SectionData> }>>
> = {
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

/** AI-powered idea sections that need research. */
const IDEA_AI_MODULE_MAP: Partial<
  Record<SectionType, () => Promise<{ generateWithResearch: (ctx: PipelineContext, research: string) => Promise<SectionData> }>>
> = {
  'idea-overview': () => import('@/frameworks/idea-overview'),
  'market-size': () => import('@/frameworks/market-size'),
  'competitor-scan': () => import('@/frameworks/competitor-scan'),
  'differentiation': () => import('@/frameworks/differentiation'),
  'business-model': () => import('@/frameworks/business-model'),
  'go-to-market': () => import('@/frameworks/go-to-market'),
  'risk-assessment': () => import('@/frameworks/risk-assessment'),
  'action-plan': () => import('@/frameworks/action-plan'),
};

/** Compute section generators. */
const COMPUTE_MODULE_MAP: Record<
  string,
  () => Promise<{ generate: (ctx: PipelineContext) => Promise<SectionData> }>
> = {
  'possibility-impact-matrix': () => import('@/frameworks/matrix'),
  'swot-summary': () => import('@/frameworks/swot'),
  'priority-matrix': () => import('@/frameworks/priority-matrix'),
};

/** Fallback generators (no research) for all sections. */
const FALLBACK_MODULE_MAP: Record<
  string,
  () => Promise<{ generate: (ctx: PipelineContext) => Promise<SectionData> }>
> = {
  // Company
  'company-overview': () => import('@/frameworks/company-overview'),
  'pest-analysis': () => import('@/frameworks/pest'),
  'internal-capability': () => import('@/frameworks/internal-capability'),
  'tows-cross-matrix': () => import('@/frameworks/tows'),
  'strategy-combination': () => import('@/frameworks/strategy-combination'),
  'seven-s-alignment': () => import('@/frameworks/seven-s'),
  'strategy-current-comparison': () => import('@/frameworks/strategy-current'),
  'competitor-comparison': () => import('@/frameworks/competitor'),
  'final-implications': () => import('@/frameworks/implications'),
  // Idea
  'idea-overview': () => import('@/frameworks/idea-overview'),
  'market-size': () => import('@/frameworks/market-size'),
  'competitor-scan': () => import('@/frameworks/competitor-scan'),
  'differentiation': () => import('@/frameworks/differentiation'),
  'business-model': () => import('@/frameworks/business-model'),
  'go-to-market': () => import('@/frameworks/go-to-market'),
  'risk-assessment': () => import('@/frameworks/risk-assessment'),
  'action-plan': () => import('@/frameworks/action-plan'),
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json({ error: 'Rate limit exceeded (20 req/min)' }, { status: 429 });
  }

  // License key check — if provided, verify it's valid
  const licenseKey = request.headers.get('x-license-key') || '';
  let licensePlan: string | null = null;

  if (licenseKey) {
    try {
      const info = await getLicenseInfo(licenseKey);
      if (!info) {
        return NextResponse.json({ error: 'Invalid license key' }, { status: 403 });
      }
      licensePlan = info.plan;
      // Credit deduction happens once per report in /api/license/use, not per section
    } catch {
      // KV unavailable — allow request (graceful degradation)
    }
  }

  const { type } = await params;

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

  const { companyName, context, mode, ideaInput } = body as {
    companyName: string;
    context: PipelineContext;
    mode?: ReportMode;
    ideaInput?: IdeaInput;
  };

  if (!companyName) {
    return NextResponse.json({ error: 'companyName is required' }, { status: 400 });
  }

  const ctx: PipelineContext = context ?? { companyName };
  if (ideaInput) ctx.ideaInput = ideaInput;
  ctx.ensembleEnabled = licensePlan === 'pro';

  const isIdeaMode = mode === 'idea' || IDEA_SECTION_ORDER.includes(sectionType as never);

  try {
    let data: SectionData;

    if (COMPUTE_SECTIONS.includes(sectionType)) {
      const mod = await COMPUTE_MODULE_MAP[sectionType]();
      data = await mod.generate(ctx);
    } else {
      const searchQuery = isIdeaMode
        ? (ideaInput?.name ?? companyName)
        : companyName;

      const FINANCIAL_SECTIONS: SectionType[] = ['company-overview', 'internal-capability', 'competitor-comparison'];
      const needsFinancials = !isIdeaMode && FINANCIAL_SECTIONS.includes(sectionType);

      const [webResearch, financials] = await Promise.all([
        searchForSection(sectionType, searchQuery, isIdeaMode ? ideaInput : undefined),
        needsFinancials
          ? getCompanyFinancials(companyName).catch(() => null)
          : Promise.resolve(null),
      ]);

      const financialText = financials ? formatFinancialsAsResearch(financials) : '';
      const research = [financialText, webResearch].filter(Boolean).join('\n\n---\n\n');

      if (research) {
        const aiMap = isIdeaMode ? IDEA_AI_MODULE_MAP : COMPANY_AI_MODULE_MAP;
        const loader = aiMap[sectionType];
        if (!loader) {
          return NextResponse.json({ error: `No generator for ${sectionType}` }, { status: 500 });
        }
        const mod = await loader();
        data = await mod.generateWithResearch(ctx, research);
      } else {
        const mod = await FALLBACK_MODULE_MAP[sectionType]();
        data = await mod.generate(ctx);
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

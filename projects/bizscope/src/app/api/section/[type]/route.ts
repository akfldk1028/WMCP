import { NextResponse } from 'next/server';
import type { SectionType, PipelineContext, SectionData } from '@/frameworks/types';
import { SECTION_ORDER } from '@/frameworks/types';

// --- IP-based rate limit (20 req/min) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    // Clean up expired entries periodically
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

const MODULE_MAP: Record<SectionType, () => Promise<{ generate: (ctx: PipelineContext) => Promise<SectionData> }>> = {
  'company-overview': () => import('@/frameworks/company-overview'),
  'pest-analysis': () => import('@/frameworks/pest'),
  'possibility-impact-matrix': () => import('@/frameworks/matrix'),
  'internal-capability': () => import('@/frameworks/internal-capability'),
  'swot-summary': () => import('@/frameworks/swot'),
  'tows-cross-matrix': () => import('@/frameworks/tows'),
  'strategy-combination': () => import('@/frameworks/strategy-combination'),
  'seven-s-alignment': () => import('@/frameworks/seven-s'),
  'priority-matrix': () => import('@/frameworks/priority-matrix'),
  'strategy-current-comparison': () => import('@/frameworks/strategy-current'),
  'competitor-comparison': () => import('@/frameworks/competitor'),
  'final-implications': () => import('@/frameworks/implications'),
};

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

  if (!SECTION_ORDER.includes(type as SectionType)) {
    return NextResponse.json({ error: `Unknown section type: ${type}` }, { status: 400 });
  }

  const sectionType = type as SectionType;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { companyName, context } = body as {
    companyName: string;
    context: PipelineContext;
  };

  if (!companyName) {
    return NextResponse.json({ error: 'companyName is required' }, { status: 400 });
  }

  try {
    const mod = await MODULE_MAP[sectionType]();
    const data = await mod.generate(context ?? { companyName });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { findTool } from '@/mcp/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// NOTE: In-memory — resets per serverless instance. Dev/single-instance only.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    if (rateLimitMap.size > 500) {
      for (const [key, val] of rateLimitMap) {
        if (now > val.resetAt) rateLimitMap.delete(key);
      }
    }
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= 10;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { name } = await params;
  const tool = findTool(name);
  if (!tool) {
    return NextResponse.json({ error: `Unknown tool: ${name}` }, { status: 400 });
  }

  let args: Record<string, unknown>;
  try {
    args = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const result = await tool.execute(args);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Tool execution failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

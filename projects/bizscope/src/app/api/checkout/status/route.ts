import { getCheckoutSession } from '@/lib/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limit: 10 req/min per IP
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

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const session = body.session as string | undefined;
  if (!session || typeof session !== 'string' || session.length < 10 || session.length > 100) {
    return Response.json({ error: 'Invalid session' }, { status: 400 });
  }

  try {
    const data = await getCheckoutSession(session);

    if (!data) {
      // Session not yet in Redis — webhook hasn't fired yet, treat as pending
      return Response.json({ status: 'pending' });
    }

    if (data.status === 'complete' && data.licenseKey) {
      // Delete session after first successful read — one-time retrieval only
      await import('@/lib/kv').then((kv) => kv.deleteCheckoutSession(session)).catch(() => {});
      return Response.json({
        status: 'complete',
        licenseKey: data.licenseKey,
        plan: data.plan,
      });
    }

    return Response.json({ status: 'pending' });
  } catch {
    return Response.json({ status: 'pending' });
  }
}

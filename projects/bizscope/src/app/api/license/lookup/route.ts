import { lookupKeysByEmail } from '@/lib/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limit: 3 req/min per IP
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
  return entry.count <= 3;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Too many requests. Try again in 1 minute.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = (body.email as string | undefined)?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'Valid email is required' }, { status: 400 });
  }

  try {
    const keys = await lookupKeysByEmail(email);

    return Response.json({ keys });
  } catch {
    return Response.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

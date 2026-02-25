import { NextRequest, NextResponse } from 'next/server';
import { provisionKey, revokeBySubscription, generateApiKey } from '@/lib/db';
import type { Plan } from '@/lib/auth';

const SIGNING_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

/** Verify Lemonsqueezy webhook signature (HMAC SHA-256) */
async function verifySignature(body: string, signature: string): Promise<boolean> {
  if (!SIGNING_SECRET) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const computed = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === signature;
}

/** Map Lemonsqueezy variant/product to our plan tier */
function resolvePlan(variantName: string): Plan {
  const lower = variantName.toLowerCase();
  if (lower.includes('enterprise')) return 'enterprise';
  if (lower.includes('developer')) return 'developer';
  return 'consumer';
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') || '';

  if (SIGNING_SECRET && !(await verifySignature(rawBody, signature))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const meta = payload.meta as Record<string, unknown> | undefined;
  const eventName = meta?.event_name as string | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const attrs = data?.attributes as Record<string, unknown> | undefined;

  if (!eventName || !attrs) {
    return NextResponse.json({ error: 'Missing event data' }, { status: 400 });
  }

  const subscriptionId = String(data?.id || '');
  const email = String(attrs.user_email || '');
  const variantName = String(attrs.variant_name || attrs.product_name || 'consumer');

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_resumed': {
      const plan = resolvePlan(variantName);
      const apiKey = generateApiKey(plan);
      await provisionKey(apiKey, plan, email, subscriptionId);

      // TODO: Send welcome email with API key via Lemonsqueezy or external email service
      console.log(`[webhook] Provisioned ${plan} key for ${email}: ${apiKey.slice(0, 10)}...`);
      return NextResponse.json({ ok: true, plan });
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      await revokeBySubscription(subscriptionId);
      console.log(`[webhook] Revoked key for subscription ${subscriptionId}`);
      return NextResponse.json({ ok: true, revoked: true });
    }

    case 'subscription_updated': {
      // Plan change — revoke old, provision new
      const plan = resolvePlan(variantName);
      await revokeBySubscription(subscriptionId);
      const apiKey = generateApiKey(plan);
      await provisionKey(apiKey, plan, email, subscriptionId);
      console.log(`[webhook] Updated to ${plan} for ${email}: ${apiKey.slice(0, 10)}...`);
      return NextResponse.json({ ok: true, plan });
    }

    default:
      return NextResponse.json({ ok: true, ignored: eventName });
  }
}

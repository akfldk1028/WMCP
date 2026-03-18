import { NextResponse } from 'next/server';
import {
  provisionKey,
  revokeBySubscription,
  addCredits,
  generateLicenseKey,
} from '@/lib/kv';
import type { BsaiPlan } from '@/lib/kv';

const SIGNING_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

/** Verify LemonSqueezy webhook signature (HMAC SHA-256) */
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
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison to prevent timing attacks
  if (computed.length !== signature.length) return false;
  const a = encoder.encode(computed);
  const b = encoder.encode(signature);
  const c = new Uint8Array(a.length);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/** Map variant/product name to BizScope AI plan tier */
function resolvePlan(variantName: string): BsaiPlan {
  const lower = variantName.toLowerCase();
  if (lower.includes('pro') || lower.includes('monthly') || lower.includes('annual')) {
    return 'pro';
  }
  return 'credits';
}

/** Parse credit amount from variant name (default: 1 report) */
function parseCredits(variantName: string): number {
  const match = variantName.match(/(\d+)\s*(?:report|건|credit)/i);
  return match ? Math.min(parseInt(match[1], 10), 100) : 1;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature') || '';

  // Fail closed: reject all webhooks if signing secret is not configured
  if (!SIGNING_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }
  if (!(await verifySignature(rawBody, signature))) {
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
  const variantName = String(attrs.variant_name || '');
  const orderId = String(attrs.order_number || attrs.order_id || data?.id || '');

  // Custom data may contain a license key for credit top-ups
  const customData = (meta?.custom_data ?? attrs?.custom_data) as Record<string, string> | undefined;
  const existingKey = customData?.license_key;

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_resumed': {
      const licenseKey = generateLicenseKey();
      await provisionKey(licenseKey, 'pro', email, subscriptionId);
      console.log(`[bsai:webhook] Pro key for ${email}: ${licenseKey.slice(0, 12)}...`);
      return NextResponse.json({ ok: true, plan: 'pro' });
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      await revokeBySubscription(subscriptionId);
      console.log(`[bsai:webhook] Revoked subscription ${subscriptionId}`);
      return NextResponse.json({ ok: true, revoked: true });
    }

    case 'subscription_updated': {
      await revokeBySubscription(subscriptionId);
      const licenseKey = generateLicenseKey();
      const plan = resolvePlan(variantName);
      await provisionKey(licenseKey, plan, email, subscriptionId);
      console.log(`[bsai:webhook] Updated to ${plan} for ${email}: ${licenseKey.slice(0, 12)}...`);
      return NextResponse.json({ ok: true, plan });
    }

    case 'order_created': {
      // One-time purchase — add credits
      const credits = parseCredits(variantName);
      const licenseKey = existingKey || generateLicenseKey();
      await addCredits(licenseKey, credits, email, orderId);
      console.log(`[bsai:webhook] +${credits} credits for ${email}: ${licenseKey.slice(0, 12)}...`);
      return NextResponse.json({ ok: true, plan: 'credits', credits });
    }

    default:
      return NextResponse.json({ ok: true, ignored: eventName });
  }
}

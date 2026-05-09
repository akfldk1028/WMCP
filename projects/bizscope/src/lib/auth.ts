/**
 * BizScope AI — Unified API key authentication.
 *
 * Single entry point for all endpoints. Supports 3 header formats:
 *   Authorization: Bearer bsai_xxx   (standard, MCP/REST)
 *   x-api-key: bsai_xxx             (API gateway pattern)
 *   x-license-key: bsai_xxx         (legacy web app)
 */

import { getLicenseInfo, isValidKeyFormat } from './kv';
import type { BsaiPlan } from './kv';

export interface AuthResult {
  key: string;
  plan: 'free' | BsaiPlan;
  credits: number;        // -1 = unlimited (pro)
  email: string;
  ensembleEnabled: boolean;
}

const FREE_AUTH: AuthResult = {
  key: '',
  plan: 'free',
  credits: 0,
  email: '',
  ensembleEnabled: false,
};

/**
 * Extract API key from request headers.
 * Checks Authorization, x-api-key, x-license-key in order.
 */
export function extractApiKey(request: Request): string | null {
  // 1. Authorization: Bearer bsai_xxx
  const auth = request.headers.get('authorization')?.trim();
  if (auth) {
    const match = auth.match(/^Bearer\s+(bsai_\S+)$/i);
    if (match) return match[1];
  }

  // 2. x-api-key: bsai_xxx
  const xApiKey = request.headers.get('x-api-key')?.trim();
  if (xApiKey?.startsWith('bsai_')) return xApiKey;

  // 3. x-license-key: bsai_xxx (legacy)
  const xLicense = request.headers.get('x-license-key')?.trim();
  if (xLicense?.startsWith('bsai_')) return xLicense;

  return null;
}

/**
 * Resolve auth from request. Returns plan info or free tier.
 * Never throws — returns FREE_AUTH on any failure.
 */
export async function resolveAuth(request: Request): Promise<AuthResult> {
  const key = extractApiKey(request);
  if (!key || !isValidKeyFormat(key)) return FREE_AUTH;

  try {
    const info = await getLicenseInfo(key);
    if (!info) return FREE_AUTH;

    return {
      key,
      plan: info.plan,
      credits: info.plan === 'pro' ? -1 : info.credits,
      email: info.email,
      ensembleEnabled: info.plan === 'pro',
    };
  } catch {
    // Redis unavailable — graceful degradation to free
    return FREE_AUTH;
  }
}

/**
 * Check if legacy BIZSCOPE_API_KEY env matches the request.
 * Used as fallback during migration period for MCP endpoints.
 */
export function isLegacyEnvKey(request: Request): boolean {
  const envKey = process.env.BIZSCOPE_API_KEY?.trim();
  if (!envKey) return false;
  const auth = request.headers.get('authorization')?.trim();
  return auth === `Bearer ${envKey}`;
}

/** Standard 401 response for unauthorized requests. */
export function unauthorizedResponse(message = 'Valid API key required. Get one at /pricing'): Response {
  return Response.json({ error: message }, { status: 401 });
}

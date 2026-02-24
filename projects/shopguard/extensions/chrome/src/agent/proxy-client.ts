/** Client for ShopGuard server proxy API */

import type { PageSnapshot, PipelineResult } from '../types.js';
import { getDeviceId } from '../lib/device-id.js';

const API_BASE = 'https://shopguard-api.vercel.app';
const TIMEOUT_MS = 45_000;

/** Build a light snapshot (no rawHtml) to keep payload ~50KB */
function toLightSnapshot(snapshot: PageSnapshot): Omit<PageSnapshot, 'rawHtml' | 'rawPageText'> {
  const { rawHtml: _h, rawPageText: _t, ...light } = snapshot;
  return light;
}

export async function analyzeViaProxy(
  snapshot: PageSnapshot,
  licenseKey?: string,
): Promise<PipelineResult> {
  const deviceId = await getDeviceId();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/api/extension/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshot: toLightSnapshot(snapshot),
        deviceId,
        licenseKey: licenseKey || undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      return {
        success: false,
        error: 'Daily limit reached. Upgrade to Pro for unlimited AI analysis.',
        errorCode: 'rate_limit',
      };
    }

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Server error: ${text}`, errorCode: 'unknown' };
    }

    return await response.json() as PipelineResult;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg, errorCode: 'network' };
  }
}

export async function validateLicense(licenseKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/extension/validate-license`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.valid === true;
  } catch {
    return false;
  }
}

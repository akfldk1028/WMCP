/**
 * BizScope AI — Client-side license key management.
 * Stores license key and free usage counter in localStorage.
 */

const LICENSE_KEY_STORAGE = 'bsai_license_key';
const USAGE_STORAGE = 'bsai_usage';
const FREE_LIMIT = 2;

export function getLicenseKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LICENSE_KEY_STORAGE);
}

export function setLicenseKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LICENSE_KEY_STORAGE, key);
}

export function removeLicenseKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LICENSE_KEY_STORAGE);
}

export function getUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(USAGE_STORAGE) || '0', 10);
}

export function incrementUsage(): number {
  const next = getUsageCount() + 1;
  localStorage.setItem(USAGE_STORAGE, String(next));
  return next;
}

export function getFreeRemaining(): number {
  return Math.max(0, FREE_LIMIT - getUsageCount());
}

export const FREE_REPORT_LIMIT = FREE_LIMIT;

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractApiKey, resolveAuth, isLegacyEnvKey, unauthorizedResponse } from './auth';

// Mock kv module
vi.mock('./kv', () => ({
  isValidKeyFormat: (key: string) => /^bsai_[a-f0-9]{32}$/.test(key),
  getLicenseInfo: vi.fn(),
}));

import { getLicenseInfo } from './kv';
const mockGetLicenseInfo = vi.mocked(getLicenseInfo);

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('https://example.com/api/test', { headers });
}

const VALID_KEY = 'bsai_0123456789abcdef0123456789abcdef';
const INVALID_KEY = 'bsai_short';

describe('extractApiKey', () => {
  it('should extract from Authorization: Bearer header', () => {
    const req = makeRequest({ Authorization: `Bearer ${VALID_KEY}` });
    expect(extractApiKey(req)).toBe(VALID_KEY);
  });

  it('should extract from x-api-key header', () => {
    const req = makeRequest({ 'x-api-key': VALID_KEY });
    expect(extractApiKey(req)).toBe(VALID_KEY);
  });

  it('should extract from x-license-key header (legacy)', () => {
    const req = makeRequest({ 'x-license-key': VALID_KEY });
    expect(extractApiKey(req)).toBe(VALID_KEY);
  });

  it('should prefer Authorization over x-api-key', () => {
    const otherKey = 'bsai_aaaabbbbccccddddaaaabbbbccccdddd';
    const req = makeRequest({
      Authorization: `Bearer ${VALID_KEY}`,
      'x-api-key': otherKey,
    });
    expect(extractApiKey(req)).toBe(VALID_KEY);
  });

  it('should prefer x-api-key over x-license-key', () => {
    const otherKey = 'bsai_aaaabbbbccccddddaaaabbbbccccdddd';
    const req = makeRequest({
      'x-api-key': VALID_KEY,
      'x-license-key': otherKey,
    });
    expect(extractApiKey(req)).toBe(VALID_KEY);
  });

  it('should return null for no auth headers', () => {
    const req = makeRequest({});
    expect(extractApiKey(req)).toBeNull();
  });

  it('should return null for non-bsai Bearer token', () => {
    const req = makeRequest({ Authorization: 'Bearer sk_some_other_key' });
    expect(extractApiKey(req)).toBeNull();
  });

  it('should return null for empty Authorization header', () => {
    const req = makeRequest({ Authorization: '' });
    expect(extractApiKey(req)).toBeNull();
  });

  it('should handle Bearer case-insensitively', () => {
    const req = makeRequest({ Authorization: `bearer ${VALID_KEY}` });
    expect(extractApiKey(req)).toBe(VALID_KEY);
  });

  it('should trim whitespace from headers', () => {
    const req = makeRequest({ 'x-api-key': `  ${VALID_KEY}  ` });
    expect(extractApiKey(req)).toBe(VALID_KEY);
  });
});

describe('resolveAuth', () => {
  beforeEach(() => {
    mockGetLicenseInfo.mockReset();
  });

  it('should return free tier for no key', async () => {
    const req = makeRequest({});
    const auth = await resolveAuth(req);
    expect(auth.plan).toBe('free');
    expect(auth.key).toBe('');
    expect(auth.ensembleEnabled).toBe(false);
  });

  it('should return free tier for invalid key format', async () => {
    const req = makeRequest({ Authorization: `Bearer ${INVALID_KEY}` });
    const auth = await resolveAuth(req);
    expect(auth.plan).toBe('free');
  });

  it('should return free tier if key not found in Redis', async () => {
    mockGetLicenseInfo.mockResolvedValue(null);
    const req = makeRequest({ Authorization: `Bearer ${VALID_KEY}` });
    const auth = await resolveAuth(req);
    expect(auth.plan).toBe('free');
  });

  it('should return pro plan for pro key', async () => {
    mockGetLicenseInfo.mockResolvedValue({
      plan: 'pro',
      credits: -1,
      email: 'user@test.com',
      createdAt: Date.now(),
    });
    const req = makeRequest({ Authorization: `Bearer ${VALID_KEY}` });
    const auth = await resolveAuth(req);
    expect(auth.plan).toBe('pro');
    expect(auth.credits).toBe(-1);
    expect(auth.ensembleEnabled).toBe(true);
    expect(auth.email).toBe('user@test.com');
    expect(auth.key).toBe(VALID_KEY);
  });

  it('should return credits plan with credit count', async () => {
    mockGetLicenseInfo.mockResolvedValue({
      plan: 'credits',
      credits: 5,
      email: 'buyer@test.com',
      createdAt: Date.now(),
    });
    const req = makeRequest({ 'x-api-key': VALID_KEY });
    const auth = await resolveAuth(req);
    expect(auth.plan).toBe('credits');
    expect(auth.credits).toBe(5);
    expect(auth.ensembleEnabled).toBe(false);
  });

  it('should return free tier on Redis error (graceful degradation)', async () => {
    mockGetLicenseInfo.mockRejectedValue(new Error('Redis down'));
    const req = makeRequest({ Authorization: `Bearer ${VALID_KEY}` });
    const auth = await resolveAuth(req);
    expect(auth.plan).toBe('free');
  });
});

describe('isLegacyEnvKey', () => {
  it('should return true when Bearer matches BIZSCOPE_API_KEY', () => {
    process.env.BIZSCOPE_API_KEY = 'legacy_secret_123';
    const req = makeRequest({ Authorization: 'Bearer legacy_secret_123' });
    expect(isLegacyEnvKey(req)).toBe(true);
    delete process.env.BIZSCOPE_API_KEY;
  });

  it('should return false when Bearer does not match', () => {
    process.env.BIZSCOPE_API_KEY = 'legacy_secret_123';
    const req = makeRequest({ Authorization: 'Bearer wrong_key' });
    expect(isLegacyEnvKey(req)).toBe(false);
    delete process.env.BIZSCOPE_API_KEY;
  });

  it('should return false when env not set', () => {
    delete process.env.BIZSCOPE_API_KEY;
    const req = makeRequest({ Authorization: 'Bearer anything' });
    expect(isLegacyEnvKey(req)).toBe(false);
  });
});

describe('unauthorizedResponse', () => {
  it('should return 401 with default message', async () => {
    const res = unauthorizedResponse();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('API key required');
  });

  it('should return 401 with custom message', async () => {
    const res = unauthorizedResponse('Custom error');
    const body = await res.json();
    expect(body.error).toBe('Custom error');
  });
});

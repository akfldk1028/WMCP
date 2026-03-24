import { test, expect } from '@playwright/test';

/**
 * BizScope AI — Payment E2E Tests
 * Tests against LIVE Vercel deployment: https://bizscope-rho.vercel.app
 */

const LIVE_URL = 'https://bizscope-rho.vercel.app';

// --- Pricing Page UI ---

test.describe('BizScope Pricing Page', () => {
  test('pricing page loads with 3 plans', async ({ page }) => {
    await page.goto(`${LIVE_URL}/pricing`, { waitUntil: 'domcontentloaded' });

    // Header
    await expect(page.getByRole('heading', { name: '가격 정책' })).toBeVisible();

    // Free plan
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('보고서 2건 무료 생성')).toBeVisible();

    // Pro plan
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByText('무제한 분석 + 앙상블')).toBeVisible();

    // Per-report
    await expect(page.getByText('건당 구매')).toBeVisible();
    await expect(page.getByText('$5/건')).toBeVisible();
  });

  test('billing toggle switches monthly/annual prices', async ({ page }) => {
    await page.goto(`${LIVE_URL}/pricing`, { waitUntil: 'domcontentloaded' });

    // Default = monthly → $29
    await expect(page.getByText('$29')).toBeVisible();

    // Switch to annual → $19
    await page.getByRole('button', { name: /연간/ }).click();
    await expect(page.getByText('$19')).toBeVisible();
    await expect(page.getByText('연 $228 결제')).toBeVisible();
  });

  test('checkout links point to LemonSqueezy', async ({ page }) => {
    await page.goto(`${LIVE_URL}/pricing`, { waitUntil: 'domcontentloaded' });

    // Pro monthly checkout link
    const proLink = page.getByRole('link', { name: /Pro 시작하기/ });
    await expect(proLink).toHaveAttribute('href', /lemonsqueezy\.com\/checkout/);

    // Per-report checkout link
    const reportLink = page.getByRole('link', { name: /1건 구매하기/ });
    await expect(reportLink).toHaveAttribute('href', /lemonsqueezy\.com\/checkout/);
  });

  test('license key input — invalid key shows error', async ({ page }) => {
    await page.goto(`${LIVE_URL}/pricing`, { waitUntil: 'domcontentloaded' });

    // Fill invalid key
    await page.getByPlaceholder('bsai_...').fill('invalid_key_12345');
    await page.getByRole('button', { name: '확인' }).click();

    // Should show invalid message
    await expect(page.getByText('유효하지 않은 키입니다')).toBeVisible({ timeout: 10000 });
  });
});

// --- License Check API ---

test.describe('BizScope License Check API', () => {
  test('POST /api/license/check — missing key returns 400', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/license/check`, {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('licenseKey');
  });

  test('POST /api/license/check — invalid format returns valid:false', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/license/check`, {
      data: { licenseKey: 'not_a_real_key' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

  test('POST /api/license/check — valid format but non-existent returns valid:false', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/license/check`, {
      data: { licenseKey: 'bsai_00000000000000000000000000000000' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });
});

// --- License Use API ---

test.describe('BizScope License Use API', () => {
  test('POST /api/license/use — missing key returns 400', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/license/use`, {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/license/use — invalid format returns 400', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/license/use`, {
      data: { licenseKey: 'bad_format' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('POST /api/license/use — non-existent key returns 402 (no credits)', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/license/use`, {
      data: { licenseKey: 'bsai_00000000000000000000000000000000' },
    });
    // Non-existent key → no credits → 402
    expect(res.status()).toBe(402);
  });
});

// --- Webhook Endpoint ---

test.describe('BizScope Webhook', () => {
  test('POST /api/webhooks/lemonsqueezy — missing signature returns 401', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/webhooks/lemonsqueezy`, {
      data: JSON.stringify({
        meta: { event_name: 'subscription_created' },
        data: { id: '123', attributes: { user_email: 'test@test.com', variant_name: 'Pro Monthly' } },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/webhooks/lemonsqueezy — invalid signature returns 401', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/webhooks/lemonsqueezy`, {
      data: JSON.stringify({
        meta: { event_name: 'subscription_created' },
        data: { id: '123', attributes: { user_email: 'test@test.com', variant_name: 'Pro Monthly' } },
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'invalid_signature_abc123',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/webhooks/lemonsqueezy — invalid JSON returns 400 or 401', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/webhooks/lemonsqueezy`, {
      data: 'not json',
      headers: {
        'Content-Type': 'text/plain',
        'x-signature': 'abc',
      },
    });
    // Either 401 (sig fails first) or 400 (invalid JSON)
    expect([400, 401]).toContain(res.status());
  });
});

// --- Landing Page ---

test.describe('BizScope Landing Page', () => {
  test('landing page loads and shows key sections', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });

    // Title/brand
    await expect(page.getByText('BizScope AI', { exact: true }).first()).toBeVisible();

    // Pricing link exists
    const pricingLink = page.locator('a[href*="pricing"]').first();
    await expect(pricingLink).toBeVisible();
  });

  test('report/new page loads', async ({ page }) => {
    await page.goto(`${LIVE_URL}/report/new`, { waitUntil: 'domcontentloaded' });

    // Should have mode toggle
    await expect(page.getByRole('button', { name: '기업 분석' })).toBeVisible();
    await expect(page.getByRole('button', { name: '아이디어 분석' })).toBeVisible();
  });
});

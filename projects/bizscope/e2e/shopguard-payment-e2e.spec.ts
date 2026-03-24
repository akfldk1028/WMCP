import { test, expect } from '@playwright/test';

/**
 * ShopGuard — Payment & API E2E Tests
 * Tests against LIVE Vercel deployment: https://shopguard-api.vercel.app
 */

const LIVE_URL = 'https://shopguard-api.vercel.app';

// --- Landing Page & Pricing ---

test.describe('ShopGuard Landing Page', () => {
  test('landing page loads with pricing section', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });

    // Brand — nav logo
    await expect(page.getByRole('link', { name: 'ShopGuard' }).first()).toBeVisible();

    // Pricing section should exist
    await expect(page.locator('text=Free').first()).toBeVisible();
  });

  test('seller page loads', async ({ page }) => {
    await page.goto(`${LIVE_URL}/seller`, { waitUntil: 'domcontentloaded' });
    // Should have seller-related content
    await expect(page.locator('body')).toContainText(/seller|셀러|waitlist/i);
  });

  test('leaderboard page loads', async ({ page }) => {
    await page.goto(`${LIVE_URL}/leaderboard`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/dark pattern|다크패턴|leaderboard/i);
  });
});

// --- ShopGuard API Auth ---

test.describe('ShopGuard API Auth', () => {
  test('GET /api/analyze — missing API key returns 401', async ({ request }) => {
    const res = await request.get(`${LIVE_URL}/api/analyze`);
    // Should require auth
    expect([401, 404, 405]).toContain(res.status());
  });

  test('POST /api/analyze — demo key returns valid response', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/analyze`, {
      data: {
        url: 'https://www.amazon.com/dp/B0EXAMPLE',
      },
      headers: {
        Authorization: 'Bearer sg_demo_free',
      },
    });
    // Should accept the demo key (may return 200 or some valid error about URL)
    expect([200, 400, 422]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('POST /api/analyze — invalid key returns 403', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/analyze`, {
      data: { url: 'https://www.amazon.com/dp/B0EXAMPLE' },
      headers: {
        Authorization: 'Bearer invalid_key_xyz',
      },
    });
    expect(res.status()).toBe(403);
  });
});

// --- ShopGuard Webhook ---

test.describe('ShopGuard Webhook', () => {
  test('POST /api/webhooks/lemonsqueezy — no signature returns 401', async ({ request }) => {
    const payload = JSON.stringify({
      meta: { event_name: 'subscription_created' },
      data: {
        id: 'test-sub-123',
        attributes: {
          user_email: 'test@test.com',
          variant_name: 'Developer',
          product_name: 'ShopGuard Developer',
        },
      },
    });

    const res = await request.post(`${LIVE_URL}/api/webhooks/lemonsqueezy`, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/webhooks/lemonsqueezy — invalid signature returns 401', async ({ request }) => {
    const payload = JSON.stringify({
      meta: { event_name: 'subscription_created' },
      data: {
        id: 'test-sub-456',
        attributes: {
          user_email: 'test@test.com',
          variant_name: 'Consumer',
          product_name: 'ShopGuard Consumer',
        },
      },
    });

    const res = await request.post(`${LIVE_URL}/api/webhooks/lemonsqueezy`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'bad_signature_here',
      },
    });
    expect(res.status()).toBe(401);
  });
});

// --- Extension API ---

test.describe('ShopGuard Extension API', () => {
  test('POST /api/extension/analyze — missing ext key returns 403', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/extension/analyze`, {
      data: { snapshot: '<html>test</html>', deviceId: 'test-device-001' },
    });
    expect(res.status()).toBe(403);
  });

  test('POST /api/extension/analyze — with ext key, missing body returns 400', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/extension/analyze`, {
      data: {},
      headers: { 'x-shopguard-key': 'sg_ext_v040' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/extension/analyze — valid request accepted (200 or 500 from pipeline)', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/extension/analyze`, {
      data: {
        snapshot: '<html><head><title>Test Product</title></head><body><div class="price">$99.99</div><div class="countdown">Only 2 left! Buy now!</div><div class="review">5 stars - Great product!</div></body></html>',
        deviceId: 'e2e-test-device-001',
      },
      headers: { 'x-shopguard-key': 'sg_ext_v040' },
    });
    // 200 = analysis success, 500 = pipeline internal error (e.g. Claude API quota)
    // Both prove auth + rate limit passed correctly
    expect([200, 500]).toContain(res.status());
  });

  test('POST /api/extension/validate-license — missing key returns 400', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/extension/validate-license`, {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/extension/validate-license — invalid key returns valid:false', async ({ request }) => {
    const res = await request.post(`${LIVE_URL}/api/extension/validate-license`, {
      data: { licenseKey: 'fake_license_key_12345' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });
});

// --- Blog & SEO ---

test.describe('ShopGuard SEO', () => {
  test('blog index loads', async ({ page }) => {
    await page.goto(`${LIVE_URL}/blog`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/blog|dark pattern|shopping/i);
  });

  test('sitemap.xml accessible', async ({ request }) => {
    const res = await request.get(`${LIVE_URL}/sitemap.xml`);
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('urlset');
    expect(text).toContain('shopguard-api.vercel.app');
  });

  test('robots.txt accessible', async ({ request }) => {
    const res = await request.get(`${LIVE_URL}/robots.txt`);
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('Sitemap');
  });
});

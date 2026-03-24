import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: {
    headless: true,
    navigationTimeout: 45_000,
  },
  workers: 1,
  retries: 1,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});

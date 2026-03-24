import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3007';

test.describe('BizScope — Idea Doc Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/report/new`, { waitUntil: 'domcontentloaded' });
  });

  test('renders mode toggle (기업/아이디어)', async ({ page }) => {
    // Default is company mode
    const companyBtn = page.getByRole('button', { name: '기업 분석' });
    const ideaBtn = page.getByRole('button', { name: '아이디어 분석' });
    await expect(companyBtn).toBeVisible();
    await expect(ideaBtn).toBeVisible();
  });

  test('switches to idea mode and shows simple input by default', async ({ page }) => {
    await page.getByRole('button', { name: '아이디어 분석' }).click();

    // Simple mode fields
    await expect(page.getByTestId('idea-name')).toBeVisible();
    await expect(page.getByTestId('idea-description')).toBeVisible();
    await expect(page.getByTestId('idea-target')).toBeVisible();

    // Doc mode textarea should NOT be visible
    await expect(page.getByTestId('idea-document')).not.toBeVisible();
  });

  test('switches to doc input mode', async ({ page }) => {
    await page.getByRole('button', { name: '아이디어 분석' }).click();
    await page.getByTestId('doc-mode-btn').click();

    // Doc mode textarea should be visible
    await expect(page.getByTestId('idea-document')).toBeVisible();

    // Simple mode fields should NOT be visible
    await expect(page.getByTestId('idea-description')).not.toBeVisible();
    await expect(page.getByTestId('idea-target')).not.toBeVisible();
  });

  test('doc mode shows character count', async ({ page }) => {
    await page.getByRole('button', { name: '아이디어 분석' }).click();
    await page.getByTestId('doc-mode-btn').click();

    const textarea = page.getByTestId('idea-document');
    await textarea.fill('# 테스트 기획서\n\n## 문제 정의\n테스트 내용입니다.');

    // Should show character count
    await expect(page.getByText(/\d+자/)).toBeVisible();
  });

  test('submit button disabled when doc is empty', async ({ page }) => {
    await page.getByRole('button', { name: '아이디어 분석' }).click();
    await page.getByTestId('doc-mode-btn').click();

    // Fill only the name, not the document
    await page.getByTestId('idea-name').fill('테스트 아이디어');

    const submitBtn = page.getByTestId('idea-submit');
    await expect(submitBtn).toBeDisabled();
  });

  test('submit button enabled when name + doc filled', async ({ page }) => {
    await page.getByRole('button', { name: '아이디어 분석' }).click();
    await page.getByTestId('doc-mode-btn').click();

    await page.getByTestId('idea-name').fill('AI 쇼핑 비서');
    await page.getByTestId('idea-document').fill('# AI 쇼핑 비서\n\n온라인 쇼핑 가격 비교 자동화');

    const submitBtn = page.getByTestId('idea-submit');
    await expect(submitBtn).toBeEnabled();
  });

  test('toggle between simple and doc modes preserves name', async ({ page }) => {
    await page.getByRole('button', { name: '아이디어 분석' }).click();

    // Fill name in simple mode
    await page.getByTestId('idea-name').fill('유지되는 이름');

    // Switch to doc
    await page.getByTestId('doc-mode-btn').click();

    // Name should be preserved
    await expect(page.getByTestId('idea-name')).toHaveValue('유지되는 이름');

    // Switch back to simple
    await page.getByRole('button', { name: '간단 입력' }).click();
    await expect(page.getByTestId('idea-name')).toHaveValue('유지되는 이름');
  });

  test('doc textarea has monospace font and placeholder', async ({ page }) => {
    await page.getByRole('button', { name: '아이디어 분석' }).click();
    await page.getByTestId('doc-mode-btn').click();

    const textarea = page.getByTestId('idea-document');
    await expect(textarea).toHaveAttribute('placeholder', /# 프로젝트명/);

    // Check font-family includes mono
    const fontFamily = await textarea.evaluate(el => getComputedStyle(el).fontFamily);
    expect(fontFamily).toMatch(/mono|monospace|Consolas|Courier/i);
  });
});

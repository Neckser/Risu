import { expect, test } from '@playwright/test';

import { loginAsDemo } from './utils/setup';

test.describe('Subscriptions filtering & search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/subscriptions');
    await expect(page.locator('app-subscription-card').first()).toBeVisible();
  });

  test('category filter narrows the list to a single category', async ({ page }) => {
    const totalBefore = await page.locator('app-subscription-card').count();
    expect(totalBefore).toBeGreaterThan(1);

    await page.getByLabel('Категория').selectOption('streaming');

    const cards = page.locator('app-subscription-card');
    await expect.poll(() => cards.count()).toBeLessThan(totalBefore);

    await expect(page.getByText('Netflix')).toBeVisible();
    await expect(page.getByText('Spotify')).toBeVisible();
    await expect(page.getByText('PlayStation Plus')).toHaveCount(0);
  });

  test('search input keeps only items whose name matches', async ({ page }) => {
    await page.getByLabel('Поиск').fill('netflix');
    await expect(page.locator('app-subscription-card')).toHaveCount(1);
    await expect(page.getByText('Netflix')).toBeVisible();
  });

  test('reset button clears all filters', async ({ page }) => {
    const totalBefore = await page.locator('app-subscription-card').count();

    await page.getByLabel('Категория').selectOption('gaming');
    await expect
      .poll(() => page.locator('app-subscription-card').count())
      .toBeLessThan(totalBefore);

    await page.getByRole('button', { name: 'Сбросить' }).click();
    await expect
      .poll(() => page.locator('app-subscription-card').count())
      .toBe(totalBefore);
  });
});

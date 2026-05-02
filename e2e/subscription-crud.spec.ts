import { expect, test } from '@playwright/test';

import { loginAsDemo } from './utils/setup';

test.describe('Subscriptions CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
    await page.goto('/subscriptions');
    await expect(page.locator('app-subscription-card').first()).toBeVisible();
  });

  test('creates a new subscription and shows it in the list', async ({ page }) => {
    const initialCount = await page.locator('app-subscription-card').count();

    await page.getByRole('link', { name: 'Добавить', exact: true }).click();
    await page.waitForURL('**/subscriptions/new');

    await page.getByLabel('Название сервиса').fill('YouTube Premium');
    await page.getByLabel('Стоимость').fill('299');
    await page.getByLabel('Категория').selectOption('streaming');
    await page.getByLabel('Периодичность').selectOption('monthly');

    await page.getByRole('button', { name: 'Создать', exact: true }).click();
    await page.waitForURL('**/subscriptions');

    await expect(page.locator('app-subscription-card')).toHaveCount(initialCount + 1);
    await expect(page.getByText('YouTube Premium')).toBeVisible();
  });

  test('deletes a subscription after confirming the dialog', async ({ page }) => {
    const initialCount = await page.locator('app-subscription-card').count();
    expect(initialCount).toBeGreaterThan(0);

    const firstCard = page.locator('app-subscription-card').first();
    const deletedName = (await firstCard.locator('.card__name').innerText()).trim();

    page.once('dialog', (dialog) => dialog.accept());
    await firstCard.getByRole('button', { name: 'Удалить подписку' }).click();

    await expect(page.locator('app-subscription-card')).toHaveCount(initialCount - 1);
    await expect(
      page.locator('app-subscription-card').filter({ hasText: deletedName }),
    ).toHaveCount(0);
  });
});

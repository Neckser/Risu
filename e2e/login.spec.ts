import { expect, test } from '@playwright/test';

test.describe('Auth flow', () => {
  test('redirects unauthenticated visit to /auth/login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  });

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('demo@risu.app');
    await page.getByLabel('Пароль').fill('123');
    await page.getByLabel('Пароль').blur();
    await expect(page.getByText('Минимум 6 символов')).toBeVisible();
  });

  test('logs in with demo credentials and lands on the dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Заполнить демо-данными' }).click();
    await expect(page.getByLabel('Email')).toHaveValue('demo@risu.app');

    await page.getByRole('button', { name: 'Войти' }).click();
    await page.waitForURL('**/dashboard');

    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible();
    await expect(page.getByText('Расход в месяц')).toBeVisible();
    await expect(page.getByText('Demo User').first()).toBeVisible();
  });
});

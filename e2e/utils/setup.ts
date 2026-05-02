import type { Page } from '@playwright/test';

export async function loginAsDemo(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Заполнить демо-данными' }).click();
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.waitForURL('**/dashboard');
}

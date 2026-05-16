import { test, expect } from '@playwright/test';

test('home page loads and renders content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

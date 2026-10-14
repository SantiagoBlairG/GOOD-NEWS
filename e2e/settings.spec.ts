import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.route('https://demotiles.maplibre.org/**', (route) => route.abort());
});
test('collections derive counts, unsave Undo restores timestamp', async ({ page }) => {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /community kitchen/);
  await page.getByRole('link', { name: 'Saved', exact: true }).click();
  await expect(page.locator('.collection')).toHaveCount(2);
  await page.locator('.collection').filter({ hasText: 'Environment' }).click();
  await expect(page.locator('.story-row')).toHaveCount(1);
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bright-side:v1')!).saved[0].savedAt,
  );
  await page.getByRole('button', { name: 'Unsave story' }).click();
  await expect(page.locator('.story-row')).toHaveCount(0);
  await page.locator('.toast').getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('.story-row')).toHaveCount(1);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('bright-side:v1')!).saved[0].savedAt),
  ).toBe(before);
});
test('appearance, reduced motion and preferences persist; clear data requires confirmation', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('switch', { name: 'Reduce motion' }).check();
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Reduce motion' })).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Health & Medicine', exact: true }).click();
  await page.getByRole('button', { name: 'Apply & start new batch' }).click();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /traveling clinic/);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.getByRole('button', { name: 'Clear local data', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my data' }).click();
  await page.getByRole('link', { name: 'Saved', exact: true }).click();
  await expect(page.locator('.story-row')).toHaveCount(1);
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.getByRole('button', { name: 'Clear local data', exact: true }).click();
  await page.getByRole('button', { name: 'Clear everything' }).click();
  await page.getByRole('link', { name: 'Saved', exact: true }).click();
  await expect(page.locator('.story-row')).toHaveCount(0);
});

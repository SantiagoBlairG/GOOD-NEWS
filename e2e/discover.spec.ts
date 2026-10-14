import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://demotiles.maplibre.org/**', (route) => route.abort());
});
test('search plus topics, empty results, and article filter restoration', async ({ page }) => {
  await page.goto('/discover');
  await page.getByRole('searchbox').fill('Bogotá');
  await page.getByRole('button', { name: 'Community & Kindness', exact: true }).click();
  await expect(page.locator('.results-heading')).toContainText('2 stories');
  await page.getByRole('heading', { name: 'A community kitchen makes room for everyone' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('Bogotá');
  await expect(
    page.getByRole('button', { name: 'Community & Kindness', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Science & Technology', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No stories here just yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(page.locator('.results-heading')).toContainText('24 stories');
});
test('provider failure leaves list usable and filters survive view changes', async ({ page }) => {
  await page.goto('/discover/map?q=Bogot%C3%A1');
  await expect(page.getByText('The map couldn’t load.')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.results-heading')).toContainText('2 stories');
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('Bogotá');
  await expect(
    page.getByRole('heading', { name: 'A community kitchen makes room for everyone' }),
  ).toBeVisible();
  await page.getByRole('heading', { name: 'A community kitchen makes room for everyone' }).click();
  await expect(page).toHaveURL(/story-2/);
});

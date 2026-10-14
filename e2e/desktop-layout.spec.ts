import { test, expect } from '@playwright/test';

test('desktop carousel browses without saving and returns to the selected story', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.desktop-nav')).toBeVisible();
  await expect(page.locator('.bottom-nav')).toBeHidden();
  await expect(page.locator('.desktop-up-next .small-story')).toHaveCount(2);
  const card = page.getByTestId('swipe-card');
  expect((await card.boundingBox())!.width).toBeGreaterThan(700);
  await page.getByRole('button', { name: 'Next story', exact: true }).click();
  await expect(card).toHaveAttribute('data-story-link', 'story-2');
  await expect(
    page.getByRole('button', { name: 'Save story', exact: true }).first(),
  ).toHaveAttribute('aria-pressed', 'false');
  await card.click();
  await expect(page).toHaveURL(/story-2/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(card).toHaveAttribute('data-story-link', 'story-2');
  await expect(page.locator('html')).not.toHaveAttribute('data-article-transition');
  await page.getByRole('button', { name: 'Save story', exact: true }).first().click();
  await expect(
    page.getByRole('button', { name: 'Unsave story', exact: true }).first(),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Previous story', exact: true }).click();
  await expect(card).toHaveAttribute('data-story-link', 'story-1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('sheets become centered desktop dialogs and mobile keeps its original deck', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/profile');
  const reset = page.getByRole('button', { name: 'Clear local data', exact: true });
  await reset.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect
    .poll(async () => {
      const bounds = (await dialog.boundingBox())!;
      return Math.abs(bounds.y + bounds.height / 2 - 500);
    })
    .toBeLessThan(2);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.desktop-nav')).toBeHidden();
  await expect(page.locator('.desktop-home')).toHaveCount(0);
  await expect(page.locator('.swipe-controls')).toBeVisible();
  await expect(page.locator('.bottom-nav')).toBeVisible();
});

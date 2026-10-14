import { test, expect } from '@playwright/test';
test('share fallback offers the actual selectable URL when clipboard is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    });
  });
  await page.goto('/story/story-1');
  await page.getByRole('button', { name: 'Share story' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Article URL')).toHaveValue('http://127.0.0.1:5173/story/story-1');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Share story' })).toBeFocused();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
test('native share cancellation is quiet', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: () => Promise.reject(new DOMException('Canceled', 'AbortError')),
      configurable: true,
    });
  });
  await page.goto('/story/story-1');
  await page.getByRole('button', { name: 'Share story' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.toast')).toHaveCount(0);
});

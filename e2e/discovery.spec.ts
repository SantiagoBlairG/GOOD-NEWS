import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
test('buttons save once, persist, undo, and restore article origin', async ({ page }) => {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /community kitchen/);
  await page.reload();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /community kitchen/);
  await page.getByRole('link', { name: 'Saved', exact: true }).click();
  await expect(page.getByRole('heading', { name: /forest finds/ })).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByTestId('swipe-card').click();
  await expect(page).toHaveURL(/story-2/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /community kitchen/);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /forest finds/);
  await page.getByRole('link', { name: 'Saved', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your next bright spot belongs here.' }),
  ).toBeVisible();
});
test('drag is distinct from tap and short drag resets', async ({ page }) => {
  const card = page.getByTestId('swipe-card');
  const box = (await card.boundingBox())!;
  const y = box.y + 80;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 20, y, { steps: 10 });
  await page.waitForTimeout(150);
  await page.mouse.up();
  await expect(page).toHaveURL(/\/$/);
  await expect(card).toHaveAttribute('aria-label', /forest finds/);
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 150, y, { steps: 12 });
  await page.mouse.up();
  await expect(card).toHaveAttribute('aria-label', /community kitchen/);
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('link', { name: 'Saved', exact: true }).click();
  await expect(page.getByRole('heading', { name: /forest finds/ })).toBeVisible();
});
test('final-card Undo works and keyboard discovery works', async ({ page }) => {
  for (let i = 0; i < 12; i++) {
    await page.getByRole('button', { name: 'Skip', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Skip', exact: true }))
      .toBeEnabled()
      .catch(() => {});
  }
  await expect(page.getByRole('heading', { name: 'A little perspective, gained.' })).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /after-school club/);
  await page.getByTestId('swipe-card').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { name: 'A little perspective, gained.' })).toBeVisible();
});

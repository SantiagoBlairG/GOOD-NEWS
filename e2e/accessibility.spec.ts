import { test, expect } from '@playwright/test';
test('keyboard controls, dialog dismissal, reduced motion, and enlarged text remain usable', async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByTestId('swipe-card')).toBeVisible();
  if (browserName === 'chromium') {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  } else {
    await page.getByRole('link', { name: 'Skip to content' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  }
  await page.getByTestId('swipe-card').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/story-1/);
  await expect(page.getByRole('heading', { name: /forest finds/ })).toBeFocused();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByTestId('swipe-card').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /community kitchen/);
  await expect(page.locator('html')).toHaveAttribute('data-reduced', 'true');
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.getByRole('button', { name: 'Clear local data', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear local data', exact: true })).toBeFocused();
  await page.addStyleTag({
    content: 'html{font-size:200%}p,button,a,input,select,label{font-size:1rem!important}',
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Clear local data', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Keep my data' })).toBeVisible();
});
test('synthetic touch swipe saves; canceled pointer does not commit', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'CDP touch synthesis is Chromium-specific; other flows run on both engines.',
  );
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const card = page.getByTestId('swipe-card');
  const box = (await card.boundingBox())!;
  const client = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = box.y + 90;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 12; step++)
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + step * 12, y }],
    });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(card).toHaveAttribute('aria-label', /community kitchen/);
  await expect(page).toHaveURL(/\/$/);
  const next = (await card.boundingBox())!;
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: next.x + 100, y: next.y + 90 }],
  });
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: next.x + 165, y: next.y + 90 }],
  });
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(card).toHaveAttribute('aria-label', /community kitchen/);
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await expect(card).toHaveAttribute('aria-label', /low-cost sensor/);
});

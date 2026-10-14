import { test, expect } from '@playwright/test';

test('Back reverses the cover into the originating card and permits another opening', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const start = document.startViewTransition?.bind(document);
    Object.assign(window, { returnCaptures: [] });
    if (start)
      document.startViewTransition = (callback) => {
        const transition = start(callback);
        transition.ready.then(
          () => {
            if (document.documentElement.dataset.articleTransition === 'returning') {
              const cover = document.querySelector('[data-story-opening]');
              (window as unknown as { returnCaptures: boolean[] }).returnCaptures.push(
                !!cover && window.getComputedStyle(cover).viewTransitionName === 'article-cover',
              );
            }
          },
          () => {},
        );
        return transition;
      };
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('swipe-card').click();
  await expect(page).toHaveURL(/story-1/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toHaveAttribute('aria-label', /forest finds/);
  await expect(page.locator('html')).not.toHaveAttribute('data-article-transition');
  if (await page.evaluate(() => typeof document.startViewTransition === 'function'))
    expect(
      await page.evaluate(
        () => (window as unknown as { returnCaptures: boolean[] }).returnCaptures,
      ),
    ).toEqual([true]);
  await page.getByTestId('swipe-card').click();
  await expect(page).toHaveURL(/story-1/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toBeVisible();
});

test('mobile actions retain their original normal-flow appearance', async ({ page }) => {
  for (const [width, height] of [
    [390, 844],
    [360, 740],
    [320, 568],
    [430, 932],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'A brighter world', exact: true }),
    ).toBeVisible();
    const controls = page.locator('.swipe-controls');
    await expect(controls).toHaveCSS('position', 'static');
    await expect(controls).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    if (height < 800)
      await controls.evaluate((element) =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' }),
      );
    for (const label of ['Skip', 'Save']) {
      const control = (await page.getByRole('button', { name: label, exact: true }).boundingBox())!;
      const nav = (await page.locator('.bottom-nav').boundingBox())!;
      expect(control.y).toBeGreaterThanOrEqual(0);
      expect(control.y + control.height).toBeLessThanOrEqual(nav.y);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

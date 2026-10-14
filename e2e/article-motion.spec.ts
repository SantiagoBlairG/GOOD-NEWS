import { test, expect } from '@playwright/test';

test('card opens with a valid shared transition and Back can interrupt it', async ({ page }) => {
  await page.addInitScript(() => {
    const start = document.startViewTransition?.bind(document);
    Object.assign(window, { articleMotionErrors: [], articleMotionReady: false });
    if (start)
      document.startViewTransition = (callback) => {
        const transition = start(callback);
        transition.ready.then(
          () => {
            const hero = document.querySelector('.article-hero');
            Object.assign(window, {
              articleMotionReady: true,
              articleMotionCaptured:
                !!hero && window.getComputedStyle(hero).viewTransitionName === 'article-cover',
            });
          },
          (error) => {
            (window as unknown as { articleMotionErrors: string[] }).articleMotionErrors.push(
              String(error),
            );
          },
        );
        return transition;
      };
  });
  await page.goto('/');
  await page.getByTestId('swipe-card').click();
  await expect(page).toHaveURL(/\/story\//);
  const supported = await page.evaluate(() => typeof document.startViewTransition === 'function');
  if (supported) {
    await page.waitForFunction(
      () => (window as unknown as { articleMotionReady: boolean }).articleMotionReady,
    );
    expect(
      await page.evaluate(
        () => (window as unknown as { articleMotionErrors: string[] }).articleMotionErrors,
      ),
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => (window as unknown as { articleMotionCaptured: boolean }).articleMotionCaptured,
      ),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByTestId('swipe-card')).toBeVisible();
  await expect(page.locator('html')).not.toHaveAttribute('data-article-transition');
});

test('fallback and reduced-motion openings stay readable and preserve navigation', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(document, 'startViewTransition', {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto('/discover?topic=education');
  await page.locator('.story-row-link').first().click();
  await expect(page.locator('.article')).toHaveClass(/article-enter/);
  await expect(page.locator('.reading')).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/topic=education/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.story-row-link').first().click();
  await expect(page.locator('.article')).toHaveClass(/article-enter-reduced/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

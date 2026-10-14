import { test, expect } from '@playwright/test';

test('diagonal touch swipe tracks the finger, locks page scroll, and exits without reversing', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Uses CDP touch synthesis; pointer and button flows run on both engines.',
  );
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const card = page.getByTestId('swipe-card');
  await expect(card).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 40));
  const scroll = await page.evaluate(() => window.scrollY);
  const box = (await card.boundingBox())!;
  const client = await page.context().newCDPSession(page);
  const startX = box.x + 90,
    startY = box.y + 100;
  const touch = async (type: string, x?: number, y?: number) =>
    client.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: x === undefined ? [] : [{ x, y }],
    });
  await touch('touchStart', startX, startY);
  // A realistic finger initially drifts vertically before committing to a diagonal swipe.
  await touch('touchMove', startX + 6, startY + 28);
  for (let step = 1; step <= 10; step++)
    await touch('touchMove', startX + step * 15, startY + 28 + step * 5);
  await page.waitForTimeout(30);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  expect(
    await card.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41),
  ).toBeCloseTo(150, 0);
  const old = await card.elementHandle();
  await touch('touchEnd');
  const positions = await old!.evaluate(async (element) => {
    const values: number[] = [];
    for (let frame = 0; frame < 8; frame++) {
      await new Promise(requestAnimationFrame);
      if (!element.isConnected) break;
      values.push(new DOMMatrixReadOnly(getComputedStyle(element).transform).m41);
    }
    return values;
  });
  expect(positions.length).toBeGreaterThan(1);
  for (let index = 1; index < positions.length; index++)
    expect(positions[index]).toBeGreaterThanOrEqual(positions[index - 1] - 0.5);
  await expect(card).toHaveAttribute('aria-label', /community kitchen/);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await expect(page).toHaveURL(/\/$/);
  // The next card accepts a left swipe and advances exactly once.
  const next = (await card.boundingBox())!;
  await touch('touchStart', next.x + 240, next.y + 110);
  for (let step = 1; step <= 10; step++)
    await touch('touchMove', next.x + 240 - step * 15, next.y + 110 + step * 4);
  await touch('touchEnd');
  await expect(card).toHaveAttribute('aria-label', /low-cost sensor/);
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bright-side:v1')!).saved,
  );
  expect(saved.map((entry: { id: string }) => entry.id)).toEqual(['story-1']);
  // Scrolling the page outside the card still works.
  const outsideScroll = await page.evaluate(() => window.scrollY);
  await touch('touchStart', 5, 380);
  for (let step = 1; step <= 8; step++) await touch('touchMove', 5, 380 - step * 20);
  await touch('touchEnd');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(outsideScroll);
});

test('release outside the card and lost capture recover without unintended article opens', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const card = page.getByTestId('swipe-card');
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + 35, box.y + 130, { steps: 12 });
  await page.mouse.up();
  await expect(card).toHaveAttribute('aria-label', /community kitchen/);
  const next = (await card.boundingBox())!;
  await page.mouse.move(next.x + 100, next.y + 80);
  await page.mouse.down();
  await page.mouse.move(next.x + 160, next.y + 80, { steps: 8 });
  await card.dispatchEvent('lostpointercapture');
  await page.mouse.up();
  await expect(card).toHaveAttribute('aria-label', /community kitchen/);
  await expect
    .poll(() =>
      card.evaluate((el) => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)),
    )
    .toBeLessThan(1);
  await expect(page).toHaveURL(/\/$/);
  await card.click();
  await expect(page).toHaveURL(/story-2/);
});

import { chromium } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('.impeccable/review', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const width of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(() => {
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (callback) => {
      const transition = start(callback);
      window.previewTransition = transition;
      return transition;
    };
  });
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('.hero img').evaluate((image) => image.decode());
  await page.getByTestId('swipe-card').click();
  await page.waitForFunction(
    () => document.documentElement.dataset.articleTransition === 'opening',
  );
  await page.evaluate(async () => {
    await window.previewTransition.ready;
  });
  await page.evaluate(() =>
    document.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = 140;
    }),
  );
  await page.screenshot({ path: `.impeccable/review/article-opening-${width}.png` });
  await page.evaluate(() => document.getAnimations().forEach((animation) => animation.play()));
  await page.waitForFunction(() => !document.documentElement.dataset.articleTransition);
  await page.screenshot({ path: `.impeccable/review/article-opened-${width}.png` });
  await page.close();
}
await browser.close();
console.log('Captured shared-cover opening and settled article at phone/desktop widths.');

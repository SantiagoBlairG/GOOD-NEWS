import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  for (const [name, width, height, route, dark] of [
    ['desktop-home', 1440, 1000, '/', false],
    ['desktop-home-dark', 1440, 1000, '/', true],
    ['desktop-discover', 1440, 1000, '/discover', false],
    ['desktop-home-compact', 1024, 900, '/', false],
    ['mobile-home-preserved', 390, 844, '/', false],
    ['saved-empty-desktop', 1440, 1000, '/saved', false],
    ['saved-empty-tablet', 862, 800, '/saved', false],
    ['saved-empty-mobile', 390, 844, '/saved', false],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:5173' + route);
    await page.evaluate(() => document.fonts.ready);
    if (dark) await page.locator('.header-actions button').click();
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every((animation) => animation.playState === 'finished' || animation.playState === 'idle'),
    );
    await page.screenshot({ path: `docs/previews/${name}.png`, fullPage: true });
    if (dark) await page.locator('.header-actions button').click();
  }
} finally {
  await browser.close();
}

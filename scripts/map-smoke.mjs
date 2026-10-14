import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
await page.goto('http://127.0.0.1:5173/discover/map');
await page.waitForTimeout(7000);
console.log(
  JSON.stringify({
    failed: await page.getByText('The map couldn’t load.').count(),
    canvas: await page.locator('canvas').count(),
    errors,
  }),
);
await page.screenshot({ path: 'docs/previews/map-smoke.png', fullPage: true });
await page.locator('.map-container').screenshot({ path: 'docs/previews/green-map.png' });
await browser.close();

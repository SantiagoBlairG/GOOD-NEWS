import { chromium } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('.impeccable/review', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
const results = [];
const widths = [320, 390, 430, 768, 1440];
for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: width === 320 ? 568 : 900 },
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://demotiles.maplibre.org/**', (r) => r.abort());
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  for (const [name, route] of [
    ['home', '/'],
    ['discover', '/discover'],
    ['saved', '/saved'],
    ['profile', '/profile'],
    ['article', '/story/story-18'],
    ['map', '/discover/map'],
  ]) {
    await page.goto('http://127.0.0.1:5173' + route);
    await page.locator('h1').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll((imgs) =>
      Promise.allSettled(
        imgs.map((img) => {
          img.loading = 'eager';
          return img.decode();
        }),
      ),
    );
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    results.push({ width, route, overflow });
    await page.screenshot({ path: `.impeccable/review/${name}-${width}.png`, fullPage: true });
  }
  await page.goto('http://127.0.0.1:5173/profile');
  await page.getByLabel('Appearance').selectOption('dark');
  await page.screenshot({ path: `.impeccable/review/dark-${width}.png`, fullPage: true });
  await page.close();
}
await browser.close();
fs.writeFileSync(
  '.impeccable/review/verification.json',
  JSON.stringify({ results, errors }, null, 2),
);
if (errors.length || results.some((r) => r.overflow))
  throw new Error(JSON.stringify({ errors, overflow: results.filter((r) => r.overflow) }));
console.log('30 route/viewport checks passed; light and dark screenshots captured.');

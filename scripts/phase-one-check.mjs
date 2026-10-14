import { chromium } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('docs/previews', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
const page = await browser.newPage();
page.on('pageerror', (error) => errors.push(error.message));
for (const width of [390, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of [
    '/',
    '/discover',
    '/discover/map',
    '/saved',
    '/saved/topic/environment',
    '/profile',
    '/story/story-1',
    '/story/unknown',
    '/unknown',
  ]) {
    await page.goto('http://127.0.0.1:5173' + route);
    await page.locator('h1').first().waitFor();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
      throw new Error(`Overflow ${route} at ${width}`);
  }
  await page.goto('http://127.0.0.1:5173/');
  await page.screenshot({ path: `docs/previews/phase-1-${width}.png`, fullPage: true });
}
await browser.close();
if (errors.length) throw new Error(errors.join('\n'));
console.log('All routes render at 390/1440px without overflow or runtime errors.');

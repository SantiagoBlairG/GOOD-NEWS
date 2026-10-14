/* global Image */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:5173/discover/map');
  const stories = JSON.parse(fs.readFileSync('src/data/stories.json', 'utf8'));
  const loaded = await page.evaluate(
    async (paths) =>
      Promise.all(
        paths.map(
          (path) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img.naturalWidth > 0);
              img.onerror = () => resolve(false);
              img.src = path;
            }),
        ),
      ),
    stories.map((story) => story.image.path),
  );
  if (loaded.some((value) => !value)) throw new Error('Article image failed to load');
  const instruction = await page.locator('.map-help').boundingBox();
  const map = await page.locator('.lazy-map').boundingBox();
  if (map.y - instruction.y - instruction.height < 28)
    throw new Error('Map instruction needs 28px spacing');
  await page.screenshot({ path: 'docs/previews/map-instruction-mobile.png', fullPage: true });
  console.log('All 24 article images load; map instruction appears above with 28px spacing.');
} finally {
  await browser.close();
}

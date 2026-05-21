import { chromium } from 'playwright';

const positions = [
  { name: '01-hero',              scrollVH: 0.0  },
  { name: '02-bridge',            scrollVH: 4.0  },
  { name: '03-moment02-shore',    scrollVH: 5.5  },
  { name: '04-moment03-aerial',   scrollVH: 8.0  },
  { name: '05-moment04-jetty',    scrollVH: 10.5 },
  { name: '06-moment05-shade',    scrollVH: 13.0 },
  { name: '07-moment06-pavilion', scrollVH: 15.5 },
  { name: '08-moment07-interior', scrollVH: 18.0 },
  { name: '09-moment09-plate',    scrollVH: 23.0 },
  { name: '10-moment10-night',    scrollVH: 30.0 },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') console.log('PAGE-ERR:', m.text());
});
page.on('pageerror', (e) => console.log('PAGE-EXCEPTION:', e.message));

await page.goto('http://localhost:3000', { waitUntil: 'load' });
await page.evaluate(() => sessionStorage.setItem('arrival.entry.seen', '1'));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(2500);

const vh = 900;
for (const { name, scrollVH } of positions) {
  const y = scrollVH * vh;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `/tmp/the-arrival-audit/${name}.png`, fullPage: false });
  console.log(`captured ${name} @ scrollY=${y}`);
}

await browser.close();

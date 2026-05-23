import { chromium } from 'playwright';

// 7-chapter layout. Each pinned chapter consumes (1 + pin%) viewports of
// scroll, so each chapter's mid-pin scrollY is the cumulative pin spacing
// of all earlier chapters + half of its own pin distance. With viewport
// height 900px:
//   FilmHomepage (Chapter I): natural 900 + pin 3600 (400%) = 4500 → next at 4500
//   ChapterShore (II):   natural 900 + pin 1980 (220%) = 2880 → next at 7380
//   ChapterPath (III):   natural 900 + pin 1980 (220%) = 2880 → next at 10260
//   ChapterPavilion(IV): natural 900 + pin 2160 (240%) = 3060 → next at 13320
//   ChapterTable (V):    natural 900 + pin 2700 (300%) = 3600 → next at 16920
//   ChapterEvening(VI):  natural 900 + pin 1980 (220%) = 2880 → next at 19800
//   ChapterInvitation(VII): natural 900 + pin 2250 (250%) = 3150 → end at 22950
const positions = [
  { name: '01-arrival',      scrollY: 0     },
  { name: '02-shore',        scrollY: 5940  }, // mid of (4500 + 2880)
  { name: '03-path',         scrollY: 8820  }, // mid of (7380 + 2880)
  { name: '04-pavilion',     scrollY: 11790 }, // mid of (10260 + 3060)
  { name: '05-table',        scrollY: 15120 }, // mid of (13320 + 3600)
  { name: '06-evening',      scrollY: 18360 }, // mid of (16920 + 2880)
  { name: '07-invitation',   scrollY: 21375 }, // mid of (19800 + 3150)
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

for (const { name, scrollY } of positions) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
  await page.waitForTimeout(5000);
  const actualY = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `/tmp/the-arrival-audit/${name}.png`, fullPage: false });
  console.log(`captured ${name} target=${scrollY} actual=${actualY}`);
}

await browser.close();

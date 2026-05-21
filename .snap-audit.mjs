import { chromium } from 'playwright';

// Scroll positions corrected for pinSpacing. Each pinned moment consumes
// (1 + pin%) viewports of scroll, not 1, so the document scroll position
// of each moment is the cumulative pin spacing of all earlier moments.
//   FilmHomepage natural 900 + pin 3600 = 4500 → Moment02 at scrollY 4500
//   Moment02 natural 900 + pin 2250 = 3150 → Moment03 at 7650
//   Moment03 same → Moment04 at 10800
//   ... Moment08 has pin 2700 (300%, not 250%) → adds 3600 instead of 3150
//   ... MomentGallery has pin 3600 (400%) → adds 4500 instead of 3150
// Mid-pin positions (scrollY of pin start + half pin distance) give the
// best representative frame for each moment's "settled" state.
const positions = [
  { name: '01-hero',              scrollY: 0     }, // FilmHomepage start
  { name: '02-bridge',            scrollY: 3600  }, // FilmHomepage end
  { name: '03-moment02-shore',    scrollY: 5600  }, // Moment02 mid (4500+1100)
  { name: '04-moment03-aerial',   scrollY: 8750  }, // Moment03 mid (7650+1100)
  { name: '05-moment04-jetty',    scrollY: 11900 }, // Moment04 mid (10800+1100)
  { name: '06-moment05-shade',    scrollY: 15050 }, // Moment05 mid (13950+1100)
  { name: '07-moment06-pavilion', scrollY: 18200 }, // Moment06 mid (17100+1100)
  { name: '08-moment07-interior', scrollY: 21350 }, // Moment07 mid (20250+1100)
  { name: '09-moment09-plate',    scrollY: 27300 }, // Moment09 mid (after 2700 pin for Moment08)
  { name: '10-moment10-night',    scrollY: 36000 }, // Moment10 mid (after gallery 4500)
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
  const y = scrollY;
  // Wait long enough for Lenis (lerp 0.035) to actually settle. With less
  // than ~4s the screenshot captures a still-interpolating camera and
  // unrelated moments' text bleeds in from earlier in the lerp path.
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
  await page.waitForTimeout(5000);
  const actualY = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `/tmp/the-arrival-audit/${name}.png`, fullPage: false });
  console.log(`captured ${name} target=${y} actual=${actualY}`);
}

await browser.close();

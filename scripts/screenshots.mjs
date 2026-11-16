// Reproducible screenshots for the README. Requires a running server (default http://localhost:3000).
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = process.argv[2] ?? "screenshots";
fs.mkdirSync(out, { recursive: true });

const shots = [
  { name: "home", url: "/", vp: { width: 1440, height: 900 }, wait: 4200 },
  { name: "collection", url: "/effects", vp: { width: 1440, height: 900 }, wait: 3000 },
  { name: "playground", url: "/playground?effect=scramble-decode", vp: { width: 1440, height: 900 }, wait: 2500 },
  { name: "effect-page", url: "/effects/text-mask-video", vp: { width: 1440, height: 900 }, wait: 2500 },
  { name: "mobile", url: "/", vp: { width: 390, height: 844 }, wait: 4200, mobile: true },
  { name: "tablet", url: "/effects", vp: { width: 768, height: 1024 }, wait: 3000 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: s.vp, deviceScaleFactor: 2, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  await page.goto(base + s.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(s.wait);
  await page.screenshot({ path: `${out}/${s.name}.png` });
  console.log(`✓ ${out}/${s.name}.png`);
  await page.close();
}
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(base + "/opengraph-image");
await og.screenshot({ path: `${out}/og.png` });
await browser.close();

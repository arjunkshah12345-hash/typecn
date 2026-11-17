import { expect, test, type Page } from "@playwright/test";
import { effects } from "../src/registry/effects";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return errors;
}

const LONG = "Typography is the craft of endowing language\nwith a durable visual form — and now, motion.";

for (const e of effects) {
  test(`effect ${String(e.number).padStart(2, "0")} ${e.slug} renders, animates and survives long text`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/effects/${e.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(e.name);
    const stage = page.locator("[data-stage]");
    const root = stage.locator("[data-typecn]").first();
    await expect(root).toBeAttached();
    // Accessible text: the visually-hidden copy carries the full phrase once.
    const srText = (await root.locator(":scope > span").first().textContent()) ?? "";
    expect(srText.replace(/\s+/g, " ").trim().length).toBeGreaterThan(0);
    await expect(root.locator(':scope > span[aria-hidden="true"]')).toHaveCount(1);

    // Something visible is drawn and changes over time (DOM, canvas or SVG).
    const box = await stage.boundingBox();
    expect(box!.width).toBeGreaterThan(200);
    await page.mouse.move(box!.x + box!.width * 0.3, box!.y + box!.height * 0.5);
    await page.waitForTimeout(400);
    const a = await stage.screenshot();
    await page.mouse.move(box!.x + box!.width * 0.55, box!.y + box!.height * 0.45, { steps: 8 });
    if (e.kind === "scroll") await stage.locator("[data-typecn-scroll]").evaluate((el) => el.scrollBy(0, el.clientHeight * 0.6));
    await page.waitForTimeout(e.slug === "vertical-rolling-headline" || e.slug === "morphing-headline" ? 2600 : 900);
    // Bursty effects (e.g. Glitch Shift) can sit still for a few seconds — sample a few times.
    let changed = false;
    for (let i = 0; i < 8 && !changed; i++) {
      if (i) await page.waitForTimeout(500);
      changed = Buffer.compare(a, await stage.screenshot()) !== 0;
    }
    expect(changed, "stage should change over time / with input").toBe(true);

    // Long multi-line text through the playground textarea.
    await page.getByLabel("Text", { exact: true }).fill(LONG);
    await page.waitForTimeout(700);
    const sr = await stage.locator("[data-typecn]").first().locator(":scope > span").first().textContent();
    expect(sr?.replace(/\s+/g, " ")).toContain("durable visual form");

    expect(errors, errors.join("\n")).toEqual([]);
  });
}

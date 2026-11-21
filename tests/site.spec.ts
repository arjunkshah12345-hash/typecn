import { expect, test } from "@playwright/test";

test("home renders hero, featured live cards, playground demo, tree and closing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Type that moves.");
  await expect(page.getByRole("link", { name: "Browse effects" }).first()).toBeVisible();
  await expect(page.locator("section[aria-labelledby=featured-title] article")).toHaveCount(10);
  // Tune demo: moving a slider updates the generated code.
  const amp = page.locator("section[aria-labelledby=tune-title]").getByRole("slider", { name: /Amplitude/ });
  await amp.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("section[aria-labelledby=tune-title] pre")).toContainText("amplitude={0.27}");
  // Library tree: switching family updates the file list.
  await page.getByRole("tab", { name: /cinematic/ }).click();
  await expect(page.getByRole("link", { name: /grand-finale\.tsx/ })).toBeVisible();
  await page.mouse.wheel(0, 20000);
  await page.waitForTimeout(800);
  expect(errors).toEqual([]);
});

test("gallery search, filter, sort and empty state", async ({ page }) => {
  await page.goto("/effects");
  const cards = page.locator("article");
  await expect(cards).toHaveCount(50);
  await page.getByRole("tab", { name: /Distortion/ }).click();
  await expect(cards).toHaveCount(10);
  await page.getByRole("tab", { name: /^All/ }).click();
  await page.getByPlaceholder("Search 50 effects").fill("scroll");
  await expect(page.getByText(/effects? matching “scroll”/)).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(1);
  await page.getByPlaceholder("Search 50 effects").fill("zzzzqqq");
  await expect(page.getByText(/no type matches/i).first()).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).first().click();
  await expect(cards).toHaveCount(50);
  await page.getByRole("combobox").selectOption("name");
  await expect(cards.first()).toContainText("3D Depth Type");
  await page.keyboard.press("/");
  await expect(page.getByPlaceholder("Search 50 effects")).toBeFocused();
});

test("category deep link filters the gallery", async ({ page }) => {
  await page.goto("/effects?category=interactive");
  await expect(page.locator("article")).toHaveCount(10);
});

test("playground: controls update preview, code and the share URL round-trips", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/playground?effect=wave-text");
  await expect(page.getByRole("combobox").first()).toHaveValue("wave-text");
  await page.getByLabel("Text", { exact: true }).fill("Hello waves");
  await page.getByRole("radio", { name: /Geist Mono/ }).click();
  const amp = page.getByRole("slider", { name: "Amplitude" });
  await amp.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  await expect(page.locator("pre code").first()).toContainText('text="Hello waves"');
  await expect(page.locator("pre code").first()).toContainText("amplitude={0.28}");
  await expect(page.locator("pre code").first()).toContainText("Geist Mono");
  await page.waitForTimeout(400);
  const url = page.url();
  expect(url).toContain("effect=wave-text");
  expect(url).toContain("p.amplitude=0.28");

  // Copy share link
  await page.getByRole("button", { name: /Copy share link/ }).click();
  await expect(page.getByRole("status")).toContainText("Share link copied");
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain("p.amplitude=0.28");

  // Shared URL reconstructs the same state
  const p2 = await context.newPage();
  await p2.goto(clip);
  await expect(p2.getByLabel("Text", { exact: true })).toHaveValue("Hello waves");
  await expect(p2.getByRole("slider", { name: "Amplitude" })).toHaveValue("0.28");
  await expect(p2.locator("pre code").first()).toContainText("amplitude={0.28}");

  // CSS + Install tabs
  await page.getByRole("tab", { name: "CSS" }).click();
  await expect(page.locator("pre code").first()).toContainText("@keyframes typecn-wave");
  await page.getByRole("tab", { name: "Install" }).click();
  await expect(page.locator("pre code").first()).toContainText("/r/wave-text.json");

  // Copy React code
  await page.getByRole("tab", { name: "React" }).click();
  await page.getByRole("button", { name: "Copy", exact: true }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('import { WaveText } from "typecn"');

  // Source view loads the real file
  await page.getByRole("radio", { name: "wave-text.tsx" }).click();
  await expect(page.locator("pre code").first()).toContainText("export function WaveText");

  // Reset
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Text", { exact: true })).toHaveValue("riding the wave");
});

test("playground: every control type of an effect is functional", async ({ page }) => {
  await page.goto("/effects/scramble-decode");
  await page.getByRole("radio", { name: "inView" }).click();
  await page.getByRole("switch", { name: "Loop" }).click();
  await page.getByLabel("Scramble colour hex").fill("#00ff88");
  await page.getByLabel("Glyph pool").fill("01");
  const code = page.locator("pre code").first();
  await expect(code).toContainText('trigger="inView"');
  await expect(code).not.toContainText("loop");
  await expect(code).toContainText('scrambleColor="#00ff88"');
  await expect(code).toContainText('characters="01"');
  await page.getByRole("combobox", { name: "Easing" }).count();
});

test("playground keyboard shortcuts", async ({ page }) => {
  await page.goto("/playground?effect=wave-text");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("]");
  await expect(page.getByRole("combobox").first()).toHaveValue("magnetic-letters");
  await page.keyboard.press("[");
  await expect(page.getByRole("combobox").first()).toHaveValue("wave-text");
  await page.keyboard.press(" ");
  await expect(page.getByText("Paused", { exact: true })).toBeVisible();
  await page.keyboard.press("r");
  await expect(page.getByText("Playing", { exact: true })).toBeVisible();
});

test("registry item is valid shadcn JSON with real source", async ({ request }) => {
  const r = await request.get("/r/scramble-decode.json");
  expect(r.ok()).toBeTruthy();
  const j = await r.json();
  expect(j.files).toHaveLength(2);
  expect(j.files[0].target).toBe("components/typecn/core.tsx");
  expect(j.files[1].content).toContain("export function ScrambleText");
});

test("SEO: sitemap, robots, per-effect metadata and OG image", async ({ page, request }) => {
  const sm = await (await request.get("/sitemap.xml")).text();
  expect(sm).toContain("/effects/grand-finale");
  expect((await request.get("/robots.txt")).ok()).toBeTruthy();
  await page.goto("/effects/liquid-type");
  await expect(page).toHaveTitle(/Liquid Type/);
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toContain("/effects/liquid-type");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBeTruthy();
  const img = await request.get(new URL(og!).pathname);
  expect(img.headers()["content-type"]).toContain("image/png");
});

test("docs pages render", async ({ page }) => {
  for (const p of ["/docs", "/docs/installation", "/docs/customization", "/docs/animation-principles", "/docs/performance", "/docs/accessibility", "/docs/browser-support", "/docs/contributing"]) {
    await page.goto(p);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("text is fully readable and static", async ({ page }) => {
    await page.goto("/effects/character-cascade");
    const unit = page.locator("[data-stage] [data-tc-unit]").first();
    await expect(unit).toHaveCSS("opacity", "1");
    const anims = await page.locator("[data-stage]").evaluate((el) => el.getAnimations({ subtree: true }).length);
    expect(anims).toBe(0);
    await page.goto("/effects/typewriter");
    await expect(page.locator("[data-stage] [data-typecn] span[aria-hidden] span").first()).toHaveCSS("visibility", "visible");
  });
});

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`no horizontal overflow at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize(vp);
    for (const p of ["/", "/effects", "/playground", "/effects/grand-finale", "/docs"]) {
      await page.goto(p);
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${p} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
}

test("mobile navigation opens and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: /Playground/ }).click();
  await expect(page).toHaveURL(/\/playground/);
  await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
});

test("command menu searches and navigates", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "Search typecn" });
  await expect(dialog).toBeVisible();
  await page.keyboard.type("glitch");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/effects\/glitch-shift/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Glitch Shift");
});

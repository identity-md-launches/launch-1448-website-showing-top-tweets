// Checks the delivered export at a subpath. Test tools stay outside the runtime bundle.
import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const { chromium } = await import(process.env.POND_PLAYWRIGHT_MODULE || "playwright");
const exportRoot = path.resolve("dist");
const outputRoot = path.resolve("artifacts");
await mkdir(outputRoot, { recursive: true });
const mime = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    assert(pathname.startsWith("/preview/"));
    const file = path.resolve(exportRoot, pathname.slice("/preview/".length) || "index.html");
    assert(file.startsWith(exportRoot + path.sep));
    response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/preview/`;
const results = { checks: [], viewports: [], accessibility: [], console: [], resourceFailures: [] };
let browser;
let page;

async function check(name, run) {
  try {
    await run();
    results.checks.push({ name, result: "passed" });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.checks.push({ name, result: "failed", detail: error.message });
    throw error;
  }
}
async function settled() {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function count(expected) {
  await settled();
  assert.equal(await page.locator(".post-card").count(), expected);
}
async function scan(name) {
  if (!process.env.POND_AXE_SCRIPT) {
    results.accessibility.push({ name, result: "not run", reason: "POND_AXE_SCRIPT not set" });
    return;
  }
  await page.addScriptTag({ path: process.env.POND_AXE_SCRIPT });
  const audit = await page.evaluate(async () => {
    const { violations, incomplete, passes } = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return {
      violations: violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })),
      incomplete: incomplete.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })),
      passingRules: passes.length,
    };
  });
  results.accessibility.push({ name, ...audit });
  assert.equal(audit.violations.length, 0, `${name}: axe violations`);
}
async function open(context, hash = "") {
  page = await context.newPage();
  page.on("console", message => {
    if (["warning", "error"].includes(message.type())) results.console.push(message.text());
  });
  page.on("pageerror", error => results.console.push(error.message));
  page.on("requestfailed", request => results.resourceFailures.push({ url: request.url(), error: request.failure() }));
  page.on("response", response => {
    if (response.status() >= 400) results.resourceFailures.push({ url: response.url(), status: response.status() });
  });
  await page.goto(url + hash);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.POND_CHROMIUM ? { executablePath: process.env.POND_CHROMIUM } : {}),
  });
  results.browser = browser.version();
  for (const width of [320, 390, 576, 577, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 577 ? 844 : 900 }, isMobile: width < 577, hasTouch: width < 577, deviceScaleFactor: 1 });
    await open(context);
    await check(`Layout and three weights at ${width}px`, async () => {
      const measured = await page.evaluate(() => {
        const box = selector => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom };
        };
        const weights = [...new Set([...document.querySelectorAll("body *")]
          .filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
          .map(el => getComputedStyle(el).fontWeight))].sort();
        return {
          width: innerWidth, height: innerHeight, scrollY, weights,
          overflow: document.documentElement.scrollWidth > innerWidth,
          fontsLoaded: [...document.fonts].some(font => font.family === "Manrope" && font.status === "loaded"),
          allImagesLoaded: [...document.images].every(img => img.complete && img.naturalWidth > 0),
          hero: box(".hero"), action: box(".primary-button"), card: box(".post-card"),
          copy: box(".post-copy"), bookmark: box(".save-button"), source: box(".post-footer a"),
        };
      });
      results.viewports.push(measured);
      assert.equal(measured.overflow, false);
      assert.equal(measured.fontsLoaded, true);
      assert.equal(measured.allImagesLoaded, true);
      assert.deepEqual(measured.weights, ["400", "600", "800"]);
      if (width === 390) {
        assert.equal(measured.scrollY, 0);
        for (const key of ["action", "copy", "bookmark"]) {
          assert(measured[key].y >= 0 && measured[key].bottom <= 844, `${key} must fit the first screen`);
        }
        assert(measured.bookmark.width >= 44 && measured.bookmark.height >= 44);
      }
    });
    if ([320, 390, 768, 1440].includes(width)) {
      await page.screenshot({ path: `${outputRoot}/final-${width}.jpg`, quality: 80 });
    }
    if (width === 1440) {
      await page.screenshot({ path: `${outputRoot}/final-desktop-full.jpg`, quality: 75, fullPage: true });
      await scan("Desktop feed");
      await check("Descriptive sidebar and no redundant promotional lines", async () => {
        assert.equal(await page.locator(".hero-tag, .art-caption, .collection-note > span").count(), 0);
        assert.equal(await page.locator(".feed-intro").count(), 0);
        assert.equal(await page.locator(".mission-card h2").innerText(), "About IdentityMD");
        assert.equal(await page.locator(".curation-card h2").innerText(), "About this collection");
        assert.equal(await page.locator(".curation-card p").innerText(), "Excerpts and summaries link to the original posts on X.");
      });
    }
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await open(context);
  await scan("Mobile feed");
  await check("Metadata and original post destinations", async () => {
    assert.match(await page.title(), /Top tweets about IdentityMD/);
    for (const selector of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:image"]']) {
      assert(await page.locator(selector).getAttribute("content"));
    }
    const favicon = await page.locator('link[rel="icon"]').getAttribute("href");
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    for (const asset of [favicon, image]) assert.equal((await page.request.get(new URL(asset, url).href)).status(), 200);
    const links = await page.locator(".post-footer a").evaluateAll(els => els.map(el => ({ href: el.href, target: el.target, rel: el.rel })));
    assert.equal(links.length, 8);
    assert(links.every(link => /^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(link.href) && link.target === "_blank" && link.rel.includes("noopener")));
  });
  await check("First-screen bookmark saves without scrolling", async () => {
    await page.locator(".save-button").first().tap();
    await settled();
    assert.equal(await page.locator(".save-button").first().getAttribute("aria-pressed"), "true");
    assert.equal(await page.evaluate(() => scrollY), 0);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("the-pond:saved:v1"))), ["2107528618746454276"]);
    await page.getByRole("button", { name: "Dismiss notification" }).click();
  });
  await check("Snapshot dialog, keyboard loop, Escape and focus return", async () => {
    const trigger = page.locator(".collection-note button");
    await trigger.focus();
    await page.keyboard.press("Enter");
    assert(await page.locator("dialog").isVisible());
    await scan("Mobile about dialog");
    await page.locator("dialog button").focus();
    await page.keyboard.press("Shift+Tab");
    assert(await page.locator("dialog a").evaluate(el => el === document.activeElement));
    await page.keyboard.press("Tab");
    assert(await page.locator("dialog button").evaluate(el => el === document.activeElement));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").isVisible(), false);
    assert(await trigger.evaluate(el => el === document.activeElement));
  });
  await check("Explore action and repeated Feed navigation", async () => {
    await page.locator(".primary-button").click();
    await settled();
    assert.equal(new URL(page.url()).hash, "#feed");
    assert(await page.locator("#feed-title").evaluate(el => el === document.activeElement));
    await page.locator(".site-header nav a[href='#feed']").click();
    await settled();
    assert(await page.locator("#feed-title").evaluate(el => el === document.activeElement));
  });
  await check("Topic filters and combined search", async () => {
    for (const [topic, expected] of [["Building", 3], ["Ideas", 3], ["Community", 2]]) {
      const button = page.getByRole("button", { name: topic, exact: true });
      await button.click();
      await count(expected);
      assert.equal(await button.getAttribute("aria-pressed"), "true");
    }
    await page.getByRole("button", { name: "Building", exact: true }).click();
    await page.getByRole("searchbox", { name: "Search the feed" }).fill("Adam");
    await count(2);
  });
  await check("No-results recovery and clear-search action", async () => {
    await page.locator("#search").fill("no-such-post-13579");
    await count(0);
    assert(await page.getByRole("heading", { name: "No posts found." }).isVisible());
    await scan("Mobile empty search");
    await page.locator(".empty-state button").click();
    await count(8);
    assert(await page.locator("#search").evaluate(el => el === document.activeElement));
    await page.locator("#search").fill("taylor_");
    await count(1);
    await page.getByRole("button", { name: "Clear search", exact: true }).click();
    await count(8);
  });
  await check("All sort orders", async () => {
    for (const order of ["newest", "oldest", "picks"]) {
      await page.locator("#sort").selectOption(order);
      await settled();
      const dates = await page.locator(".post-footer time").evaluateAll(els => els.map(el => Date.parse(el.dateTime)));
      if (order === "newest") assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
      if (order === "oldest") assert.deepEqual(dates, [...dates].sort((a, b) => a - b));
      if (order === "picks") assert.equal(await page.locator(".post-card h3").first().innerText(), "taylor");
    }
  });
  await check("Saved persistence, storage explanation and keyboard unsave", async () => {
    await page.locator(".site-header nav a[href='#saved']").click();
    await count(1);
    assert.match(await page.locator(".feed-intro").innerText(), /Saved only in this browser/);
    await page.reload();
    await count(1);
    assert.equal(new URL(page.url()).hash, "#saved");
    await page.locator(".save-button").focus();
    await page.keyboard.press("Space");
    await count(0);
    assert(await page.locator("#feed-title").evaluate(el => el === document.activeElement));
    await scan("Mobile empty Saved and notification");
    await page.getByRole("button", { name: "Dismiss notification" }).click();
    await page.locator(".empty-state a").click();
    await count(8);
  });
  await check("Sidebar topic switches from Saved to full feed", async () => {
    await page.locator(".site-header nav a[href='#saved']").click();
    await page.locator(".topics-card > button").nth(1).click();
    await count(3);
    assert.equal(new URL(page.url()).hash, "#feed");
    assert.equal(await page.locator(".filter-active").innerText(), "Ideas");
    assert(await page.locator(".filter-active").evaluate(el => el === document.activeElement));
  });
  await check("Keyboard skip link and visible bookmark focus", async () => {
    await page.goto(url);
    await page.keyboard.press("Tab");
    assert(await page.locator(".skip-link").evaluate(el => el === document.activeElement));
    await page.keyboard.press("Enter");
    assert(await page.locator("main").evaluate(el => el === document.activeElement));
    await page.locator(".save-button").first().focus();
    const focus = await page.locator(".save-button").first().evaluate(el => ({ visible: el.matches(":focus-visible"), width: getComputedStyle(el).outlineWidth, color: getComputedStyle(el).outlineColor }));
    assert.equal(focus.visible, true);
    assert.equal(focus.width, "2px");
    results.focus = focus;
    await page.screenshot({ path: `${outputRoot}/final-focus.jpg`, quality: 80 });
  });
  await check("Rendered opaque contrast pairs", async () => {
    results.contrast = await page.evaluate(() => {
      const rgb = text => text.match(/[\d.]+/g).slice(0, 3).map(Number);
      const luminance = values => values.map(v => {v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;}).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a, b) => {const l1=luminance(rgb(a)),l2=luminance(rgb(b)); return Number(((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2));};
      return [[".post-copy", ".post-card"], [".hero-copy > p", ".hero-copy"], [".primary-button", ".primary-button"]].map(([fg,bg]) => {
        const color = getComputedStyle(document.querySelector(fg)).color;
        const background = getComputedStyle(document.querySelector(bg)).backgroundColor;
        return { foreground: fg, backgroundElement: bg, color, background, ratio: ratio(color,background) };
      });
    });
    assert(results.contrast.every(pair => pair.ratio >= 4.5));
  });
  await check("390px with doubled root text", async () => {
    await page.evaluate(() => document.documentElement.style.fontSize = "32px");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator("#search").fill("taylor");
    await count(1);
    await page.screenshot({ path: `${outputRoot}/final-text-enlarged.jpg`, quality: 75 });
    await page.evaluate(() => document.documentElement.style.fontSize = "");
  });
  await check("Reduced-motion and forced-color focus states", async () => {
    await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
    await page.locator(".save-button").first().focus();
    assert.equal(await page.locator(".primary-button").evaluate(el => getComputedStyle(el).transitionDuration), "0s");
    assert.equal(await page.locator(".save-button").first().evaluate(el => getComputedStyle(el).outlineWidth), "2px");
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" });
  });
  await context.close();

  await check("Malformed saved data recovers", async () => {
    const malformed = await browser.newContext();
    await malformed.addInitScript(() => localStorage.setItem("the-pond:saved:v1", "{broken"));
    await open(malformed, "#saved");
    await count(0);
    assert(await page.locator(".empty-state").isVisible());
    await malformed.close();
  });
  await check("Blocked storage preserves this visit and explains the limitation", async () => {
    const blocked = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await blocked.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); };
    });
    await open(blocked);
    await page.locator(".save-button").first().click();
    await settled();
    assert.match(await page.locator(".toast p").innerText(), /Updated for this visit. Browser storage is unavailable/);
    assert.equal(await page.locator(".save-button").first().getAttribute("aria-pressed"), "true");
    await blocked.close();
  });
  await check("No console warnings/errors or failed resources", async () => {
    assert.deepEqual(results.console, []);
    assert.deepEqual(results.resourceFailures, []);
  });
} catch (error) {
  process.exitCode = 1;
  results.error = error.stack;
  console.error(error);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  await writeFile(`${outputRoot}/browser-results.json`, JSON.stringify(results, null, 2) + "\n");
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import Chromium, { inflate } from "@sparticuz/chromium";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Use a local Chrome on macOS/Windows; Linux CI can use the npm-bundled binary.
const executablePath =
  process.env.CHROME_EXECUTABLE_PATH || (await Chromium.executablePath());
let env = { ...process.env };
if (!process.env.CHROME_EXECUTABLE_PATH && process.platform === "linux") {
  const packageDir = resolve(
    dirname(fileURLToPath(import.meta.resolve("@sparticuz/chromium"))),
    "..",
  );
  const libs = await inflate(resolve(packageDir, "bin/al2023.tar.br"));
  env.LD_LIBRARY_PATH = `${libs}/lib:${env.LD_LIBRARY_PATH || ""}`;
}
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:8080";

test(
  "desktop, mobile, routing, motion, collection and enquiry flows",
  { timeout: 120000 },
  async () => {
    const browser = await chromium.launch({
      executablePath,
      args: Chromium.args.filter((arg) => arg !== "--single-process"),
      env,
      headless: true,
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(base);
      await page.locator("#take-dive").waitFor();
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "The Maldives",
      );
      assert.equal(
        await page.locator("#takeoff-movie, .movie-plane").count(),
        0,
      );
      assert.equal(
        await page.evaluate(() => document.fonts.check('16px "Wish Sans"')),
        true,
      );

      // A burst of wheel events is one gesture; a new gesture is one new place.
      await page.locator("#hero").evaluate((hero) => {
        for (let i = 0; i < 8; i++)
          hero.dispatchEvent(
            new WheelEvent("wheel", {
              deltaY: 40,
              bubbles: true,
              cancelable: true,
            }),
          );
      });
      assert.equal(await page.locator("#scene-name").textContent(), "Kenya");
      await page.waitForTimeout(230);
      await page.mouse.move(450, 450);
      await page.mouse.wheel(0, 90);
      await page.waitForTimeout(230);
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "Antarctica",
      );
      await page.mouse.wheel(0, -90);
      await page.waitForTimeout(230);
      assert.equal(await page.locator("#scene-name").textContent(), "Kenya");

      // Window expansion is visible, Escape cancels, next activation arrives.
      await page.locator("#take-dive").click();
      assert.equal(await page.locator("#dive-overlay").isVisible(), true);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#dive-overlay").isVisible(), false);
      await page.locator("#take-dive").click();
      await page.waitForURL("**/#destination/kenya");
      await page.locator("#arrival-title").waitFor();
      assert.equal(await page.locator("#arrival-title").textContent(), "Kenya");
      await page.reload();
      assert.equal(await page.locator("#arrival-title").textContent(), "Kenya");
      await page.locator(".arrival-copy a").click();
      assert.equal(await page.locator("#destination-page").isVisible(), true);
      await page.locator("#place-enquire").click();
      assert.equal(
        await page.locator("#enquiry-experience").inputValue(),
        "Kenya Wildlife Safari",
      );
      await page.locator("#enquiry-dialog .close-dialog").click();
      await page.goto(`${base}/#home`);
      await page.locator('[data-stop="2"]').click();
      await page
        .locator("#hero")
        .evaluate((hero) =>
          hero.dispatchEvent(
            new WheelEvent("wheel", {
              deltaY: 100,
              bubbles: true,
              cancelable: true,
            }),
          ),
        );
      await page.waitForURL("**/#experiences");

      await page.locator("#view-all").click();
      await page.locator("#experience-search").fill("zzzz-no-match");
      assert.match(
        await page.locator("#collection-results").textContent(),
        /A wish beyond the list/,
      );
      await page.locator("#experience-search").fill("Rwanda");
      assert.equal(await page.locator(".result-card").count(), 1);
      await page.locator(".result-card").click();
      await page.locator("#detail-enquire").click();
      await page.locator("[name=name]").fill("Test Traveller");
      await page.locator("[name=email]").fill("test@example.com");
      await page.locator("#enquiry-form [type=submit]").click();
      const whatsapp = await page
        .locator("#whatsapp-send")
        .getAttribute("href");
      assert.match(whatsapp, /^https:\/\/wa.me\/919769825919\?text=/);
      assert.match(decodeURIComponent(whatsapp), /Test Traveller/);
      assert.match(decodeURIComponent(whatsapp), /Gorillas in Rwanda/);
      await page.locator("#edit-enquiry").click();
      assert.equal(
        await page.locator("[name=name]").inputValue(),
        "Test Traveller",
      );

      // Reduced motion skips the camera animation and never autoplays the video.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(base);
      assert.equal(
        await page.locator("#motion-toggle").getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(
        await page
          .locator(".place-scene.active video")
          .evaluate((video) => video.paused),
        true,
      );
      await page.locator("#take-dive").click();
      await page.waitForURL("**/#destination/maldives");
      assert.equal(await page.locator("#dive-overlay").isVisible(), false);
      assert.equal(
        await page.locator("#arrival-video").evaluate((video) => video.paused),
        true,
      );

      // Phone layout, one swipe / one place, menu and no horizontal overflow.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(base);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      const nav = await page.locator(".place-stops").boundingBox();
      assert.ok(
        nav.y + nav.height < 844,
        "destination controls are above the fold",
      );
      await page.locator("#hero").evaluate((hero) => {
        const start = new Event("touchstart", { bubbles: true });
        Object.defineProperty(start, "touches", {
          value: [{ clientX: 180, clientY: 500 }],
        });
        hero.dispatchEvent(start);
        const end = new Event("touchend", { bubbles: true });
        Object.defineProperty(end, "changedTouches", {
          value: [{ clientX: 180, clientY: 350 }],
        });
        hero.dispatchEvent(end);
      });
      assert.equal(await page.locator("#scene-name").textContent(), "Kenya");
      await page.locator("#menu-button").click();
      assert.equal(await page.locator("#mobile-menu").isVisible(), true);
      await page.locator("#mobile-menu a").first().click();
      assert.equal(await page.locator("#mobile-menu").isVisible(), false);
      await page.setViewportSize({ width: 320, height: 667 });
      await page.goto(base);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );

      // No script: page remains scrollable and WhatsApp remains available.
      const noScript = await browser.newContext({ javaScriptEnabled: false });
      const plain = await noScript.newPage();
      await plain.goto(base);
      assert.equal(await plain.locator(".noscript-note").isVisible(), true);
      await plain.locator("#experiences").scrollIntoViewIfNeeded();
      assert.equal(
        await plain.locator(".footer-links a").first().getAttribute("href"),
        "https://wa.me/919769825919",
      );
      await noScript.close();
      assert.deepEqual(
        errors,
        [],
        "no JavaScript errors or failed asset requests",
      );
      await page.close();
    } finally {
      await browser.close();
    }
  },
);

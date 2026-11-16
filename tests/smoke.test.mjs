import { test } from "node:test";
import { readFile } from "node:fs/promises";
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
// Deterministic playback fixture ONLY; production uses the sourced remote clips.
// This validates media behavior, not availability of the external CDN.
const fixture = await readFile(
  new URL("./fixtures/playback.mp4", import.meta.url),
);
async function stubFootage(page) {
  await page.route("https://videos.pexels.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "video/mp4", body: fixture }),
  );
}
async function enter(page, url) {
  await page.goto(url);
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("js-loading"),
  );
}
async function settled(page) {
  await page.waitForFunction(() => !sceneBusy);
}

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
      await stubFootage(page);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(base);
      assert.equal(await page.locator("#site-loader").isVisible(), true);
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      await page.waitForFunction(
        () =>
          !homeTrailers[0].current.paused &&
          homeTrailers[0].current.currentTime > 0.1,
      );
      assert.equal(
        await page.locator("#motion-toggle").getAttribute("aria-pressed"),
        "false",
      );
      await page.locator("#take-dive").waitFor();
      // Preserve the supplied cabin homepage; remove only the later plane film.
      assert.equal(await page.locator("#cabin-photograph").isVisible(), true);
      assert.equal(
        await page.locator("#cabin-photograph").getAttribute("src"),
        "assets/img/cabin.webp",
      );
      assert.match(
        await page.locator("#hero-title").textContent(),
        /A different/,
      );
      assert.equal(
        await page.locator("#explore-window, .explore-copy").count(),
        0,
      );

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
      await settled(page);
      assert.equal(await page.locator("#scene-name").textContent(), "Kenya");
      await page.waitForTimeout(230);
      await settled(page);
      await page.mouse.move(450, 450);
      await page.mouse.wheel(0, 90);
      await page.waitForTimeout(230);
      await settled(page);
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "Antarctica",
      );
      await page.mouse.wheel(0, -90);
      await page.waitForTimeout(230);
      await settled(page);
      assert.equal(await page.locator("#scene-name").textContent(), "Kenya");

      // Window expansion is visible, Escape cancels, next activation arrives.
      await page.locator("#take-dive").click();
      assert.equal(await page.locator("#dive-overlay").isVisible(), true);
      assert.equal(
        await page.locator("#dive-overlay .cabin-photograph").count(),
        1,
      );
      assert.equal(await page.locator("#dive-overlay .place-scene").count(), 1);
      const zoomOrigin = await page.evaluate(() => cabinWindowGeometry());
      assert.ok(zoomOrigin.x > 0 && zoomOrigin.x < 1440);
      assert.ok(zoomOrigin.y > 0 && zoomOrigin.y < 1000);

      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#dive-overlay").isVisible(), false);
      await page.locator("#take-dive").click();
      await page.waitForURL("**/#destination/kenya");
      await page.locator("#arrival-title").waitFor();
      assert.equal(await page.locator("#arrival-title").textContent(), "Kenya");
      await page.reload();
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      assert.equal(await page.locator("#arrival-title").textContent(), "Kenya");
      await page.locator(".arrival-copy a").click();
      assert.equal(await page.locator("#destination-page").isVisible(), true);
      await page.locator("#place-enquire").click();
      assert.equal(
        await page.locator("#enquiry-experience").inputValue(),
        "Kenya Wildlife Safari",
      );
      await page.locator("#enquiry-dialog .close-dialog").click();
      await enter(page, `${base}/#home`);
      await page.locator('[data-stop="2"]').click();
      await settled(page);
      await page.locator("#hero").evaluate((hero) =>
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

      await enter(page, base);
      await page.waitForFunction(
        () => homeTrailers[0].videos[1].readyState >= 2,
      );
      await page.evaluate(() => {
        homeTrailers[0].current.currentTime = 7.95;
      });
      await page.waitForFunction(
        () => homeTrailers[0].clip === 1 && !homeTrailers[0].switching,
      );
      assert.equal(
        await page.locator('[data-scene="0"] .trailer-front').count(),
        1,
      );
      await page.locator("#motion-toggle").click();
      assert.equal(
        await page.evaluate(() =>
          homeTrailers.every((t) => t.videos.every((v) => v.paused)),
        ),
        true,
      );
      await page.locator("#motion-toggle").click();
      await page.waitForFunction(() => !homeTrailers[0].current.paused);
      await page.locator('[data-stop="1"]').click();
      await settled(page);
      assert.equal(
        await page.evaluate(() =>
          homeTrailers[0].videos.every((v) => v.paused),
        ),
        true,
      );
      assert.equal(
        await page.evaluate(() => homeTrailers[1].current.paused),
        false,
      );

      // Reduced motion skips the camera animation and never autoplays the video.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await enter(page, base);
      assert.equal(
        await page.locator("#motion-toggle").getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(
        await page
          .locator(".place-scene.active video.trailer-front")
          .evaluate((video) => video.paused),
        true,
      );
      await page.locator("#take-dive").click();
      await page.waitForURL("**/#destination/maldives");
      await page.waitForFunction(
        () => activeDestination?.slug === "maldives" && arrivalTrailer,
      );
      assert.equal(await page.locator("#dive-overlay").isVisible(), false);
      assert.equal(
        await page.evaluate(() => arrivalTrailer.current.paused),
        true,
      );

      // Phone layout, one swipe / one place, menu and no horizontal overflow.
      await page.setViewportSize({ width: 390, height: 844 });
      await enter(page, base);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      const nav = await page.locator(".cabin-stops").boundingBox();
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
      await settled(page);
      assert.equal(await page.locator("#scene-name").textContent(), "Kenya");
      await page.locator("#menu-button").click();
      assert.equal(await page.locator("#mobile-menu").isVisible(), true);
      await page.locator("#mobile-menu a").first().click();
      assert.equal(await page.locator("#mobile-menu").isVisible(), false);
      await page.setViewportSize({ width: 320, height: 667 });
      await enter(page, base);
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

test(
  "loader fail-open, blocked autoplay, failed footage and interrupted transitions",
  { timeout: 90000 },
  async () => {
    const browser = await chromium.launch({
      executablePath,
      args: Chromium.args.filter((arg) => arg !== "--single-process"),
      env,
      headless: true,
    });
    try {
      // A CDN error must show a retry control, never strand the intro or navigation.
      const broken = await browser.newPage();
      const errors = [];
      broken.on("pageerror", (error) => errors.push(error.message));
      await broken.route("https://videos.pexels.com/**", (route) =>
        route.abort(),
      );
      await enter(broken, base);
      await broken.waitForFunction(() => homeTrailers[0].state === "error");
      assert.match(
        await broken.locator("#motion-toggle").textContent(),
        /Retry/,
      );
      await broken.locator('[data-stop="1"]').click();
      await settled(broken);
      assert.equal(await broken.locator("#scene-name").textContent(), "Kenya");
      await stubFootage(broken);
      await broken.locator("#motion-toggle").click();
      await broken.waitForFunction(
        () =>
          !homeTrailers[1].current.paused &&
          homeTrailers[1].current.readyState >= 2,
      );

      // Explicit play retries when the browser initially refuses autoplay.
      const blocked = await browser.newPage();
      await stubFootage(blocked);
      await blocked.addInitScript(() => {
        const original = HTMLMediaElement.prototype.play;
        window.allowTestPlayback = false;
        HTMLMediaElement.prototype.play = function () {
          return window.allowTestPlayback
            ? original.call(this)
            : Promise.reject(
                new DOMException("Autoplay blocked", "NotAllowedError"),
              );
        };
      });
      await enter(blocked, base);
      await blocked.waitForFunction(() => homeTrailers[0].state === "blocked");
      assert.match(
        await blocked.locator("#motion-toggle").textContent(),
        /Play video/,
      );
      await blocked.evaluate(() => {
        window.allowTestPlayback = true;
      });
      await blocked.locator("#motion-toggle").click();
      await blocked.waitForFunction(
        () =>
          !homeTrailers[0].current.paused &&
          homeTrailers[0].state === "playing",
      );

      // The opening remains escapable even when the main app does not load.
      const noApp = await browser.newPage();
      await noApp.route("**/assets/js/main.js", (route) => route.abort());
      await noApp.goto(base);
      assert.equal(await noApp.locator("#site-loader").isVisible(), true);
      await noApp.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
        null,
        { timeout: 10000 },
      );
      assert.equal(await noApp.locator("[data-loader-inert]").count(), 0);
      await noApp.reload();
      await noApp.locator("#skip-intro").click();
      await noApp.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      assert.equal(
        await noApp.locator("#hero").evaluate((el) => el.inert),
        false,
      );

      // A newer button request wins; navigating away cancels all pending changes.
      await broken.locator('[data-stop="0"]').click();
      await broken.locator('[data-stop="2"]').click();
      await broken.waitForFunction(() => !sceneBusy && scene === 2);
      assert.equal(
        await broken.locator("#scene-name").textContent(),
        "Antarctica",
      );
      await broken.locator('[data-stop="1"]').click();
      await broken.evaluate(() => {
        location.hash = "experiences";
      });
      await broken.waitForFunction(() => !sceneBusy);
      await broken.waitForTimeout(1300);
      assert.equal(await broken.locator("#take-dive").isDisabled(), false);
      assert.equal(await broken.locator(".scene-changing").count(), 0);
      assert.deepEqual(errors, []);
      await broken.close();
      await blocked.close();
      await noApp.close();
    } finally {
      await browser.close();
    }
  },
);

test(
  "window-seat composition and aperture clipping survive resizing and the dive",
  { timeout: 60000 },
  async () => {
    const browser = await chromium.launch({
      executablePath,
      args: Chromium.args.filter((arg) => arg !== "--single-process"),
      env,
      headless: true,
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
      });
      await stubFootage(page);
      await enter(page, base);
      for (const [width, height] of [
        [1440, 900],
        [390, 844],
        [320, 667],
        [900, 600],
        [1920, 1080],
      ]) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(80);
        const frame = await page.evaluate(() => {
          const stage = document.querySelector("#cabin-view");
          const video = homeTrailers[0].current;
          const window = cabinWindowGeometry();
          const left = parseFloat(video.style.left),
            top = parseFloat(video.style.top);
          const width = parseFloat(video.style.width),
            height = parseFloat(video.style.height);
          return {
            window,
            left,
            top,
            width,
            height,
            centerX: left + width / 2,
            centerY: top + height / 2,
            mask: getComputedStyle(document.querySelector("#flight-portal"))
              .maskImage,
            photoPosition: getComputedStyle(
              document.querySelector("#cabin-photograph"),
            ).objectPosition,
            maskPosition: getComputedStyle(
              document.querySelector("#flight-portal"),
            ).maskPosition,
          };
        });
        assert.ok(
          Math.abs(frame.centerX - frame.window.x) < 0.1,
          "shot center belongs in the main window",
        );
        assert.ok(Math.abs(frame.centerY - frame.window.y) < 0.1);
        assert.ok(
          Math.abs(frame.width / frame.height - 16 / 9) < 0.001,
          "no video stretch",
        );
        assert.ok(
          frame.left <= frame.window.bounds.left &&
            frame.left + frame.width >= frame.window.bounds.right,
        );
        assert.ok(
          frame.top <= frame.window.bounds.top &&
            frame.top + frame.height >= frame.window.bounds.bottom,
        );
        assert.match(frame.mask, /cabin-window-mask.png/);
        assert.equal(frame.maskPosition, frame.photoPosition);
      }
      await page.evaluate(() =>
        homeTrailers[0].assign(homeTrailers[0].current, {
          ...TRAILERS.maldives.clips[0],
          windowFocus: { x: 0.35, y: 0.45 },
        }),
      );
      assert.equal(
        await page.evaluate(() => {
          const video = homeTrailers[0].current,
            window = cabinWindowGeometry();
          return (
            Math.abs(
              parseFloat(video.style.left) +
                parseFloat(video.style.width) * 0.35 -
                window.x,
            ) < 0.1 &&
            Math.abs(
              parseFloat(video.style.top) +
                parseFloat(video.style.height) * 0.45 -
                window.y,
            ) < 0.1
          );
        }),
        true,
        "shot-specific focus supported",
      );

      // Remove the cabin photo in this diagnostic only. The media layer must
      // still NOT paint onto seats/walls: masking must work independently.
      const diagnostic = await page.addStyleTag({
        content: `
      .cabin-view { background:#000!important; }
      .cabin-photograph, .cabin-interior-shade, .header,
      .cabin-stage > :not(.cabin-view) { visibility:hidden!important; }
      .cabin-outside video { display:none!important; }
      .cabin-outside .place-scene { background:rgb(255,0,0)!important; }
    `,
      });
      for (const [width, height] of [
        [1440, 900],
        [390, 844],
      ]) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(100);
        const png = await page.locator("#cabin-view").screenshot();
        const samples = await page.evaluate(async (data) => {
          const image = new Image();
          image.src = "data:image/png;base64," + data;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0);
          const scale = Math.max(image.width / 1376, image.height / 768);
          const ox =
              (image.width - 1376 * scale) * (image.width <= 760 ? 0.68 : 0.5),
            oy = (image.height - 768 * scale) * 0.5;
          return [
            [923, 430, true],
            [1300, 430, true],
            [800, 430, false],
            [1020, 430, false],
            [923, 270, false],
            [923, 590, false],
          ]
            .map(([x, y, inside]) => [
              Math.round(x * scale + ox),
              Math.round(y * scale + oy),
              inside,
            ])
            .filter(
              ([x, y]) =>
                x >= 0 && x < image.width && y >= 0 && y < image.height,
            )
            .map(([x, y, inside]) => ({
              inside,
              pixel: [...ctx.getImageData(x, y, 1, 1).data],
            }));
        }, png.toString("base64"));
        assert.ok(samples.some((s) => s.inside));
        for (const { inside, pixel } of samples) {
          assert.equal(
            pixel[0] > 240 && pixel[1] < 10,
            inside,
            "only the physical glass reveals the red test media",
          );
        }
      }
      await diagnostic.evaluate((el) => el.remove());
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.locator("#take-dive").click();
      assert.equal(
        await page
          .locator("#dive-overlay .cabin-outside")
          .evaluate((el) =>
            getComputedStyle(el).maskImage.includes("cabin-window-mask.png"),
          ),
        true,
      );
      assert.equal(
        await page
          .locator("#dive-overlay video")
          .evaluate((video) => parseFloat(video.style.width) > 0),
        true,
      );
      await page.waitForURL("**/#destination/maldives");
      await page.waitForFunction(() => arrivalTrailer?.current.readyState >= 2);
      assert.equal(
        await page
          .locator("#arrival-trailer")
          .evaluate((el) => getComputedStyle(el).maskImage),
        "none",
      );
      assert.equal(
        await page
          .locator("#arrival-video")
          .evaluate((video) => video.style.width),
        "",
        "arrival remains full-bleed, not window-cropped",
      );
      await page.close();
    } finally {
      await browser.close();
    }
  },
);

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
async function fulfillMedia(route, body) {
  const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range || "");
  if (!range)
    return route.fulfill({
      status: 200,
      contentType: "video/mp4",
      headers: {
        "accept-ranges": "bytes",
        "content-length": String(body.length),
      },
      body,
    });
  const start = Number(range[1]),
    end = range[2]
      ? Math.min(Number(range[2]), body.length - 1)
      : body.length - 1;
  return route.fulfill({
    status: 206,
    contentType: "video/mp4",
    headers: {
      "accept-ranges": "bytes",
      "content-range": `bytes ${start}-${end}/${body.length}`,
      "content-length": String(end - start + 1),
    },
    body: body.subarray(start, end + 1),
  });
}
async function stubFootage(page) {
  await page.route("https://videos.pexels.com/**", (route) =>
    fulfillMedia(route, fixture),
  );
}
async function enter(page, url) {
  await page.goto(url);
  if (await page.locator("#site-loader").isVisible())
    await page.locator("#skip-intro").click();
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
      await page.locator("#skip-intro").click();
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
        "Explore Antarctica",
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
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "Kenya Wildlife Safari",
      );
      await page.waitForTimeout(230);
      await settled(page);
      await page.mouse.move(450, 450);
      await page.mouse.wheel(0, 90);
      await page.waitForTimeout(230);
      await settled(page);
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "Sleep underwater",
      );
      await page.mouse.wheel(0, -90);
      await page.waitForTimeout(230);
      await settled(page);
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "Kenya Wildlife Safari",
      );

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
      await page.waitForURL("**/#experience/kenya");
      await page.locator("#arrival-title").waitFor();
      assert.equal(
        await page.locator("#arrival-title").textContent(),
        "Kenya Wildlife Safari",
      );
      await page.reload();
      await page.locator("#skip-intro").click();
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      assert.equal(
        await page.locator("#arrival-title").textContent(),
        "Kenya Wildlife Safari",
      );
      await page.locator(".arrival-copy a").click();
      assert.equal(await page.locator("#destination-page").isVisible(), true);
      await page.locator("#place-enquire").click();
      assert.equal(
        await page.locator("#enquiry-experience").inputValue(),
        "Kenya Wildlife Safari",
      );
      await page.locator("#enquiry-dialog .close-dialog").click();
      await enter(page, `${base}/#home`);
      await page.locator("#journey-select").selectOption("21");
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
        await page.locator('[data-scene="0"] video.trailer-front').count(),
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
      await page.locator("#journey-select").selectOption("1");
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
      await page.waitForURL("**/#experience/antarctica");
      await page.waitForFunction(
        () => activeDestination?.slug === "antarctica" && arrivalTrailer,
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
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "Kenya Wildlife Safari",
      );
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
      await broken.locator("#journey-select").selectOption("1");
      await settled(broken);
      assert.equal(
        await broken.locator("#scene-name").textContent(),
        "Explore Antarctica",
      );
      assert.match(
        await broken.locator("#scene-load-status").textContent(),
        /Keeping your current view/,
      );
      await stubFootage(broken);
      await broken.locator("#journey-select").selectOption("1");
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
        homeTrailers[0].current.dispatchEvent(new Event("canplay"));
        homeTrailers[0].current.dispatchEvent(new Event("waiting"));
      });
      assert.equal(
        await blocked.evaluate(() => homeTrailers[0].state),
        "blocked",
      );
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
      await broken.locator("#journey-select").selectOption("0");
      await broken.locator("#journey-select").selectOption("2");
      await broken.waitForFunction(() => !sceneBusy && scene === 2);
      assert.equal(
        await broken.locator("#scene-name").textContent(),
        "Sleep underwater",
      );
      await broken.locator("#journey-select").selectOption("1");
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
          frame.left >= frame.window.x - frame.window.width / 2 &&
            frame.left + frame.width <= frame.window.x + frame.window.width / 2,
        );
        assert.ok(
          frame.top >= frame.window.y - frame.window.height / 2 &&
            frame.top + frame.height <=
              frame.window.y + frame.window.height / 2,
        );
        assert.match(frame.mask, /cabin-window-mask.png/);
        assert.equal(frame.maskPosition, frame.photoPosition);
      }
      assert.equal(
        await page.evaluate(() => {
          const stage = document.querySelector("#cabin-view"),
            g = CabinViewport.geometry(stage);
          return [16 / 9, 9 / 16, 4 / 3].every((aspect) => {
            const rect = CabinViewport.subjectRect(stage, aspect);
            return (
              Math.abs(rect.width / rect.height - aspect) < 0.001 &&
              rect.width <= g.width &&
              rect.height <= g.height * 0.66
            );
          });
        }),
        true,
        "landscape and portrait sources fit wholly inside the main glass",
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
      await page.waitForURL("**/#experience/antarctica");
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

test(
  "welcome choices, opt-in music and on-demand films for all 22 experiences",
  { timeout: 180000 },
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
      });
      await stubFootage(page);
      const errors = [],
        mediaRequests = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("request", (request) => {
        if (request.url().includes("videos.pexels.com"))
          mediaRequests.push(request.url());
      });
      await page.goto(base);
      assert.equal(await page.locator("#intro-video").isChecked(), true);
      assert.equal(
        await page.evaluate(() => RareWishMusic.state),
        "uninitialized",
      );
      // A healthy app never races past an unanswered music choice.
      await page.waitForTimeout(7300);
      assert.equal(await page.locator("#site-loader").isVisible(), true);
      assert.equal(mediaRequests.length, 0);
      await page.locator("#intro-video").uncheck();
      await page.locator("#skip-intro").click();
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      assert.equal(
        await page.evaluate(() => RareWishMusic.state),
        "uninitialized",
      );
      assert.equal(mediaRequests.length, 0);
      await page.evaluate(() => openExperience("polo"));
      assert.equal(
        await page.locator("#detail-video").getAttribute("src"),
        null,
      );
      await page.locator("#detail-motion-toggle").click();
      await page.waitForFunction(() => experienceTrailer.state === "playing");
      assert.equal(
        await page.locator("#detail-video").evaluate((v) => v.style.objectFit),
        "contain",
      );
      assert.equal(mediaRequests.length, 1); // One source, no unnecessary second buffer.
      await page.locator("#experience-dialog .close-dialog").click();
      await page.waitForFunction(() => experienceTrailer === null);
      assert.equal(
        await page.locator("#detail-video").getAttribute("src"),
        null,
      );

      // Opt-in is a new gesture on every full page visit; no saved sound consent.
      await page.reload();
      assert.equal(
        await page.evaluate(() => RareWishMusic.state),
        "uninitialized",
      );
      await page.locator("#enter-with-music").click();
      await page.waitForFunction(
        () => RareWishMusic.enabled && RareWishMusic.state === "running",
      );
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      await page.locator(".music-control").click();
      await page.waitForFunction(
        () => !RareWishMusic.enabled && RareWishMusic.state === "suspended",
      );
      await page.locator(".music-control").click();
      await page.waitForFunction(
        () => RareWishMusic.enabled && RareWishMusic.state === "running",
      );
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          value: true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForFunction(
        () =>
          RareWishMusic.state === "suspended" &&
          homeTrailers.every((t) => t.current.paused),
      );
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          value: false,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForFunction(() => RareWishMusic.state === "running");

      const ids = await page.evaluate(() => experiences.map((e) => e.id));
      assert.equal(ids.length, 22);
      assert.deepEqual(
        await page.evaluate(() => Object.keys(EXPERIENCE_FILMS).sort()),
        [...ids].sort(),
      );
      for (const id of ids) {
        await page.evaluate((id) => openExperience(id), id);
        await page.waitForFunction(
          (id) =>
            experienceTrailer?.slug === id &&
            experienceTrailer.state === "playing",
          id,
        );
        assert.equal(
          await page.evaluate(() =>
            homeTrailers.every((t) => t.current.paused),
          ),
          true,
        );
        assert.equal(
          await page.evaluate(
            () =>
              experienceTrailer.current.muted &&
              experienceTrailer.current.playsInline,
          ),
          true,
        );
        assert.ok(
          (await page.locator("#detail-film-note").textContent()).length > 40,
        );
        await page.locator("#detail-motion-toggle").click();
        assert.equal(
          await page.evaluate(() => experienceTrailer.current.paused),
          true,
        );
        await page.locator("#detail-motion-toggle").click();
        await page.waitForFunction(() => !experienceTrailer.current.paused);
        await page.keyboard.press("Escape");
        await page.waitForFunction(() => experienceTrailer === null);
        assert.equal(await page.locator("#detail-trailer video").count(), 1);
        assert.equal(
          await page.locator("#detail-video").getAttribute("src"),
          null,
        );
      }
      await page.evaluate(() => openExperience("diamond"));
      await page.locator("#detail-enquire").click();
      await page.waitForFunction(() => experienceTrailer === null);
      assert.equal(
        await page.locator("#enquiry-dialog").evaluate((d) => d.open),
        true,
      );
      assert.equal(
        await page.locator("#detail-video").getAttribute("src"),
        null,
      );
      assert.deepEqual(errors, []);

      // Reduced motion is a safe default, but explicit welcome opt-in enables footage.
      const mobile = await browser.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
      });
      await stubFootage(mobile);
      await mobile.goto(base);
      assert.equal(await mobile.locator("#intro-video").isChecked(), false);
      await mobile.locator("#intro-video").check();
      await mobile.locator("#skip-intro").click();
      await mobile.waitForFunction(() => homeTrailers[0].state === "playing");
      await mobile.evaluate(() => openExperience("underwater"));
      await mobile.waitForFunction(() => experienceTrailer.state === "playing");
      assert.equal(
        await mobile.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.equal(
        await mobile
          .locator("#experience-dialog")
          .evaluate((d) => d.scrollWidth <= d.clientWidth),
        true,
      );

      // Media and audio failures are explicit, recoverable, and never lock entry.
      const broken = await browser.newPage();
      await broken.route("https://videos.pexels.com/**", (route) =>
        route.abort(),
      );
      await broken.addInitScript(() => {
        window.AudioContext = class {
          constructor() {
            throw new Error("Unavailable");
          }
        };
      });
      await broken.goto(base);
      await broken.locator("#enter-with-music").click();
      await broken.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      assert.equal(await broken.evaluate(() => RareWishMusic.enabled), false);
      assert.match(
        await broken.locator(".music-control").textContent(),
        /unavailable/,
      );
      await broken.evaluate(() => openExperience("wellness"));
      await broken.waitForFunction(() => experienceTrailer.state === "error");
      assert.match(
        await broken.locator("#detail-motion-toggle").textContent(),
        /Retry/,
      );
      await stubFootage(broken);
      await broken.locator("#detail-motion-toggle").click();
      await broken.waitForFunction(() => experienceTrailer.state === "playing");
    } finally {
      await browser.close();
    }
  },
);

test(
  "all 22 cabin films start in Antarctica, stay lazy, and dive into matching experiences",
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
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
      });
      const requests = [],
        errors = [];
      page.on("request", (request) => {
        if (request.url().includes("videos.pexels.com"))
          requests.push(request.url());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await stubFootage(page);
      await page.goto(base);
      assert.equal(requests.length, 0);
      assert.equal(
        await page.locator("#scene-name").textContent(),
        "Explore Antarctica",
      );
      assert.equal(await page.locator("#journey-select option").count(), 22);
      assert.equal(
        await page.locator("#flight-portal [data-scene]").count(),
        22,
      );
      await page.locator("#intro-video").check();
      await page.locator("#skip-intro").click();
      await page.waitForFunction(() => homeTrailers[0].state === "playing");
      assert.equal(
        requests.length,
        2,
        "only the opening Antarctic shots are requested",
      );
      assert.equal(await page.locator("#journey-prev").isDisabled(), true);
      assert.deepEqual(
        await page.evaluate(() => cabinExperiences.map((p) => p.slug).sort()),
        await page.evaluate(() => experiences.map((p) => p.id).sort()),
      );
      const stops = await page.evaluate(() =>
        cabinExperiences.map((p) => ({
          id: p.slug,
          title: p.name,
          clips: p.film.clips.map((c) => c.src),
        })),
      );
      for (const [index, stop] of stops.entries()) {
        await page.locator("#journey-select").selectOption(String(index));
        await page.waitForFunction(
          (index) => homeTrailers[index].state === "playing",
          index,
        );
        assert.equal(
          await page.locator("#scene-name").textContent(),
          stop.title,
        );
        assert.equal(
          await page.locator("#scene-number").textContent(),
          String(index + 1).padStart(2, "0"),
        );
        assert.deepEqual(
          await page.evaluate(
            (index) => homeTrailers[index].clips.map((c) => c.src),
            index,
          ),
          stop.clips,
        );
        assert.equal(
          await page.evaluate(
            (index) =>
              homeTrailers.every(
                (p, i) =>
                  i === index || p.videos.every((v) => !v.hasAttribute("src")),
              ),
            index,
          ),
          true,
        );
        assert.ok(
          Math.abs(
            (await page
              .locator("#flight-track-fill")
              .evaluate((e) => parseFloat(e.style.width))) -
              (index / 21) * 100,
          ) < 0.001,
        );
        await page.locator("#take-dive").click();
        await page.waitForURL(`**/#experience/${stop.id}`);
        await page.waitForFunction(
          (id) =>
            activeDestination?.slug === id &&
            arrivalTrailer?.state === "playing",
          stop.id,
        );
        assert.equal(
          await page.locator("#arrival-title").textContent(),
          stop.title,
        );
        assert.deepEqual(
          await page.evaluate(() => arrivalTrailer.clips.map((c) => c.src)),
          stop.clips,
        );
        assert.equal(
          await page.evaluate(() =>
            homeTrailers.every((p) =>
              p.videos.every((v) => !v.hasAttribute("src")),
            ),
          ),
          true,
        );
        assert.equal(
          await page.locator("#place-enquire").getAttribute("data-enquire"),
          stop.title,
        );
        assert.match(
          await page.locator("#arrival-film-note").textContent(),
          /ILLUSTRATIVE FILM/,
        );
        await page.locator(".arrival-back").click();
        await page.waitForURL("**/#home");
        await page.waitForFunction(() => !activeDestination);
        assert.equal(
          await page.locator("#journey-select").inputValue(),
          String(index),
        );
      }
      assert.equal(await page.locator("#journey-next").isDisabled(), true);
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

      // New deep links survive reload; old destination links still resolve.
      await enter(page, `${base}/#experience/polo`);
      assert.equal(
        await page.locator("#arrival-title").textContent(),
        "Learn polo like the kings",
      );
      await page.reload();
      await page.locator("#skip-intro").click();
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      assert.equal(
        await page.locator("#arrival-title").textContent(),
        "Learn polo like the kings",
      );
      await enter(page, `${base}/#destination/maldives`);
      assert.equal(
        await page.locator("#arrival-title").textContent(),
        "The Maldives",
      );

      // Long labels fit narrow layouts; film notes remain accessible from the cabin.
      await page.setViewportSize({ width: 320, height: 667 });
      await enter(page, `${base}/#home`);
      await page.locator("#journey-select").selectOption("21");
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      const picker = await page.locator(".cabin-stops").boundingBox();
      const dive = await page.locator("#take-dive").boundingBox();
      const music = await page.locator(".music-control").boundingBox();
      assert.ok(
        picker.y >= dive.y + dive.height && picker.y + picker.height <= 667,
      );
      assert.ok(
        music.y + music.height < picker.y,
        "music never covers the picker or next arrow",
      );
      await page.locator("#cabin-film-notes").click();
      assert.equal(
        await page.locator("#detail-title").textContent(),
        "Journey to the centre of the earth",
      );
      await page.keyboard.press("Escape");
      await page.locator("#take-dive").click();
      await page.waitForURL("**/#experience/earth");
      await page.locator("#arrival-title").waitFor({ state: "visible" });
      const title = await page.locator("#arrival-title").boundingBox();
      assert.ok(title.y >= 70 && title.x + title.width <= 320);
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test(
  "non-black film previews, distinct films, mobile crop, restored music and WhatsApp focus",
  { timeout: 90000 },
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
      });
      await stubFootage(page);
      await page.addInitScript(() => {
        window.testFrequencies = [];
        const original = AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator = function () {
          const oscillator = original.call(this),
            start = oscillator.start.bind(oscillator);
          oscillator.start = (...args) => {
            window.testFrequencies.push(oscillator.frequency.value);
            start(...args);
          };
          return oscillator;
        };
      });
      await page.goto(base);
      await page.locator("#enter-with-music").click();
      await page.waitForFunction(() => homeTrailers[0].state === "playing");
      assert.equal(await page.locator("video[poster]").count(), 0);
      assert.equal(
        await page
          .locator("#detail-image, #place-image, .experience-card img")
          .count(),
        0,
      );
      const style = await page.locator("#window-glass-label").evaluate((el) => {
        const css = getComputedStyle(el);
        return {
          background: css.backgroundImage,
          color: css.backgroundColor,
          border: css.borderTopWidth,
          shadow: css.boxShadow,
        };
      });
      assert.deepEqual(style, {
        background: "none",
        color: "rgba(0, 0, 0, 0)",
        border: "0px",
        shadow: "none",
      });
      const frequencies = await page.evaluate(() => testFrequencies);
      assert.ok(frequencies.length >= 3);
      assert.ok(
        frequencies.every((f) => f >= 146 && f <= 441),
        "the original sustained ambient register is restored",
      );
      assert.notEqual(
        await page.evaluate(() => EXPERIENCE_FILMS.diamond.clips[0].src),
        await page.evaluate(() => EXPERIENCE_FILMS.piaget.clips[0].src),
      );
      assert.match(
        await page.evaluate(() => EXPERIENCE_FILMS.ponies.clips[0].src),
        /14915401/,
      );

      // Preparation decodes the opening frame without playing it behind another scene.
      await page.evaluate(async () => {
        await homeTrailers[7].prepare();
      });
      assert.equal(
        await page.evaluate(() => homeTrailers[7].current.paused),
        true,
      );
      assert.ok(
        await page.evaluate(
          () =>
            homeTrailers[7].current.currentTime < 0.1 &&
            homeTrailers[7].current.readyState >= 2,
        ),
      );
      await page.evaluate(() => homeTrailers[7].unload());

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(100);
      const framing = await page.evaluate(() => {
        const stage = document.querySelector("#cabin-view"),
          g = CabinViewport.geometry(stage);
        const scale = Math.max(
          stage.clientWidth / 1376,
          stage.clientHeight / 768,
        );
        const offset = (stage.clientWidth - 1376 * scale) * 0.68;
        return {
          right: g.bounds.right,
          viewport: stage.clientWidth,
          width: parseFloat(homeTrailers[0].current.style.width),
          oldRightOverscan: (1376 * scale + offset - g.x + 2) * 2,
        };
      });
      assert.ok(framing.right <= framing.viewport);
      assert.ok(
        framing.width < framing.oldRightOverscan,
        "off-screen second window no longer enlarges the primary subject",
      );
      const contact = page.locator(".header .whatsapp-primary");
      assert.equal(
        await contact.getAttribute("href"),
        "https://wa.me/919769825919",
      );
      assert.equal(await contact.getAttribute("target"), "_blank");
      await page.keyboard.press("Tab");
      await contact.focus();
      assert.equal(
        await contact.evaluate((el) => getComputedStyle(el).outlineStyle),
        "solid",
      );

      await page.setViewportSize({ width: 1440, height: 900 });
      await page.evaluate(() => openCollection());
      await page.locator("#experience-search").fill("Piaget");
      const thumb = page.locator("#collection-results video");
      await page.waitForFunction(
        () =>
          document.querySelector("#collection-results video")?.dataset.ready ===
          "true",
      );
      assert.equal(await thumb.evaluate((v) => v.paused), true);
      assert.ok(await thumb.evaluate((v) => v.currentTime < 0.1));
      assert.match(await thumb.getAttribute("src"), /6262806/);
      assert.equal(await page.locator("#collection-results img").count(), 0);
      await page.locator("#experience-search").fill("Diamond");
      await page.waitForFunction(
        () =>
          document.querySelector("#collection-results video")?.dataset.ready ===
          "true",
      );
      assert.match(await thumb.getAttribute("src"), /4004214/);
      await page.locator("#collection-dialog .close-dialog").click();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("#collection-results video")].every(
          (v) => !v.hasAttribute("src"),
        ),
      );

      // Disabling video also prevents the new thumbnail system from fetching clips.
      const silent = await browser.newPage();
      const requests = [];
      await stubFootage(silent);
      silent.on("request", (request) => {
        if (request.url().includes("videos.pexels.com"))
          requests.push(request.url());
      });
      await silent.goto(base);
      await silent.locator("#intro-video").uncheck();
      await silent.locator("#skip-intro").click();
      await silent.waitForFunction(
        () => !document.documentElement.classList.contains("js-loading"),
      );
      await silent.evaluate(() => openCollection());
      await silent.waitForTimeout(300);
      assert.equal(requests.length, 0);
      assert.equal(await silent.locator("video[poster]").count(), 0);
    } finally {
      await browser.close();
    }
  },
);

test(
  "black-frame rejection, slow-load blending, all-window safe fit and hover wheel navigation",
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
        viewport: { width: 1440, height: 900 },
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const blackOpening = await readFile(
        new URL("./fixtures/black-opening.mp4", import.meta.url),
      );
      const blackOnly = await readFile(
        new URL("./fixtures/black-only.mp4", import.meta.url),
      );
      await page.route("https://videos.pexels.com/**", (route) =>
        fulfillMedia(route, blackOpening),
      );
      await enter(page, base);
      await page.waitForFunction(() => homeTrailers[0].state === "playing");
      assert.ok(
        await page.evaluate(
          () => Number(homeTrailers[0].current.dataset.previewTime) >= 1,
        ),
        "skip the genuinely black opening second",
      );
      assert.equal(
        await page.evaluate(() => FilmFrames.inspect(homeTrailers[0].current)),
        true,
      );
      assert.equal(await page.locator("#wild-story").count(), 0);
      assert.equal(
        await page.evaluate(() =>
          cabinExperiences.some((p) => p.slug === "kenya"),
        ),
        true,
      );

      const nextURL = await page.evaluate(() => homeTrailers[1].clips[0].src);
      let release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      await page.route(nextURL, async (route) => {
        await gate;
        await fulfillMedia(route, blackOpening);
      });
      await page.locator("#journey-select").selectOption("1");
      await page.waitForTimeout(2600); // Longer than the removed 2.2-second readiness race.
      assert.equal(await page.evaluate(() => scene), 0);
      assert.equal(
        await page
          .locator('[data-scene="0"]')
          .evaluate((el) => getComputedStyle(el).opacity),
        "1",
      );
      assert.ok(
        await page.evaluate(
          () => homeTrailers[0].current._windowCanvas.width > 0,
        ),
      );
      release();
      await page.waitForFunction(() => scene === 1 && sceneBusy);
      assert.equal(
        await page
          .locator('[data-scene="0"]')
          .evaluate((el) => getComputedStyle(el).opacity),
        "1",
        "opaque old frame beneath the incoming fade",
      );
      assert.equal(
        await page.evaluate(() => homeTrailers[1].current.dataset.frameReady),
        "true",
      );
      await settled(page);
      await page.evaluate(() => homeTrailers[1].next());
      await page.waitForFunction(() => !homeTrailers[1].switching);
      assert.ok(
        await page.evaluate(() => homeTrailers[1].current.currentTime >= 1),
        "internal shot dissolve never seeks back to black time zero",
      );

      // This is synthetic geometry verification, NOT a visual audit of the CDN films.
      for (const [width, height] of [
        [1440, 900],
        [390, 844],
      ]) {
        await page.setViewportSize({ width, height });
        for (let index = 0; index < 22; index++) {
          await page.evaluate(async (index) => {
            await selectScene(index, false);
            homeTrailers[index].setEnabled(false);
            CabinViewport.paint(homeTrailers[index].current);
          }, index);
          const result = await page.evaluate((index) => {
            const v = homeTrailers[index].current,
              c = v._windowCanvas;
            const stage = document.querySelector("#cabin-view"),
              g = CabinViewport.geometry(stage);
            const safe = CabinViewport.subjectRect(
              stage,
              v.videoWidth / v.videoHeight,
            );
            const ratio = c.width / (g.bounds.right - g.bounds.left);
            const sample = (fraction) => [
              ...c
                .getContext("2d")
                .getImageData(
                  Math.round(
                    (safe.left + safe.width * fraction - g.bounds.left) * ratio,
                  ),
                  Math.round(
                    (safe.top + safe.height * 0.5 - g.bounds.top) * ratio,
                  ),
                  1,
                  1,
                ).data,
            ];
            return {
              left: sample(0.09),
              right: sample(0.91),
              ready: v.dataset.frameReady,
              inside:
                safe.left >= g.bounds.left &&
                safe.left + safe.width <= g.bounds.right,
            };
          }, index);
          assert.equal(result.ready, "true");
          assert.equal(result.inside, true);
          assert.ok(
            result.left[0] > 180 && result.left[2] < 60,
            `left-edge subject visible for ${index} at ${width}`,
          );
          assert.ok(
            result.right[2] > 180 && result.right[0] < 60,
            `right-edge subject visible for ${index} at ${width}`,
          );
        }
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.evaluate(() => {
        location.hash = "experiences";
      });
      await page.locator("#experience-grid").scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("#experience-grid video")].every(
          (v) => v.dataset.ready === "true",
        ),
      );
      assert.equal(
        await page.evaluate(() =>
          [...document.querySelectorAll("#experience-grid video")].every(
            (v) => v.paused && v.currentTime >= 1 && FilmFrames.inspect(v),
          ),
        ),
        true,
      );
      await page.waitForTimeout(700);
      const box = await page.locator("#experience-grid").boundingBox();
      await page.mouse.move(
        box.x + box.width / 2,
        Math.max(120, Math.min(700, box.y + box.height / 2)),
      );
      const oldY = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(70);
      assert.equal(await page.evaluate(() => cardOffset), 3);
      assert.equal(
        await page.evaluate(() => scrollY),
        oldY,
        "hover wheel pages the collection, not the document",
      );
      await page.waitForTimeout(220);
      // Dispatch a continuous momentum burst together, avoiding automation/IPC
      // delays that can legitimately exceed the gesture's idle boundary.
      const burst = await page.evaluate(() => {
        const target = document.querySelector("#experience-grid");
        const events = Array.from(
          { length: 3 },
          () =>
            new WheelEvent("wheel", {
              bubbles: true,
              cancelable: true,
              deltaY: -120,
            }),
        );
        events.forEach((event) => target.dispatchEvent(event));
        return {
          offset: cardOffset,
          captured: events.every((event) => event.defaultPrevented),
        };
      });
      assert.deepEqual(
        burst,
        { offset: 0, captured: true },
        "trackpad momentum remains one gesture",
      );
      await page.waitForTimeout(220);
      await page.mouse.move(20, 20); // Header/outside collection: normal page wheel.
      await page.mouse.wheel(0, 220);
      await page.waitForTimeout(450);
      assert.ok(
        await page.evaluate((y) => scrollY > y, oldY),
        "wheel outside collection scrolls the page",
      );
      assert.equal(await page.evaluate(() => cardOffset), 0);

      // An entirely black film stays a neutral labelled placeholder, never a black thumbnail.
      await page.route("**/test-black-only.mp4", (route) =>
        fulfillMedia(route, blackOnly),
      );
      const failedPreview = await page.evaluate(async () => {
        const video = document.createElement("video");
        video.muted = true;
        video.src = "/test-black-only.mp4";
        document.body.append(video);
        video.load();
        const ready = await FilmFrames.prepare(video);
        const result = { ready, exposed: video.dataset.frameReady === "true" };
        FilmFrames.reset(video);
        video.removeAttribute("src");
        video.load();
        video.remove();
        return result;
      });
      assert.deepEqual(failedPreview, { ready: false, exposed: false });
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

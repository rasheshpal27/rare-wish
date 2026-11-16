# A Rare Wish

A static website preserving the original cabin-window homepage: three destination views, a through-the-window camera transition, 22 curated experiences, and a WhatsApp enquiry flow. No framework, backend, runtime dependencies or build step.

## Run

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080`. Alternatively, `npm start` runs the same server. Deploy `index.html` and `assets/` together to any static host. Relative asset paths work at a domain root or within a subdirectory. Hash-based destination links do not need server rewrites.

## Interaction

- The first vertical wheel event selects one place. Events in the same gesture, including trackpad momentum, are coalesced until 180 ms of idle time. The incoming video is prepared (bounded wait), then landscape and route icon dissolve/glide together over 1.1 seconds; destination text fades out and back in. Rapid requests are queued rather than interrupting a half-finished transition.
- Maldives → Kenya → Antarctica; the next downward gesture opens the experiences section. Upward gestures move back one place.
- Destination buttons and arrow/Page Up/Page Down keys offer alternatives. Keyboard shortcuts never intercept focused links, buttons or form fields.
- On full-screen phone layouts, one vertical swipe changes one place. Horizontal swipes also work. Short/landscape screens retain natural vertical scrolling so all controls remain reachable.
- **Take a Dive** zooms the original cabin view through its actual window opening into the destination. Escape cancels it. The cabin homepage is preserved; only the later 3D aircraft film is removed.
- Video playback is **on by default**, muted and inline. Each destination plays a looping, two-shot real-footage trailer edit. A pause/play control is available on home and destination views; blocked autoplay exposes a play control, and failed footage exposes a retry control. Inactive/hidden videos pause automatically. Reduced-motion users get static posters by default and can explicitly start the video.
- The restored branded loader waits for the cabin image, fonts and initial video, with a short minimum intro and bounded readiness wait. A separate seven-second watchdog and Enter the experience button keep the page accessible if media or application scripts fail. Without JavaScript, the loader is never shown.
- Enquiries prepare a URL-encoded WhatsApp message; nothing is submitted until the visitor opens WhatsApp and sends it. The site does not save enquiry data.

## Files

- `index.html` — semantic page content, dialogs, metadata and video posters.
- `assets/css/style.css` — shared responsive styling and motion preferences.
- `assets/css/cabin.css` — restored original cabin-window composition and responsive rules.
- `assets/js/content.js` — experience and destination data.
- `assets/js/main.js` — coordinated scene controls, route handling, transitions, filtering and enquiry behavior.
- `assets/js/trailers.js` — source registry and dual-buffer real-footage trailer player.
- `assets/js/window-seat.js` — shared cabin geometry and main-window-centered video framing.
- `assets/img/cabin-window-mask.png` — exact aperture mask derived from the cabin photograph, not an approximate oval.
- `scripts/build-window-mask.py` — optional Pillow-based mask regeneration tool.
- `assets/js/loader.js` — independent intro bootstrap, readiness and fail-open behavior.
- `assets/img/`, `assets/fonts/` — extracted assets from the original supplied site; no base64 payloads in the document.
- `VIDEO-SOURCES.md` — film credits, license, exact source pages and delivery/verification limitations.
- `tests/fixtures/playback.mp4` — test-only media fixture; never referenced by the site.
- `tests/smoke.test.mjs` — browser regression checks.

## Real destination footage

The previous moving-photo loops are removed. The site now streams six real footage clips selected from Pexels: two each for the Maldives, Kenya and Antarctica. The player sequences approximately eight seconds of each clip with a short dissolve, creating a repeating trailer-style edit. Credits, source-location caveats and licensing are in [VIDEO-SOURCES.md](VIDEO-SOURCES.md).

**Verification limit:** source pages and direct media URLs were inspected, but the workspace cannot connect to `videos.pexels.com`. Tests use an intercepted local media fixture, not the live CDN. Verify actual playback, framing and delivery on the deployed preview. For stable production delivery, self-host optimized copies of the selected clips and update `TRAILERS` in `assets/js/trailers.js`.

Posters are static loading/error/reduced-motion fallbacks, never passed off as live footage. A failed or blocked video does not lock the loader or navigation. Because footage is externally hosted, the privacy dialog discloses the browser connection to Pexels.

## Window-seat framing

The footage is centered on the primary physical window, not the viewport. A single, aspect-ratio-preserving landscape spans both windows; the second window reveals a different part of that same view, not a duplicated picture. The mask clips the media to the exact transparent openings in the original cabin artwork, using the same cover scaling and desktop/mobile alignment as the photograph. The mask and framing remain attached during the dive; the destination arrival stays full-bleed.

Each shot can optionally define `windowFocus: { x: 0.5, y: 0.5 }` in `TRAILERS`, where coordinates are fractions of the source frame. The default is the source composition's center. Geometry is verified across screen sizes with test footage and static posters; subject-by-subject focal-point review of the real CDN clips still needs a reachable live preview.

The mask can be rebuilt with `python scripts/build-window-mask.py` after installing Pillow. It is a checked-in asset; no image-processing dependency is needed to run the site.

## Verify

Requires Node 22+, Python 3 and a running preview server:

```sh
npm ci
npm run check
npm test
```

The tests use a Chromium binary delivered through npm on Linux. On other platforms, set `CHROME_EXECUTABLE_PATH` to an installed Chrome/Chromium binary. `TEST_BASE_URL` defaults to `http://127.0.0.1:8080` and can point to another preview.

Coverage: default muted playback, two-shot sequencing, inactive-video pausing, coordinated destination transitions, rapid requests and cancellation, wheel-gesture coalescing, dive/cancel, deep links, search/enquiry flows, reduced motion, mobile swipe/menu, loader skip and watchdog, failed media recovery, blocked autoplay, viewport overflow, no-JavaScript fallback and console errors. Window framing tests also check focal alignment, aspect ratio, mask/photo alignment, actual rendered pixels outside the apertures, resizing and the dive. CDN requests are intercepted by a test-only fixture; these checks do not verify live footage availability.

## Before public deployment

1. Verify all six real-footage URLs on the deployed preview (or self-host optimized copies); review framing and source-location caveats in `VIDEO-SOURCES.md`.
2. Set the Open Graph image to its absolute production URL and add a canonical URL once the final domain is known. No production origin is assumed in this repository.
3. Confirm experience availability and the inherited imagery's usage rights. Experiences intentionally describe enquiries rather than guaranteed access.
4. Deploy the branch through your chosen hosting configuration. Pushing this branch does not itself deploy or merge it into `main`.

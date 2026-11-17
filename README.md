# A Rare Wish

A static website preserving the original cabin-window homepage: all 22 experience films in the cabin window (Antarctica first), a through-the-window camera transition, and a WhatsApp enquiry flow. No framework, backend, runtime dependencies or build step.

## Run

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080`. Alternatively, `npm start` runs the same server. Deploy `index.html` and `assets/` together to any static host. Relative asset paths work at a domain root or within a subdirectory. Hash-based destination links do not need server rewrites.

## Interaction

- The first vertical wheel event selects one place. Events in the same gesture, including trackpad momentum, are coalesced until 180 ms of idle time. The incoming video must decode a verified non-black frame before the landscape and route icon dissolve/glide together over 1.1 seconds; the outgoing layer stays opaque underneath. A failed or timed-out preparation keeps the current experience and offers a retry, rather than revealing an empty buffer; destination text fades out and back in. Rapid requests are queued rather than interrupting a half-finished transition.
- Antarctica → Kenya Wildlife Safari → Sleep underwater → the rest of the experience collection, through Journey to the centre of the earth. All 22 experiences appear once. After stop 22, the next downward gesture opens the collection section. Upward gestures move back one experience; navigation does not wrap.
- Over **The experiences** collection, vertical or horizontal mouse-wheel/trackpad gestures page through the cards; outside that section, normal page scrolling remains available (the existing cabin journey retains its own gestures). Arrows remain as keyboard/touch alternatives. The standalone Kenya story section has been removed; Kenya remains in the 22-stop journey and collection.
- Previous/next buttons, a 22-option experience picker, and arrow/Page Up/Page Down keys offer alternatives. The route plane tracks progress from 01/22 to 22/22. Keyboard shortcuts never intercept focused links, buttons or form fields.
- On full-screen phone layouts, one vertical swipe changes one place. Horizontal swipes also work. Short/landscape screens retain natural vertical scrolling so all controls remain reachable.
- **Take a Dive** zooms the original cabin view through its actual window opening into the selected experience’s full-bleed arrival page (`#experience/<id>`), with matching footage, details and enquiry. Returning to the cabin preserves the selected stop. Legacy `#destination/maldives`, `#destination/kenya` and `#destination/antarctica` links still work. Escape cancels it. The cabin homepage is preserved; only the later 3D aircraft film is removed.
- Video playback is **on by default**, muted and inline. Each experience uses its registered looping real-footage preview (single-clip or multi-shot). A pause/play control is available on home and destination views; blocked autoplay exposes a play control, and failed footage exposes a retry control. Hidden videos pause automatically; cabin films outside the current transition pair are unloaded to avoid keeping all 22 streams resident. No separate poster images are assigned: the incoming film decodes its own non-black frame before the transition. A failed/disabled stream leaves a neutral window, not a different photograph. Reduced-motion users get a neutral, motion-free window by default and can explicitly enable video.
- The branded welcome asks **Enter with music** or **Continue without music**, with a video checkbox checked by default (unchecked for reduced-motion devices). It waits for a deliberate choice, not for external media. No video request is made before entry. Cabin-image/font readiness is bounded; a separate seven-second watchdog releases the page silently if the app fails. Either entry button and Escape also release it. Without JavaScript, the welcome is never shown.
- All **22 experience details** have on-demand film previews with play/pause/retry, explanatory captions and film credits. Cards show paused non-black frames from their own film, never unrelated photos. Only visible thumbnails load, and only when video is enabled. Closing or replacing a detail dialog unloads its media; background destinations pause while dialogs are open.
- Music is the restored original ambient score: soft sustained sine tones in the 146.83–440 Hz register. It is synthesized with Web Audio: explicit opt-in only, separate from silent footage, no audio downloads. The persistent Music control (also inside experience details) switches it on/off; hidden tabs suspend it. Preferences last for the current page visit and are not stored.
- Enquiries prepare a URL-encoded WhatsApp message; nothing is submitted until the visitor opens WhatsApp and sends it. The site does not save enquiry data.

## Files

- `index.html` — semantic page content, dialogs and metadata.
- `assets/css/style.css` — shared responsive styling and motion preferences.
- `assets/css/cabin.css` — restored original cabin-window composition and responsive rules.
- `assets/js/content.js` — experience and destination data.
- `assets/js/main.js` — coordinated scene controls, route handling, transitions, filtering and enquiry behavior.
- `assets/js/trailers.js` — source registry and dual-buffer real-footage trailer player.
- `assets/js/experience-films.js` — source register, attribution and illustrative-footage caveats for all 22 experiences.
- `assets/js/music.js` — restored opt-in ambient score and lifecycle controls.
- `assets/js/film-thumbnails.js` — visible-only paused non-black film previews with video-preference gating and source cleanup.
- `assets/js/window-seat.js` — full-source safe fitting inside the main glass, live blurred surround, last-good-frame retention and dive copying.
- `assets/js/film-frames.js` — bounded decoded-frame inspection, non-black opening selection, reusable source timestamps and cancellable seeks.
- `assets/img/cabin-window-mask.png` — exact aperture mask derived from the cabin photograph, not an approximate oval.
- `scripts/build-window-mask.py` — optional Pillow-based mask regeneration tool.
- `assets/js/loader.js` — independent intro bootstrap, readiness and fail-open behavior.
- `assets/img/`, `assets/fonts/` — extracted assets from the original supplied site; no base64 payloads in the document.
- `VIDEO-SOURCES.md` — film credits, license, exact source pages and delivery/verification limitations.
- `tests/fixtures/playback.mp4` — test-only media fixture; never referenced by the site.
- `tests/smoke.test.mjs` — browser regression checks.

## Real destination footage

The previous moving-photo loops are removed. The legacy destination pages use six Pexels clips: two each for the Maldives, Kenya and Antarctica. The complete cabin journey and experience pages share the same registry as the detail dialogs, adding 17 sourced clips, with shared clips where themes overlap; some are single-source looping previews, others short two-shot edits. These are illustrative stock-footage previews, not 22 commissioned films of the exact offered experiences. The player sequences approximately eight seconds of each clip with a short dissolve, creating a repeating trailer-style edit. Credits, source-location caveats and licensing are in [VIDEO-SOURCES.md](VIDEO-SOURCES.md).

**Verification limit:** source pages and direct media URLs were inspected, but the workspace cannot connect to `videos.pexels.com`. Tests use an intercepted local media fixture, not the live CDN. Verify actual playback, framing and delivery on the deployed preview. For stable production delivery, self-host optimized copies of the selected clips and update the registries in `assets/js/trailers.js` and `assets/js/experience-films.js`. Do not proxy large media through Netlify merely to avoid cross-origin requests; that would move the video bandwidth onto the Netlify bill.

Cabin, arrival and detail players have no `poster` photo. Loading/error/video-off states are neutral; successful playback reveals the decoded film itself. Thumbnails inspect decoded luminance and seek past black/fade-in openings, caching the usable timestamp per source. They remain a labelled neutral placeholder if no usable frame is found or CORS prevents inspection. There is no generated/downloaded still. Browsers may fetch byte ranges or more of the file to decode that frame, so thumbnails are gated by visibility and video consent. Preparation is bounded to 12 seconds; an unsuccessful scene change keeps the old view and restores the controls. A failed or blocked video does not lock the loader. Because footage is externally hosted, the privacy dialog discloses the browser connection to Pexels.

## Window-seat framing

The complete source frame is aspect-fit inside a safe rectangle in the **primary physical window**, rather than center-cropped to fill the tall aperture. This applies to every film, including Porsche, snow driving, gorillas and portrait polo. A softly blurred live view fills the remaining glass; feathered edges avoid a hard rectangular border. This prioritizes keeping the whole shot visible over maximum subject magnification. It cannot make a distant subject larger without a source-specific edit.

The original cabin photograph and exact aperture mask are unchanged. Canvas output is clipped to those openings, preserves its last usable image through black frames/seeks, and is copied into the dive so cloning a canvas does not produce an empty window. Only current/preparing/transition films are retained; inactive sources and canvas allocations are released. Drawing is frame-callback-driven, capped around 30 fps, skips offscreen stages and preserves a `timeupdate` fallback. Full-bleed arrivals/details retain their original cover/portrait-contain behavior.

Decoded inspection requires same-origin video or a video CDN that permits anonymous CORS. When self-hosting, serve byte ranges and correct media content types. Test the actual CDN headers on the deployed preview. **This is a universal no-crop framing change, not a completed visual audit of the 23 source clips.** Synthetic edge-marker tests verify source preservation at desktop/mobile sizes, but actual subject prominence and quality still need a reachable live-video review.

The mask can be rebuilt with `python scripts/build-window-mask.py` after installing Pillow. It is a checked-in asset; no image-processing dependency is needed to run the site.

## Verify

Requires Node 22+, Python 3 and a running preview server:

```sh
npm ci
npm run check
npm test
```

The tests use a Chromium binary delivered through npm on Linux. On other platforms, set `CHROME_EXECUTABLE_PATH` to an installed Chrome/Chromium binary. `TEST_BASE_URL` defaults to `http://127.0.0.1:8080` and can point to another preview.

Coverage also includes genuine black-opening and black-only fixtures, delayed incoming media beyond the old readiness timeout, opaque outgoing layers, both source-edge markers in every cabin stop on desktop/mobile, wheel capture only over the collection, restored music register and standalone Kenya removal.

Coverage: all 22 cabin stops starting in Antarctica, matching full-bleed arrivals/enquiries, return/deep-link behavior, bounded media requests/unloading, route progress and narrow-screen controls; all 22 film mappings and playback/lifecycle, music approval/refusal/toggling/visibility/failure, zero video requests before entry or with video off, explicit reduced-motion override, default muted playback, two-shot sequencing, inactive-video pausing, coordinated destination transitions, rapid requests and cancellation, wheel-gesture coalescing, dive/cancel, deep links, search/enquiry flows, reduced motion, mobile swipe/menu, loader skip and watchdog, failed media recovery, blocked autoplay, viewport overflow, no-JavaScript fallback and console errors. Window framing tests also check focal alignment, aspect ratio, mask/photo alignment, actual rendered pixels outside the apertures, resizing and the dive. CDN requests are intercepted by a test-only fixture; these checks do not verify live footage availability.

## Before public deployment

1. Verify all 23 unique real-footage URLs on the deployed preview (or self-host optimized copies); review framing and source-location caveats in `VIDEO-SOURCES.md`.
2. Set the Open Graph image to its absolute production URL and add a canonical URL once the final domain is known. No production origin is assumed in this repository.
3. Confirm experience availability and the inherited imagery's usage rights. Experiences intentionally describe enquiries rather than guaranteed access.
4. Deploy the branch through your chosen hosting configuration. Pushing this branch does not itself deploy or merge it into `main`.

## Hosting costs

For Netlify credit-based plans, the [official credit documentation](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/) reviewed 16 November 2026 lists **15 credits per successful production deploy**, **20 credits/GB bandwidth** and **2 credits/10,000 web requests**. Preview/branch deployment itself costs zero credits, but its traffic still counts. Legacy plans may differ. Four merges are not proof of four successful production deploys; check the team's Usage & billing dashboard for the actual breakdown.

Batch related changes into one production release; use branch previews for review. This static site has no application server/functions or AI runtime. Videos stream directly from Pexels rather than via a Netlify proxy, and the generated music has no downloaded audio asset. Experience films are requested only on opening a detail (if videos are enabled). No billing settings were changed.

## Current review fixes and remaining verification

- The window caption is text-only (no background panel, border or shadow).
- Diamond uses the rotating diamond-ring film; Piaget uses an independent jewellery-making film, clearly labelled as **not** a Piaget atelier or endorsement. Their card previews use the distinct film opening frames too.
- Beach rides now use Jessi X’s aerial horse-riding-on-the-shore source (14915401), replacing 856643. Its source page identifies riders and horses; actual moving footage is **not yet verified here**.
- WhatsApp is a filled, high-contrast header/footer CTA with a visible keyboard-focus state, preserving the original contact number.
- Earlier ambient music is restored, opening-black thumbnails are rejected, scene/shot dissolves are readiness-gated, collection wheel navigation is scoped to hover, and the standalone Kenya section is removed.
- **Outstanding:** actual per-timestamp visual review of all 23 live sources, especially Porsche/snow cars, gorillas and beach riders. CDN access is unavailable in this workspace; source titles and synthetic geometry tests are not a live-footage audit. Full-source safe fitting replaces the problematic center crop, but actual subject size/visibility, CORS headers, delivery and mobile performance must be reviewed on the deployed preview or using supplied source files before release.

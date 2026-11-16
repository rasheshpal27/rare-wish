# A Rare Wish

An exploration-first static website: three destination windows, a through-the-window camera transition, 22 curated experiences, and a WhatsApp enquiry flow. No framework, backend, runtime dependencies or build step.

## Run

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080`. Alternatively, `npm start` runs the same server. Deploy `index.html` and `assets/` together to any static host. Relative asset paths work at a domain root or within a subdirectory. Hash-based destination links do not need server rewrites.

## Interaction

- The first vertical wheel event changes one place immediately. Events in the same gesture, including trackpad momentum, are coalesced until 180 ms of idle time.
- Maldives → Kenya → Antarctica; the next downward gesture opens the experiences section. Upward gestures move back one place.
- Destination buttons and arrow/Page Up/Page Down keys offer alternatives. Keyboard shortcuts never intercept focused links, buttons or form fields.
- On full-screen phone layouts, one vertical swipe changes one place. Horizontal swipes also work. Short/landscape screens retain natural vertical scrolling so all controls remain reachable.
- **Take a Dive** expands the actual destination window to the full viewport, followed by a second camera push into the landscape. Escape cancels it. No 3D aircraft or cabin-interior sequence remains.
- Reduced-motion users get an immediate route change and static posters by default. Motion can be paused on both home and destination views. Inactive/hidden videos pause automatically.
- Enquiries prepare a URL-encoded WhatsApp message; nothing is submitted until the visitor opens WhatsApp and sends it. The site does not save enquiry data.

## Files

- `index.html` — semantic page content, dialogs, metadata and video posters.
- `assets/css/style.css` — responsive styling and motion preferences.
- `assets/js/content.js` — experience and destination data.
- `assets/js/main.js` — discrete scene controls, route handling, transition, filtering and enquiry behavior.
- `assets/img/`, `assets/fonts/` — extracted assets from the original supplied site; no base64 payloads in the document.
- `assets/video/` — local MP4 loops; see the provenance note below.
- `tests/smoke.test.mjs` — browser regression checks.

## Video provenance / production footage

**The three included MP4s are animated still-image previews, not live-action footage.** They were rendered from the original site's Maldives, Kenya and Antarctica images using slow zoom/pan motion. This provides working local video playback without presenting unlicensed stock footage as an approved asset. The footage requirement is not fully satisfied until these previews are replaced with approved destination clips.

Replace these files with licensed, genuine destination footage to complete that requirement:

- `assets/video/maldives.mp4`
- `assets/video/kenya.mp4`
- `assets/video/antarctica.mp4`

Keep the filenames and the page will use the new footage automatically. Recommended: H.264 MP4, yuv420p, 1280×720 or higher, muted, 10–20 seconds, loopable, fast-start metadata. Current loops are 12 seconds at 30 fps. Keep matching poster images in `assets/img/` for blocked autoplay, reduced motion and loading states. Confirm usage rights for all inherited images and replacement footage before public commercial use.

## Verify

Requires Node 22+, Python 3 and a running preview server:

```sh
npm ci
npm run check
npm test
```

The tests use a Chromium binary delivered through npm on Linux. On other platforms, set `CHROME_EXECUTABLE_PATH` to an installed Chrome/Chromium binary. `TEST_BASE_URL` defaults to `http://127.0.0.1:8080` and can point to another preview.

Coverage: wheel-gesture coalescing, reverse navigation, scene exit, dive/cancel, destination deep links and reloads, search empty states, enquiry selection and WhatsApp encoding, reduced motion, mobile swipe/menu, viewport overflow, no-JavaScript fallback, console errors and failed asset requests.

## Before public deployment

1. Replace the animated previews with approved real destination footage.
2. Set the Open Graph image to its absolute production URL and add a canonical URL once the final domain is known. No production origin is assumed in this repository.
3. Confirm experience availability and the inherited imagery's usage rights. Experiences intentionally describe enquiries rather than guaranteed access.
4. Deploy the branch through your chosen hosting configuration. Pushing this branch does not itself deploy or merge it into `main`.

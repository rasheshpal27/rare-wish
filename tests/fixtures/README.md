# Test-only media

`playback.mp4` is a deterministic 12-second H.264 decoding fixture, retained from the old animated still preview solely for browser tests. The production site does **not** reference it.

Tests intercept external Pexels requests with these bytes to exercise playback, pausing, sequencing, and errors without network-dependent outcomes. This is not a substitute for checking the 23 unique actual footage URLs on a network that can reach the CDN.

`black-opening.mp4` is a generated four-second H.264 fixture: one second of black, then three seconds of a pale background with red/blue markers near the left/right edges. It verifies seek-based black rejection and no source-edge cropping. `black-only.mp4` is two seconds of pure black and verifies fail-closed preview handling. Both are synthetic test patterns, not destination footage; neither is referenced by production. Tests serve byte ranges so Chromium can genuinely seek instead of silently remaining at zero.

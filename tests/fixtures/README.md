# Test-only media

`playback.mp4` is a deterministic 12-second H.264 decoding fixture, retained from the old animated still preview solely for browser tests. The production site does **not** reference it.

Tests intercept external Pexels requests with these bytes to exercise playback, pausing, sequencing, and errors without network-dependent outcomes. This is not a substitute for checking the 23 unique actual footage URLs on a network that can reach the CDN.

`black-opening.mp4` is a tiny synthetic four-second test pattern: one second of black followed by a light background and colored edge markers. `black-only.mp4` is two seconds of pure black. They test seeking beyond black openings and keeping unusable thumbnail sources hidden. Neither is production footage. Test routes support byte ranges so Chromium performs real seeks.

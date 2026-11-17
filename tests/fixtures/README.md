# Test-only media

`playback.mp4` is a deterministic 12-second H.264 decoding fixture, retained from the old animated still preview solely for browser tests. The production site does **not** reference it.

Tests intercept external Pexels requests with these bytes to exercise playback, pausing, sequencing, and errors without network-dependent outcomes. This is not a substitute for checking the six actual footage URLs on a network that can reach the CDN.

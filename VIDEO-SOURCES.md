# Destination film credits

The homepage and destination pages use real camera footage in short, two-shot, silent trailer-style edits. Each shot plays for approximately 8 seconds, with a 700 ms dissolve into the next. The edit repeats automatically. These are curated stock-footage sequences, not official tourism-board trailers.

The former animated-photo MP4s have been removed from production. Still posters remain for loading, reduced motion, and network failure; they are never animated as replacement footage.

## Source register

Source pages and their linked media URLs were inspected on **16 November 2026**. Geographic descriptions below reflect the publishers' titles, descriptions, and tags, not independently verified filming coordinates.

| Destination | Shot / source                                                                                                                          | Creator             | Source identification                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Maldives    | [Drone Footage On The Island Of Maldives](https://www.pexels.com/video/maldives-free-download-drone-video-beach-island-4010941/)       | Videographer Shiyaz | Maldives lagoon, boat and white sandy shoreline; 44-second source                                                          |
| Maldives    | [Drone Footage of a Sailing Boat](https://www.pexels.com/video/drone-footage-of-a-sailing-boat-4730814/)                               | Videographer Shiyaz | Publisher describes Maldives waters and a boat near a jetty; 10-second source                                              |
| Kenya       | [A Grassland with Elephants](https://www.pexels.com/video/a-grassland-with-elephants-7499056/)                                         | nine lives films    | Publisher identifies Amboseli National Park, Kenya; 17-second source                                                       |
| Kenya       | [A Giraffe Walking in a Safari](https://www.pexels.com/video/a-giraffe-walking-in-a-safari-7421702/)                                   | DoomFilms           | Savannah wildlife; source tagged Kenya / Maasai Mara, with other regional tags; exact park not confirmed; 35-second source |
| Antarctica  | [View of Giant Glaciers at Antarctica](https://www.pexels.com/video/view-of-giant-glaciers-at-antarctica-8318616/)                     | Mikhail Nilov       | Publisher title identifies Antarctica; floating iceberg; 11-second source                                                  |
| Antarctica  | [Aerial View of Iceberg break off at Antarctica](https://www.pexels.com/video/aerial-view-of-iceberg-break-off-at-antarctica-8318608/) | Mikhail Nilov       | Publisher title identifies Antarctica; aerial icy waters; 10-second source                                                 |

These clips illustrate the destinations, not a guaranteed itinerary or specific accommodation. The Kenya sequence is not represented as footage exclusively from the Maasai Mara.

## License

All six source pages link to the [Pexels License](https://www.pexels.com/license/). At review, that license allowed free website use and modification, with attribution appreciated but not required. Do not imply endorsement by the creators or identifiable people/brands, sell unaltered copies, redistribute as stock, or use the footage as a trademark. Review the current source terms before changing use. Credits are provided here voluntarily.

## Delivery and verification

- Exact MP4 URLs copied from the source pages are registered in `assets/js/trailers.js`.
- Clips stream directly from `videos.pexels.com`. There are no API keys, YouTube ads, embedded third-party players, or sound on autoplay.
- Only the visible destination and its next shot are buffered. During destination transitions, the outgoing and incoming trailer may briefly play together.
- The source pages and license were accessible during implementation, **but this workspace cannot access the footage CDN**. Direct live playback and image quality could not be verified here. Check all three trailers on the deployed preview before merging/releasing. External availability and autoplay policy can vary by browser/network.
- Browser regression tests intercept the CDN requests with a clearly separated local playback fixture. They validate decoding, autoplay, shot sequencing, pausing, transitions, loading and errors—not the external footage's availability, quality, or geographic accuracy.
- If the CDN fails, visitors see the static poster and an explicit retry control, not a fake moving-photo video. The initial loader always releases.
- For production reliability, download the selected source files under the license, encode web-sized H.264/fast-start versions, host them on your own asset origin, and replace the six `src` values in the registry. Do not guess alternate Pexels rendition URLs.

The browser connects to Pexels to play the footage, disclosing normal connection data such as the visitor's IP address. This is noted in the site's privacy dialog.

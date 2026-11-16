# Destination and experience film credits

The legacy destination pages use real camera footage in short, two-shot, silent trailer-style edits. The cabin homepage now follows all 22 experience previews below, starting with Antarctica; each uses the same film as its corresponding experience detail and arrival page. Each shot plays for approximately 8 seconds, with a 700 ms dissolve into the next. The edit repeats automatically. These are curated stock-footage sequences, not official tourism-board trailers.

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

- Exact MP4 URLs copied from the source pages are registered in `assets/js/trailers.js` and `assets/js/experience-films.js`.
- Clips stream directly from `videos.pexels.com`. There are no API keys, YouTube ads, embedded third-party players, or sound on autoplay.
- Only the selected cabin experience and its next shot are buffered. During transitions, the outgoing and incoming trailers may briefly play together; the old stage’s media is unloaded after the transition. All 22 films are never downloaded together.
- The source pages and license were accessible during implementation, **but this workspace cannot access the footage CDN**. Direct live playback and image quality could not be verified here. Check all three destination trailers and all 22 experience previews on the deployed preview before merging/releasing. External availability and autoplay policy can vary by browser/network.
- Browser regression tests intercept the CDN requests with a clearly separated local playback fixture. They validate decoding, autoplay, shot sequencing, pausing, transitions, loading and errors—not the external footage's availability, quality, or geographic accuracy.
- If the CDN fails, visitors see the static poster and an explicit retry control, not a fake moving-photo video. The initial loader always releases.
- For production reliability, download the selected source files under the license, encode web-sized H.264/fast-start versions, host them on your own asset origin, and replace the registered `src` values in the registry. Do not guess alternate Pexels rendition URLs.

The browser connects to Pexels to play the footage, disclosing normal connection data such as the visitor's IP address. This is noted in the site's privacy dialog.

## Experience previews

Every experience has an on-demand preview, using 16 additional source clips plus the six destination clips above. Single-source previews loop the original clip; multi-shot previews sequence short excerpts. These are real footage, not animated photos. All source pages and their exact linked MP4 renditions were inspected on **16 November 2026**, but the media CDN remains unverified from this workspace. No claim is made that generic footage depicts the actual bookable experience.

The source-page title/description is the identification basis, not independent location verification. The geography-sensitive and brand-specific limits below are also visible beside the relevant film. In particular, the gorilla clip has zoo tags; no Rwanda/mountain-gorilla provenance is claimed. The space preview is archival shuttle footage, not CGI and not a commercial flight offering. Japan uses a heritage-location clip rather than unrelated cosplay. Polo preserves the vertical source rather than cropping out the action.

Two legacy Pixabay uploads link to Pexels' [Creative Commons page](https://www.pexels.com/creative-commons-images/) (CC0); the other additional clips link to the [Pexels License](https://www.pexels.com/license/). The non-endorsement and other use restrictions discussed above still matter. No sponsorship or brand association is implied.

### Additional source register

| Key         | Source / creator                                                                                                     | License                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| fieldRide   | [Source page](https://www.pexels.com/video/a-man-holding-his-hat-while-riding-a-horse-8625402/) · RDNE Stock project | Pexels                                             |
| reef        | [Source page](https://www.pexels.com/video/underwater-view-of-marine-life-1151290/) · Tom Fisk                       | Pexels                                             |
| diver       | [Source page](https://www.pexels.com/video/man-diving-underwater-5277921/) · Daniel Torobekov                        | Pexels                                             |
| ring        | [Source page](https://www.pexels.com/video/a-diamond-laced-engagement-ring-on-display-4004214/) · Danish Hayat       | Pexels                                             |
| gorilla     | [Source page](https://www.pexels.com/video/side-view-of-a-silverback-gorilla-8502226/) · Nicky Pe                    | Pexels                                             |
| helicopter  | [Source page](https://www.pexels.com/video/helicopter-flying-over-village-12359720/) · Robart Ghimire                | Pexels                                             |
| beachRide   | [Source page](https://www.pexels.com/video/horseback-riding-at-the-beach-856643/) · Pixabay                          | CC0 (source links to Pexels Creative Commons page) |
| golf        | [Source page](https://www.pexels.com/video/drone-footage-of-a-golf-course-6070745/) · Curtis Adams                   | Pexels                                             |
| vatican     | [Source page](https://www.pexels.com/video/stunning-aerial-view-of-vatican-city-at-sunset-31820461/) · Florian Delée | Pexels                                             |
| volcano     | [Source page](https://www.pexels.com/video/a-footage-of-a-volcano-erupting-9882072/) · Martin Sanchez                | Pexels                                             |
| winterDrive | [Source page](https://www.pexels.com/video/car-driving-on-road-in-forest-in-winter-9871284/) · Maksim Goncharenok    | Pexels                                             |
| kumbh       | [Source page](https://www.pexels.com/video/vibrant-rituals-at-kumbh-mela-festival-31094211/) · Jay paul              | Pexels                                             |
| japan       | [Source page](https://www.pexels.com/video/close-up-of-the-kinkaku-ji-temple-5854336/) · The Instagrapher            | Pexels                                             |
| launch      | [Source page](https://www.pexels.com/video/launching-of-rocket-854261/) · Pixabay                                    | CC0 (source links to Pexels Creative Commons page) |
| polo        | [Source page](https://www.pexels.com/video/aerial-view-of-a-horse-polo-match-39429454/) · ProLens                    | Pexels                                             |
| coast       | [Source page](https://www.pexels.com/video/diani-beach-drone-footage-kwale-county-kenya-27784993/) · Kelvin Kibe     | Pexels                                             |

### Experience mapping and limits

| Experience                         | Footage limits                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Kenya Wildlife Safari              | Kenyan wildlife footage; not exclusively the Maasai Mara.                                                             |
| Explore Antarctica                 | Polar scenery; source titles identify Antarctica, but capture locations are not independently verified.               |
| Sleep underwater                   | Marine life and Maldives scenery; not footage of an underwater residence.                                             |
| Mahakumbh in India                 | Kumbh Mela festival footage; not a preview of a confirmed future event.                                               |
| Helicopter Picnic                  | Helicopter footage from Nepal; picnic location and aircraft are arranged individually.                                |
| Wedding by Helicopters             | Helicopter and jewellery inspiration; not footage of a particular wedding or venue.                                   |
| Ride ponies on a beach             | Illustrative beach horse ride; animal, location and guide depend on your arrangements.                                |
| Meet Gorillas in Rwanda            | Illustrative gorilla footage; not verified as Rwanda or mountain gorillas. Source includes zoo tags.                  |
| ICE Moritz                         | Illustrative winter motoring; not St. Moritz or official footage of The I.C.E.                                        |
| Vatican museum after hours         | Vatican and Rome exterior scenery; not an after-hours museum visit.                                                   |
| Live with a Samurai                | Kinkaku-ji, Kyoto: a glimpse of Japan’s heritage, not footage of a samurai host or programme.                         |
| Palau history dive                 | Illustrative reef diving; not verified as Palau or its historic wreck sites.                                          |
| Porsche Ice Experience             | Generic winter driving; not a Porsche vehicle, official programme film or brand endorsement.                          |
| The Diamond Experience             | Illustrative diamond jewellery; individual stones and appointments are confirmed separately.                          |
| Piaget ‘Infinitely Personal’       | Generic jewellery inspiration; not a Piaget product, atelier or brand endorsement.                                    |
| Private Island in Kenya            | Publisher identifies Diani Beach, Kenya; not a specific private island or property.                                   |
| Man vs Wild in Maasai Mara         | Kenyan wildlife scenery; not footage of a survival programme or exclusively the Maasai Mara.                          |
| Wellness and Golf                  | Illustrative golf-course scenery; not a particular wellness resort.                                                   |
| Space Travel                       | Archival space-shuttle launch footage; not a currently bookable spacecraft or commercial operator.                    |
| Learn polo like the kings          | Illustrative polo match; not a specific instructor or venue. Original vertical framing preserved.                     |
| Horseback Safari                   | Western-style riding intercut with Kenyan wildlife as inspiration; not footage of an actual African horseback safari. |
| Journey to the centre of the earth | Volcanic landscape inspiration; not the cave or chamber visited on a guided descent.                                  |

### Playback and music

No footage is requested until welcome entry. Video is enabled by default except when the device requests reduced motion; the welcome checkbox lets visitors override either setting. Music is off unless explicitly approved. The ambient score is generated in the browser using original sine-tone arrangements, with no third-party song, download, or audio licence dependency. Hidden tabs suspend audio. Music and video preferences are independent and are not stored.

The cabin shows all 22 experience previews, starting with Antarctica, with a film-notes control linking to the relevant detail disclosure. The experience collection uses still thumbnails; opening a detail loads only its clip(s). Closing/replacing the detail unloads its sources. Videos are always muted; audible music is controlled separately. External media bytes are delivered by Pexels, not Netlify.

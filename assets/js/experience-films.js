/* Source-page URLs and exact linked renditions reviewed 2026-11-16.
   Stock footage illustrates a setting/activity, never guaranteed access or endorsement. */
const EXPERIENCE_FOOTAGE = {
  fieldRide: {
    src: "https://videos.pexels.com/video-files/8625402/8625402-hd_1920_1080_30fps.mp4",
    source:
      "https://www.pexels.com/video/a-man-holding-his-hat-while-riding-a-horse-8625402/",
    creator: "RDNE Stock project",
    seconds: 8,
  },
  reef: {
    src: "https://videos.pexels.com/video-files/1151290/1151290-hd_1920_1080_30fps.mp4",
    source:
      "https://www.pexels.com/video/underwater-view-of-marine-life-1151290/",
    creator: "Tom Fisk",
    seconds: 8,
  },
  diver: {
    src: "https://videos.pexels.com/video-files/5277921/5277921-uhd_2560_1440_30fps.mp4",
    source: "https://www.pexels.com/video/man-diving-underwater-5277921/",
    creator: "Daniel Torobekov",
    seconds: 8,
  },
  ring: {
    src: "https://videos.pexels.com/video-files/4004214/4004214-hd_1920_1080_25fps.mp4",
    source:
      "https://www.pexels.com/video/a-diamond-laced-engagement-ring-on-display-4004214/",
    creator: "Danish Hayat",
    seconds: 12,
  },
  gorilla: {
    src: "https://videos.pexels.com/video-files/8502226/8502226-uhd_2560_1440_25fps.mp4",
    source:
      "https://www.pexels.com/video/side-view-of-a-silverback-gorilla-8502226/",
    creator: "Nicky Pe",
    seconds: 12,
  },
  helicopter: {
    src: "https://videos.pexels.com/video-files/12359720/12359720-hd_1920_1080_60fps.mp4",
    source:
      "https://www.pexels.com/video/helicopter-flying-over-village-12359720/",
    creator: "Robart Ghimire",
    seconds: 4,
  },
  beachRide: {
    src: "https://videos.pexels.com/video-files/856643/856643-hd_1920_1080_30fps.mp4",
    source:
      "https://www.pexels.com/video/horseback-riding-at-the-beach-856643/",
    creator: "Pixabay",
    seconds: 12,
    license: "CC0 (source links to Pexels Creative Commons page)",
  },
  golf: {
    src: "https://videos.pexels.com/video-files/6070745/6070745-uhd_2560_1440_24fps.mp4",
    source:
      "https://www.pexels.com/video/drone-footage-of-a-golf-course-6070745/",
    creator: "Curtis Adams",
    seconds: 12,
  },
  vatican: {
    src: "https://videos.pexels.com/video-files/31820461/13557083_2560_1440_30fps.mp4",
    source:
      "https://www.pexels.com/video/stunning-aerial-view-of-vatican-city-at-sunset-31820461/",
    creator: "Florian Delée",
    seconds: 12,
  },
  volcano: {
    src: "https://videos.pexels.com/video-files/9882072/9882072-uhd_2560_1440_30fps.mp4",
    source:
      "https://www.pexels.com/video/a-footage-of-a-volcano-erupting-9882072/",
    creator: "Martin Sanchez",
    seconds: 12,
  },
  winterDrive: {
    src: "https://videos.pexels.com/video-files/9871284/9871284-uhd_2560_1440_24fps.mp4",
    source:
      "https://www.pexels.com/video/car-driving-on-road-in-forest-in-winter-9871284/",
    creator: "Maksim Goncharenok",
    seconds: 12,
  },
  kumbh: {
    src: "https://videos.pexels.com/video-files/31094211/13286728_1920_1080_50fps.mp4",
    source:
      "https://www.pexels.com/video/vibrant-rituals-at-kumbh-mela-festival-31094211/",
    creator: "Jay paul",
    seconds: 8,
  },
  japan: {
    src: "https://videos.pexels.com/video-files/5854336/5854336-uhd_2732_1440_24fps.mp4",
    source:
      "https://www.pexels.com/video/close-up-of-the-kinkaku-ji-temple-5854336/",
    creator: "The Instagrapher",
    seconds: 6,
  },
  launch: {
    src: "https://videos.pexels.com/video-files/854261/854261-hd_1920_1080_30fps.mp4",
    source: "https://www.pexels.com/video/launching-of-rocket-854261/",
    creator: "Pixabay",
    seconds: 16,
    license: "CC0 (source links to Pexels Creative Commons page)",
  },
  polo: {
    src: "https://videos.pexels.com/video-files/39429454/16790931_1440_2560_30fps.mp4",
    source:
      "https://www.pexels.com/video/aerial-view-of-a-horse-polo-match-39429454/",
    creator: "ProLens",
    seconds: 8,
    fit: "contain",
  },
  coast: {
    src: "https://videos.pexels.com/video-files/27784993/12223980_2560_1440_30fps.mp4",
    source:
      "https://www.pexels.com/video/diani-beach-drone-footage-kwale-county-kenya-27784993/",
    creator: "Kelvin Kibe",
    seconds: 8,
  },
};
const EXPERIENCE_FILMS = {
  kenya: {
    clips: TRAILERS.kenya.clips,
    note: "Kenyan wildlife footage; not exclusively the Maasai Mara.",
  },
  antarctica: {
    clips: TRAILERS.antarctica.clips,
    note: "Polar scenery; source titles identify Antarctica, but capture locations are not independently verified.",
  },
  underwater: {
    clips: [EXPERIENCE_FOOTAGE.reef, ...TRAILERS.maldives.clips.slice(0, 1)],
    note: "Marine life and Maldives scenery; not footage of an underwater residence.",
  },
  kumbh: {
    clips: [EXPERIENCE_FOOTAGE.kumbh],
    note: "Kumbh Mela festival footage; not a preview of a confirmed future event.",
  },
  picnic: {
    clips: [EXPERIENCE_FOOTAGE.helicopter],
    note: "Helicopter footage from Nepal; picnic location and aircraft are arranged individually.",
  },
  wedding: {
    clips: [EXPERIENCE_FOOTAGE.helicopter, EXPERIENCE_FOOTAGE.ring],
    note: "Helicopter and jewellery inspiration; not footage of a particular wedding or venue.",
  },
  ponies: {
    clips: [EXPERIENCE_FOOTAGE.beachRide],
    note: "Illustrative beach horse ride; animal, location and guide depend on your arrangements.",
  },
  gorillas: {
    clips: [EXPERIENCE_FOOTAGE.gorilla],
    note: "Illustrative gorilla footage; not verified as Rwanda or mountain gorillas. Source includes zoo tags.",
  },
  ice: {
    clips: [EXPERIENCE_FOOTAGE.winterDrive],
    note: "Illustrative winter motoring; not St. Moritz or official footage of The I.C.E.",
  },
  vatican: {
    clips: [EXPERIENCE_FOOTAGE.vatican],
    note: "Vatican and Rome exterior scenery; not an after-hours museum visit.",
  },
  samurai: {
    clips: [EXPERIENCE_FOOTAGE.japan],
    note: "Kinkaku-ji, Kyoto: a glimpse of Japan’s heritage, not footage of a samurai host or programme.",
  },
  palau: {
    clips: [EXPERIENCE_FOOTAGE.diver, EXPERIENCE_FOOTAGE.reef],
    note: "Illustrative reef diving; not verified as Palau or its historic wreck sites.",
  },
  porsche: {
    clips: [EXPERIENCE_FOOTAGE.winterDrive],
    note: "Generic winter driving; not a Porsche vehicle, official programme film or brand endorsement.",
  },
  diamond: {
    clips: [EXPERIENCE_FOOTAGE.ring],
    note: "Illustrative diamond jewellery; individual stones and appointments are confirmed separately.",
  },
  piaget: {
    clips: [EXPERIENCE_FOOTAGE.ring],
    note: "Generic jewellery inspiration; not a Piaget product, atelier or brand endorsement.",
  },
  island: {
    clips: [EXPERIENCE_FOOTAGE.coast],
    note: "Publisher identifies Diani Beach, Kenya; not a specific private island or property.",
  },
  survival: {
    clips: TRAILERS.kenya.clips,
    note: "Kenyan wildlife scenery; not footage of a survival programme or exclusively the Maasai Mara.",
  },
  wellness: {
    clips: [EXPERIENCE_FOOTAGE.golf],
    note: "Illustrative golf-course scenery; not a particular wellness resort.",
  },
  space: {
    clips: [EXPERIENCE_FOOTAGE.launch],
    note: "Archival space-shuttle launch footage; not a currently bookable spacecraft or commercial operator.",
  },
  polo: {
    clips: [EXPERIENCE_FOOTAGE.polo],
    note: "Illustrative polo match; not a specific instructor or venue. Original vertical framing preserved.",
  },
  horseback: {
    clips: [EXPERIENCE_FOOTAGE.fieldRide, TRAILERS.kenya.clips[1]],
    note: "Western-style riding intercut with Kenyan wildlife as inspiration; not footage of an actual African horseback safari.",
  },
  earth: {
    clips: [EXPERIENCE_FOOTAGE.volcano],
    note: "Volcanic landscape inspiration; not the cave or chamber visited on a guided descent.",
  },
};

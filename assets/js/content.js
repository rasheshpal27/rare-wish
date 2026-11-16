const experiences = [
  {
    id: "kenya",
    title: "Kenya Wildlife Safari",
    location: "Maasai Mara, Kenya",
    category: "Into the wild",
    image: "safari",
    short: "A different perspective on the wild.",
    description:
      "Rise above the savannah, where winding rivers and wildlife trails tell a story older than time. A privately curated air safari brings you closer to Kenya’s extraordinary landscapes, with thoughtful stays and unhurried moments on the ground.",
  },
  {
    id: "antarctica",
    title: "Explore Antarctica",
    location: "Antarctica",
    category: "Discover",
    image: "antarctica",
    short: "To the edge of the world. And beyond.",
    description:
      "Trade the familiar for a world of sculpted ice, impossibly blue water and immense silence. Discover a fly-in Antarctic journey built around your appetite for adventure, with specialist operators and season-dependent access.",
  },
  {
    id: "underwater",
    title: "Sleep underwater",
    location: "The Maldives",
    category: "Retreat",
    image: "underwater",
    short: "Drift off in a world beneath the waves.",
    description:
      "Imagine your bedroom opening onto an underwater world. Explore a rare ocean retreat, where remarkable design and marine life come together in a stay unlike any other. We’ll help find the right underwater residence and arrange the details around you.",
  },
  {
    id: "kumbh",
    title: "Mahakumbh in India",
    location: "India",
    category: "Discover",
    image: "kumbh",
    short: "A journey into faith, culture and connection.",
    description:
      "Experience the scale and spirit of India’s great gathering with considerate planning, local guidance and a comfortable base. This is an event-led enquiry: the relevant festival, next dates and access will be discussed and verified with you before any proposal.",
  },
  {
    id: "picnic",
    title: "Helicopter Picnic",
    location: "A destination chosen for you",
    category: "Celebrate",
    image: "helicopter",
    short: "A table somewhere wonderfully unexpected.",
    description:
      "Take the scenic route to a picnic far from the everyday. We’ll explore a private helicopter journey and a beautifully considered setting, with the route, menu and landing arrangements tailored to your destination and local permissions.",
  },
  {
    id: "wedding",
    title: "Wedding by Helicopters",
    location: "Your dream destination",
    category: "Celebrate",
    image: "celebrate",
    short: "A love story with an extraordinary arrival.",
    description:
      "Give your celebration a truly memorable perspective. From a dramatic arrival to an intimate destination ceremony, we’ll help shape a helicopter-inspired wedding experience with specialist partners, suitable venues and careful coordination.",
  },
  {
    id: "ponies",
    title: "Ride ponies on a beach",
    location: "Coastal escapes",
    category: "Into the wild",
    image: "horses",
    short: "Salt in the air. Nothing on the agenda.",
    description:
      "Slow down to the rhythm of the shore on a thoughtfully arranged beach ride. We’ll match the setting and riding experience to your group, with experienced local guides and animal welfare considerations central to the plan.",
  },
  {
    id: "gorillas",
    title: "Meet Gorillas in Rwanda",
    location: "Rwanda",
    category: "Into the wild",
    image: "gorillas",
    short: "A rare encounter. A lasting perspective.",
    description:
      "Journey into Rwanda’s green highlands for a guided gorilla trek with licensed specialists. Permits, suitable accommodation and logistics are carefully considered, while park rules and respectful wildlife viewing guide every encounter.",
  },
  {
    id: "ice",
    title: "ICE Moritz",
    location: "St. Moritz, Switzerland",
    category: "Celebrate",
    image: "ice",
    short: "Classic motoring. An alpine stage.",
    description:
      "Explore the world of beautiful automobiles against the winter backdrop of St. Moritz. Share your interest in The I.C.E. and we’ll investigate upcoming event dates, access and a considered alpine stay. Event arrangements depend on official availability.",
  },
  {
    id: "vatican",
    title: "Vatican museum after hours",
    location: "Vatican City",
    category: "Discover",
    image: "vatican",
    short: "Art, history and a little more silence.",
    description:
      "Discover the possibility of a quieter encounter with the Vatican Museums’ remarkable collections. We’ll investigate authorised special-access options, expert guides and suitable dates. After-hours entry is never assumed and must be confirmed by the relevant provider.",
  },
  {
    id: "samurai",
    title: "Live with a Samurai",
    location: "Japan",
    category: "Discover",
    image: "samurai",
    short: "Step into a living tradition.",
    description:
      "Explore the discipline, craft and philosophy of Japan’s samurai heritage through a thoughtfully curated cultural immersion. Meet knowledgeable practitioners, discover historic settings and find a deeper perspective on a remarkable tradition.",
  },
  {
    id: "palau",
    title: "Palau history dive",
    location: "Palau",
    category: "Discover",
    image: "diving",
    short: "Stories waiting beneath the surface.",
    description:
      "Discover the layered history and underwater landscapes of Palau with experienced dive professionals. Your itinerary will reflect certification, confidence and conditions, combining considered dive sites with time to appreciate the islands above the water.",
  },
  {
    id: "porsche",
    title: "Porsche Ice Experience",
    location: "Winter driving destinations",
    category: "Discover",
    image: "porsche",
    short: "Precision meets pure exhilaration.",
    description:
      "Explore a specialist winter-driving programme where control, skill and snow-covered scenery meet. We’ll enquire about official Porsche Ice Experience availability and suitable programmes, then build a complete journey around confirmed access.",
  },
  {
    id: "diamond",
    title: "The Diamond Experience",
    location: "Curated around your interest",
    category: "Celebrate",
    image: "diamond",
    short: "Discover the story behind the sparkle.",
    description:
      "Follow your curiosity into the world of exceptional stones and craftsmanship. From private appointments to a meaningful personal purchase, we’ll shape an introduction to trusted specialists around your interests and the occasion.",
  },
  {
    id: "piaget",
    title: "Piaget ‘Infinitely Personal’",
    location: "By private enquiry",
    category: "Celebrate",
    image: "diamond",
    short: "An expression that is entirely yours.",
    description:
      "An invitation to explore a more personal relationship with exceptional craftsmanship. Tell us about your interest in Piaget and we’ll enquire about relevant bespoke services and appointments. Brand participation and access require direct confirmation.",
  },
  {
    id: "island",
    title: "Private Island in Kenya",
    location: "Kenyan coast",
    category: "Retreat",
    image: "hero",
    short: "Your own little corner of the world.",
    description:
      "Leave the rush behind on Kenya’s beautiful coast. We’ll explore private-island and exclusive-use stays suited to your party, with thoughtful hosting, time on the water and room for the simple pleasure of doing very little.",
  },
  {
    id: "survival",
    title: "Man vs Wild in Maasai Mara",
    location: "Maasai Mara, Kenya",
    category: "Into the wild",
    image: "wild",
    short: "Reconnect with your wilder side.",
    description:
      "A guided wilderness immersion inspired by curiosity, not unnecessary risk. Discover bush skills, local knowledge and remarkable landscapes with qualified guides, appropriate permissions and an itinerary suited to your comfort and experience.",
  },
  {
    id: "wellness",
    title: "Wellness and Golf",
    location: "Retreats around the world",
    category: "Retreat",
    image: "atelier",
    short: "Find your balance. Follow your own pace.",
    description:
      "Bring restorative days and beautiful fairways together in one effortless escape. We’ll find a retreat that matches your pace, combining thoughtful wellness options, golf arrangements and space to simply feel like yourself again.",
  },
  {
    id: "space",
    title: "Space Travel",
    location: "Beyond the everyday",
    category: "Discover",
    image: "space",
    short: "For a curiosity without limits.",
    description:
      "Explore what a space-related journey could mean for you, from specialist training and zero-gravity experiences to enquiries with commercial spaceflight providers. Feasibility, eligibility, safety requirements and availability must be established with authorised operators.",
  },
  {
    id: "polo",
    title: "Learn polo like the kings",
    location: "Selected polo destinations",
    category: "Discover",
    image: "polo",
    short: "Tradition, skill and a new kind of thrill.",
    description:
      "Discover polo with experienced instructors and a programme matched to your riding ability. From first introductions to a more immersive stay, we’ll bring together learning, hospitality and a setting worthy of the occasion.",
  },
  {
    id: "horseback",
    title: "Horseback Safari",
    location: "African wilderness",
    category: "Into the wild",
    image: "horses",
    short: "The wild, at a different rhythm.",
    description:
      "Explore the possibility of a horseback safari with specialist guides who know the terrain and its wildlife. Riding ability, safety and animal welfare shape the choice of operator, route and pace of your journey.",
  },
  {
    id: "earth",
    title: "Journey to the centre of the earth",
    location: "Iceland",
    category: "Discover",
    image: "volcano",
    short: "Go deeper into the extraordinary.",
    description:
      "Discover Iceland’s volcanic story through a specialist-led subterranean adventure. We’ll explore suitable volcano and cave experiences, considering season, physical requirements and operator availability, and curate the surrounding journey with equal care.",
  },
];
const destinations = [
  {
    slug: "maldives",
    name: "The Maldives",
    shortName: "Maldives",
    region: "THE INDIAN OCEAN",
    coordinates: "04°17′ N · 73°25′ E",
    images: ["hero", "underwater", "coast"],
    wish: "Sleep underwater",
    intro:
      "A thousand shades of blue. A slower rhythm. A little world that feels entirely your own.",
    title: "Not just a stay.<br><em>Another world.</em>",
    description:
      "Wake to a horizon of turquoise. Spend the day exactly as you please, then discover the possibility of a night beneath the waves. We shape your Maldives journey around the kind of escape you have in mind: restorative, romantic, celebratory, or simply beautifully unhurried.",
    highlights: [
      "Oceanfront moments, at your own pace",
      "Remarkable stays, personally selected",
      "Underwater residence enquiries",
    ],
    facts: [
      ["THE SETTING", "Islands, lagoons and the Indian Ocean."],
      [
        "YOUR PACE",
        "An unhurried escape, tailored to your occasion and travel party.",
      ],
      [
        "RARE ACCESS",
        "Underwater residences are limited. Property, dates and access require confirmation.",
      ],
    ],
  },
  {
    slug: "kenya",
    name: "Kenya",
    shortName: "Kenya",
    region: "EAST AFRICA",
    coordinates: "01°24′ S · 35°00′ E",
    images: ["wild", "safari", "helicopter"],
    wish: "Kenya Wildlife Safari",
    intro:
      "An endless horizon. A world untamed. Some places change the way you see everything.",
    title: "A different perspective.<br><em>A deeper connection.</em>",
    description:
      "Discover Kenya’s extraordinary landscapes, guided wildlife encounters and thoughtfully selected camps. We consider your pace, your interests and the season, with respectful wildlife viewing at the heart of the journey.",
    highlights: [
      "Sunrise game drives and savannah walks",
      "Specialist-guided wildlife encounters",
      "Thoughtfully selected safari stays",
    ],
    facts: [
      ["THE SETTING", "The Maasai Mara and Kenya’s remarkable landscapes."],
      [
        "YOUR PACE",
        "Wildlife-led days and unhurried evenings, shaped around your group.",
      ],
      [
        "TO CONSIDER",
        "Wildlife sightings, routes and flight arrangements depend on season, conditions and confirmed operators.",
      ],
    ],
  },
  {
    slug: "antarctica",
    name: "Antarctica",
    shortName: "Antarctica",
    region: "THE WHITE CONTINENT",
    coordinates: "64°49′ S · 63°30′ W",
    images: ["antarctica", "antarctica", "antarctica"],
    wish: "Explore Antarctica",
    intro:
      "An immense silence. Ice in impossible shades of blue. A journey beyond everything familiar.",
    title: "To the edge of the world.<br><em>And a little beyond.</em>",
    description:
      "Explore an Antarctic fly-in journey with specialist expedition operators. Immense ice formations, remote landscapes and the simple sensation of being somewhere unlike anywhere else create the setting. We help you consider the right programme, practical requirements and the wider journey around it.",
    highlights: [
      "Specialist expedition planning",
      "Ice formations and ocean wildlife",
      "A wilderness-led experience",
    ],
    facts: [
      [
        "THE SETTING",
        "Antarctic landscapes, shaped by ice, ocean and weather.",
      ],
      [
        "YOUR PACE",
        "An expedition programme matched to your interests and suitability.",
      ],
      [
        "TO CONSIDER",
        "Seasonal access, operator requirements, weather and itinerary changes are central to planning.",
      ],
    ],
  },
];

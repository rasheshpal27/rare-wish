"use strict";
const $ = (s, root = document) => root.querySelector(s),
  $$ = (s, root = document) => [...root.querySelectorAll(s)];
const imagePath = (name) => `assets/img/${name}.webp`;
let activeCategory = "All",
  cardOffset = 0;
const filteredExperiences = () =>
  experiences.filter(
    (e) => activeCategory === "All" || e.category === activeCategory,
  );
function renderCards() {
  const e = filteredExperiences(),
    t = e.slice(cardOffset, cardOffset + 3);
  (($("#experience-grid").innerHTML = t
    .map(
      (i, n) =>
        `<button class="experience-card enter" data-experience="${i.id}" style="animation-delay:${n * 70}ms" aria-label="Discover ${i.title}"><div class="experience-image"><img src="${imagePath(i.image)}" alt="${i.short}" width="700" height="850"/><span class="card-number">${String(experiences.indexOf(i) + 1).padStart(2, "0")} / A RARE EXPERIENCE</span><span class="card-category">${i.category.toUpperCase()}</span><span class="card-arrow">↗</span></div><div class="card-info"><span class="card-location">${i.location.toUpperCase()}</span><h3>${i.title}</h3><p>${i.short}</p></div></button>`,
    )
    .join("")),
    ($("#collection-count").textContent =
      `${String(e.length ? cardOffset + 1 : 0).padStart(2, "0")} — ${String(Math.min(cardOffset + 3, e.length)).padStart(2, "0")} / ${String(e.length).padStart(2, "0")}`),
    ($("#cards-prev").disabled = cardOffset === 0),
    ($("#cards-next").disabled = cardOffset + 3 >= e.length));
  if (!e.length)
    $("#experience-grid").innerHTML =
      '<div class="no-results"><h3>A wish beyond the list?</h3><p>Choose another category, or tell us what you have in mind.</p><button class="text-link" data-enquire>Create my own journey ↗</button></div>';
}
$$("[data-filter]").forEach((e) =>
  e.addEventListener("click", () => {
    ((activeCategory = e.dataset.filter),
      (cardOffset = 0),
      $$("[data-filter]").forEach((t) => {
        (t.classList.toggle("active", t === e),
          t.setAttribute("aria-pressed", String(t === e)));
      }),
      renderCards());
  }),
);
$("#cards-prev").addEventListener("click", () => {
  ((cardOffset = Math.max(0, cardOffset - 3)), renderCards());
});
$("#cards-next").addEventListener("click", () => {
  ((cardOffset += 3), renderCards());
});
renderCards();
let dialogTrigger = null;
function openDialog(e) {
  if ($("#experience-dialog").open) releaseExperienceFilm();
  ($("dialog[open]") || (dialogTrigger = document.activeElement),
    $$("dialog[open]").forEach((t) => t.close()),
    e.showModal(),
    (e.scrollTop = 0),
    document.body.classList.add("modal-open"));
}
function closeDialog(e) {
  e.close();
}
$$("dialog").forEach((e) => {
  ($(".close-dialog", e)?.addEventListener("click", () => closeDialog(e)),
    e.addEventListener("click", (t) => {
      if (t.target !== e) return;
      const i = e.getBoundingClientRect();
      (t.clientX < i.left ||
        t.clientX > i.right ||
        t.clientY < i.top ||
        t.clientY > i.bottom) &&
        closeDialog(e);
    }),
    e.addEventListener("close", () => {
      $("dialog[open]") ||
        (document.body.classList.remove("modal-open"),
        dialogTrigger?.focus({ preventScroll: !0 }));
    }));
});
let selectedExperience = null,
  experienceTrailer = null;
function releaseExperienceFilm() {
  experienceTrailer?.destroy();
  experienceTrailer = null;
  $("#detail-trailer").removeAttribute("data-playback");
}
$("#experience-dialog").addEventListener("close", () => {
  if (!$("#experience-dialog").open) {
    releaseExperienceFilm();
    syncMotion();
  }
});
function openExperience(e) {
  const t = experiences.find((i) => i.id === e);
  t &&
    ((selectedExperience = t),
    ($("#detail-image").src = imagePath(t.image)),
    ($("#detail-image").alt = `${t.location} — illustrative travel imagery`),
    ($("#detail-location").textContent =
      `${t.category.toUpperCase()} / ${t.location.toUpperCase()}`),
    ($("#detail-title").textContent = t.title),
    ($("#detail-description").textContent = t.description),
    openDialog($("#experience-dialog")));
  if (!t) return;
  releaseExperienceFilm();
  const film = EXPERIENCE_FILMS[t.id];
  $("#detail-video").poster = imagePath(t.image);
  $("#detail-film-note").textContent = `ILLUSTRATIVE FILM · ${film.note}`;
  experienceTrailer = new DestinationTrailer($("#detail-trailer"), t.id, film);
  syncMotion();
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-experience]");
  t && openExperience(t.dataset.experience);
  const i = e.target.closest("[data-enquire]");
  i && openEnquiry(i.dataset.enquire || "A bespoke journey — surprise me");
});
let collectionCategory = "All";
function renderCollection() {
  const e = $("#experience-search").value.trim().toLowerCase(),
    t = experiences.filter(
      (i) =>
        (collectionCategory === "All" || i.category === collectionCategory) &&
        `${i.title} ${i.location} ${i.category} ${i.short}`
          .toLowerCase()
          .includes(e),
    );
  (($("#results-label").textContent =
    `${t.length} ${t.length === 1 ? "experience" : "experiences"} to make your own · Imagery is illustrative; arrangements are confirmed individually.`),
    ($("#collection-results").innerHTML = t.length
      ? t
          .map(
            (i) =>
              `<button class="result-card" data-experience="${i.id}"><div><img src="${imagePath(i.image)}" alt="" width="450" height="300"/><span class="result-arrow">↗</span></div><span class="card-location">${i.location.toUpperCase()}</span><h3>${i.title}</h3><p>${i.category}</p></button>`,
          )
          .join("")
      : '<div class="no-results"><h3>A wish beyond the list?</h3><p>Try another search, or tell us what you have in mind.</p><button class="text-link" data-enquire>Create my own journey ↗</button></div>'));
}
function openCollection(e = "All") {
  ((collectionCategory = e),
    ($("#experience-search").value = ""),
    $$("[data-collection-filter]").forEach(
      (t) => (
        t.classList.toggle(
          "active",
          t.dataset.collectionFilter === collectionCategory,
        ),
        t.setAttribute(
          "aria-pressed",
          String(t.dataset.collectionFilter === collectionCategory),
        )
      ),
    ),
    renderCollection(),
    openDialog($("#collection-dialog")));
}
$("#view-all").addEventListener("click", () => openCollection());
$("#explore-collective").addEventListener("click", () =>
  openCollection("Celebrate"),
);
$("#experience-search").addEventListener("input", renderCollection);
$$("[data-collection-filter]").forEach((e) =>
  e.addEventListener("click", () => {
    ((collectionCategory = e.dataset.collectionFilter),
      $$("[data-collection-filter]").forEach(
        (t) => (
          t.classList.toggle("active", t === e),
          t.setAttribute("aria-pressed", String(t === e))
        ),
      ),
      renderCollection());
  }),
);
experiences.forEach((e) => {
  const t = document.createElement("option");
  ((t.textContent = e.title), $("#enquiry-experience").append(t));
});
function openEnquiry(e) {
  (($("#enquiry-form").hidden = !1),
    ($("#enquiry-success").hidden = !0),
    ($("#enquiry-experience").value = [
      ...$("#enquiry-experience").options,
    ].some((option) => option.value === e)
      ? e
      : "A bespoke journey — surprise me"),
    $("#mobile-menu").hidden === !1 && closeMenu(),
    openDialog($("#enquiry-dialog")));
}
$("#detail-enquire").addEventListener("click", () =>
  openEnquiry(selectedExperience?.title || "A bespoke journey — surprise me"),
);
$("#enquiry-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const t = new FormData(e.currentTarget),
    i = `Hello A Rare Wish! I’m ${t.get("name").trim()}.

My wish: ${t.get("experience")}
Travel party: ${t.get("guests")}
Preferred month: ${t.get("date") || "Flexible"}
Email: ${t.get("email").trim()}${
      t.get("message").trim()
        ? `

A little more: ${t.get("message").trim()}`
        : ""
    }

I’d love to start a conversation about a curated journey.`;
  (($("#whatsapp-send").href =
    `https://wa.me/919769825919?text=${encodeURIComponent(i)}`),
    ($("#enquiry-form").hidden = !0),
    ($("#enquiry-success").hidden = !1),
    $("#whatsapp-send").focus(),
    $("#enquiry-dialog").scrollTo({ top: 0, behavior: "smooth" }));
});
$("#edit-enquiry").addEventListener("click", () => {
  (($("#enquiry-form").hidden = !1),
    ($("#enquiry-success").hidden = !0),
    $('[name="name"]').focus());
});
$("#privacy-button").addEventListener("click", () =>
  openDialog($("#privacy-dialog")),
);
$("#year").textContent = new Date().getFullYear();
$('[name="date"]').min = new Date().toISOString().slice(0, 7);
function updateHeader() {
  document.body.classList.toggle(
    "cabin-in-view",
    !$("#home").hidden && scrollY < 60,
  );
  const e =
    !location.hash.startsWith("#destination/") &&
    !location.hash.startsWith("#experience/") &&
    scrollY < 60 &&
    $("#mobile-menu").hidden;
  ($("#header").classList.toggle("overlay-header", e),
    $("#header").classList.toggle("scrolled", !e));
}
function closeMenu() {
  (($("#mobile-menu").hidden = !0),
    $("#menu-button").setAttribute("aria-expanded", "false"),
    updateHeader());
}
$("#menu-button").addEventListener("click", () => {
  const e = !$("#mobile-menu").hidden;
  (($("#mobile-menu").hidden = e),
    $("#menu-button").setAttribute("aria-expanded", String(!e)),
    updateHeader());
});
$$("#mobile-menu a").forEach((e) => e.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const t = $("dialog[open]");
    (t && (e.preventDefault(), closeDialog(t)), closeMenu());
  }
});

// One gesture chooses one stop. The visual change is a shared 1.1-second
// dissolve: old footage keeps playing until the incoming scene has settled.
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let scene = 0,
  paused = !(
    window.RareWishIntro?.preferences.video ?? !motionPreference.matches
  ),
  diving = false,
  gestureTimer;
let wheelGesture = false,
  touchStart = null,
  activeDestination = null;
let arrivalTrailer = null;
// Build lightweight stages only; inactive films do not hold network sources.
$("#flight-portal").replaceChildren();
$("#journey-select").replaceChildren();
const homeTrailers = cabinExperiences.map((place, index) => {
  const container = document.createElement("div");
  container.className = `place-scene${index === 0 ? " active" : ""}`;
  container.dataset.scene = String(index);
  container.dataset.experienceId = place.slug;
  const video = document.createElement("video");
  video.setAttribute("aria-label", `${place.name} video preview`);
  container.append(video);
  $("#flight-portal").append(container);
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = `${String(index + 1).padStart(2, "0")} · ${place.name}`;
  $("#journey-select").append(option);
  return new DestinationTrailer(container, place.slug, place.film);
});
let outgoingScene = null,
  preparingScene = null;
let sceneBusy = false,
  sceneVersion = 0,
  queuedScene = null;
let sceneAnimations = [];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function shownTrailer() {
  return $("#experience-dialog").open
    ? experienceTrailer
    : activeDestination
      ? arrivalTrailer
      : homeTrailers[scene];
}
function updatePlaybackControls() {
  const player = shownTrailer();
  const state = player?.state;
  let text = paused ? "Play video ▷" : "Pause video Ⅱ";
  if (!paused && state === "error") text = "Video unavailable · Retry ↻";
  else if (!paused && state === "blocked") text = "Play video ▷";
  else if (!paused && (state === "loading" || state === "idle"))
    text = "Loading video · Pause Ⅱ";
  $$("[data-motion-toggle]").forEach((button) => {
    button.textContent = text;
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute("aria-label", text);
  });
}
function syncMotion() {
  const visible =
    !paused &&
    !document.hidden &&
    !document.documentElement.classList.contains("js-loading");
  const allowed = visible && !$("dialog[open]");
  experienceTrailer?.setEnabled(visible && $("#experience-dialog").open);
  homeTrailers.forEach((trailer, index) => {
    const relevant =
      !activeDestination &&
      [scene, outgoingScene, preparingScene].includes(index);
    if (!relevant) {
      trailer.unload();
      return;
    }
    trailer.videos.forEach((video) => {
      if (!video.getAttribute("poster"))
        video.poster = imagePath(cabinExperiences[index].images[0]);
    });
    trailer.setEnabled(allowed && !diving);
  });
  arrivalTrailer?.setEnabled(allowed && !!activeDestination);
  updatePlaybackControls();
}
document.addEventListener("trailerstatechange", updatePlaybackControls);
function updateSceneText() {
  const place = cabinExperiences[scene];
  $("#scene-number").textContent = String(scene + 1).padStart(2, "0");
  $("#scene-name").textContent = place.name;
  $("#scene-region").textContent = place.region;
  $("#scene-coordinates").textContent =
    `${place.category.toUpperCase()} · ${String(scene + 1).padStart(2, "0")} / ${cabinExperiences.length}`;
  $("#window-glass-destination").textContent = place.shortName;
  $("#window-glass-label small").textContent =
    `${String(scene + 1).padStart(2, "0")} / ${cabinExperiences.length} · ${place.category.toUpperCase()}`;
  $("#dive-place").textContent = `EXPLORE ${place.shortName.toUpperCase()}`;
}
function setStop() {
  $("#journey-select").value = String(scene);
  $("#journey-count").textContent =
    `${String(scene + 1).padStart(2, "0")} / ${cabinExperiences.length} EXPERIENCES`;
  $("#journey-prev").disabled = scene === 0;
  $("#journey-next").disabled = scene === cabinExperiences.length - 1;
  const progress = (scene / (cabinExperiences.length - 1)) * 100;
  $("#flight-track-fill").style.width = `${progress}%`;
  $("#flight-track-plane").style.left = `${progress}%`;
}
function cancelSceneTransition() {
  sceneVersion++;
  sceneBusy = false;
  queuedScene = outgoingScene = preparingScene = null;
  sceneAnimations.forEach((animation) => animation.cancel());
  sceneAnimations = [];
  document.body.classList.remove("scene-changing");
  $("#take-dive").disabled = false;
  $$("#flight-portal [data-scene]").forEach((el, i) =>
    el.classList.toggle("active", i === scene),
  );
  updateSceneText();
  setStop();
}
async function selectScene(index, animate = true) {
  index = Math.max(0, Math.min(cabinExperiences.length - 1, index));
  if (sceneBusy) {
    queuedScene = index;
    return;
  }
  if (index === scene || !animate || motionPreference.matches) {
    scene = index;
    cancelSceneTransition();
    syncMotion();
    return;
  }
  sceneBusy = true;
  const version = ++sceneVersion;
  const oldScene = scene;
  preparingScene = index;
  $("#take-dive").disabled = true;
  // Request a decoded incoming frame before crossfading. Bounded wait: a broken
  // CDN must never lock navigation; the static poster and retry control remain.
  if (!paused) {
    syncMotion();
    await Promise.race([homeTrailers[index].prepare(), delay(2200)]);
  }
  if (version !== sceneVersion) return;
  scene = index;
  outgoingScene = oldScene;
  preparingScene = null;
  document.body.classList.add("scene-changing");
  setStop();
  $$("#flight-portal [data-scene]").forEach((el, i) =>
    el.classList.toggle("active", i === scene),
  );
  syncMotion();
  // Animate inner content, never the window label's positioning transform.
  const textNodes = $$(
    ".location-display, .location-meta, #window-glass-label > span:nth-child(2), #window-glass-label small, #dive-place",
  );
  sceneAnimations = textNodes.map((node) =>
    node.animate(
      [
        { opacity: 1, transform: "translateY(0px)" },
        { opacity: 0, transform: "translateY(-5px)" },
      ],
      { duration: 200, easing: "ease-in", fill: "forwards" },
    ),
  );
  await delay(200);
  if (version !== sceneVersion) return;
  updateSceneText();
  sceneAnimations.forEach((animation) => animation.cancel());
  sceneAnimations = textNodes.map((node) =>
    node.animate(
      [
        { opacity: 0, transform: "translateY(7px)" },
        { opacity: 1, transform: "translateY(0px)" },
      ],
      { duration: 850, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
    ),
  );
  await delay(900);
  if (version !== sceneVersion) return;
  sceneAnimations.forEach((animation) => animation.cancel());
  sceneAnimations = [];
  sceneBusy = false;
  outgoingScene = null;
  document.body.classList.remove("scene-changing");
  $("#take-dive").disabled = false;
  syncMotion();
  const next = queuedScene;
  queuedScene = null;
  if (next !== null && next !== scene) selectScene(next);
}
$("#journey-select").addEventListener("change", (event) =>
  selectScene(Number(event.target.value)),
);
$("#journey-prev").addEventListener("click", () => stepScene(-1));
$("#journey-next").addEventListener("click", () => stepScene(1));
$("#cabin-film-notes").addEventListener("click", () =>
  openExperience(cabinExperiences[scene].slug),
);
$$("[data-motion-toggle]").forEach((button) =>
  button.addEventListener("click", () => {
    const player = shownTrailer();
    if (!paused && ["error", "blocked"].includes(player?.state)) player.retry();
    else paused = !paused;
    syncMotion();
  }),
);
motionPreference.addEventListener("change", (event) => {
  paused = event.matches;
  cancelSceneTransition();
  syncMotion();
});
document.addEventListener("visibilitychange", syncMotion);
document.addEventListener("mediapreferenceschange", () => {
  paused = !window.RareWishIntro.preferences.video;
  syncMotion();
});
document.addEventListener("introfinished", () => {
  paused = !(
    window.RareWishIntro?.preferences.video ?? !motionPreference.matches
  );
  syncMotion();
});
function canChangeScene() {
  const rect = $("#hero").getBoundingClientRect();
  return (
    !document.documentElement.classList.contains("js-loading") &&
    !activeDestination &&
    !diving &&
    !$("dialog[open]") &&
    $("#mobile-menu").hidden &&
    rect.top >= -10 &&
    rect.top < 60
  );
}
function stepScene(direction) {
  if (sceneBusy) {
    queuedScene = Math.max(
      0,
      Math.min(
        cabinExperiences.length - 1,
        (queuedScene ?? preparingScene ?? scene) + direction,
      ),
    );
    return;
  }
  if (direction > 0 && scene === cabinExperiences.length - 1) {
    location.hash = "experiences";
  } else if (direction < 0 && scene === 0) {
    // The first scene is the beginning, not an implicit wraparound.
  } else selectScene(scene + direction);
}
$("#hero").addEventListener(
  "wheel",
  (event) => {
    if (
      !canChangeScene() ||
      event.target.closest(".cabin-stops") ||
      event.ctrlKey ||
      Math.abs(event.deltaY) < Math.abs(event.deltaX) ||
      !event.deltaY
    )
      return;
    event.preventDefault();
    clearTimeout(gestureTimer);
    if (!wheelGesture) {
      wheelGesture = true;
      stepScene(Math.sign(event.deltaY));
    }
    gestureTimer = setTimeout(() => {
      wheelGesture = false;
    }, 180);
  },
  { passive: false },
);
// One swipe changes one place. Short/landscape screens retain native vertical
// scrolling so controls below the fold stay reachable; horizontal swipes work too.
$("#hero").addEventListener(
  "touchstart",
  (event) => {
    touchStart =
      event.touches.length === 1 &&
      !event.target.closest("button,a,select,label")
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
        : null;
  },
  { passive: true },
);
$("#hero").addEventListener(
  "touchmove",
  (event) => {
    if (
      touchStart &&
      event.touches.length === 1 &&
      canChangeScene() &&
      $("#hero").offsetHeight <= innerHeight + 1
    )
      event.preventDefault();
  },
  { passive: false },
);
$("#hero").addEventListener(
  "touchend",
  (event) => {
    if (!touchStart || !canChangeScene()) return;
    const dx = touchStart.x - event.changedTouches[0].clientX,
      dy = touchStart.y - event.changedTouches[0].clientY;
    touchStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
      selectScene(scene + Math.sign(dx));
    else if (Math.abs(dy) > 45 && $("#hero").offsetHeight <= innerHeight + 1)
      stepScene(Math.sign(dy));
  },
  { passive: true },
);
document.addEventListener("keydown", (event) => {
  if (
    !canChangeScene() ||
    event.repeat ||
    event.target.closest("button,a,input,select,textarea,[contenteditable]")
  )
    return;
  if (
    [
      "ArrowDown",
      "ArrowRight",
      "PageDown",
      "ArrowUp",
      "ArrowLeft",
      "PageUp",
    ].includes(event.key)
  ) {
    event.preventDefault();
    stepScene(["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key) ? -1 : 1);
  }
});
function renderDestination(place) {
  activeDestination = place;
  $("#home").hidden = true;
  $("#destination-page").hidden = false;
  document.body.classList.add("destination-mode");
  document.body.classList.remove("cabin-in-view");
  document.title = `${place.name} — A Rare Wish`;
  arrivalTrailer?.destroy();
  const video = $("#arrival-video");
  video.poster = imagePath(place.images[0]);
  arrivalTrailer = new DestinationTrailer(
    $("#arrival-trailer"),
    place.slug,
    place.film || TRAILERS[place.slug],
  );
  $("#arrival-region").textContent = place.region;
  $("#arrival-title").textContent = place.name;
  $("#arrival-intro").textContent = place.intro;
  $("#arrival-film-note").textContent = place.film
    ? `ILLUSTRATIVE FILM · ${place.film.note}`
    : "Illustrative destination footage. See Film credits for source and location details.";
  $("#place-heading").innerHTML = place.title;
  $("#place-description").textContent = place.description;
  $("#place-image").src = imagePath(place.images[1]);
  $("#place-image").alt = `${place.name} — illustrative experience imagery`;
  $("#place-enquire").dataset.enquire = place.wish;
  $("#place-highlights").innerHTML = place.highlights
    .map(
      (text, i) =>
        `<article><span>0${i + 1} / EXPERIENCE</span><h3>${text}</h3></article>`,
    )
    .join("");
  $("#place-facts").innerHTML = place.facts
    .map(
      ([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`,
    )
    .join("");
  window.scrollTo({ top: 0, behavior: "instant" });
  $("#destination-page").focus({ preventScroll: true });
  syncMotion();
}
function route() {
  cancelDive();
  cancelSceneTransition();
  const hash = location.hash.slice(1);
  if (hash.startsWith("experience/")) {
    const place = cabinExperiences.find((item) => item.slug === hash.slice(11));
    if (place) {
      scene = cabinExperiences.indexOf(place);
      cancelSceneTransition();
      renderDestination(place);
      return;
    }
    history.replaceState(null, "", "#home");
  }
  if (hash.startsWith("destination/")) {
    const place = destinations.find((item) => item.slug === hash.slice(12));
    if (place) {
      renderDestination(place);
      return;
    }
    history.replaceState(null, "", "#home");
  }
  // Anchor inside a destination should not unmount the destination.
  if (hash === "place-details" && activeDestination) {
    $("#place-details").scrollIntoView();
    return;
  }
  arrivalTrailer?.destroy();
  arrivalTrailer = null;
  activeDestination = null;
  $("#home").hidden = false;
  $("#destination-page").hidden = true;
  document.body.classList.remove("destination-mode");
  document.title = "A Rare Wish — Beyond the ordinary.";
  closeMenu();
  const anchor = document.getElementById(location.hash.slice(1) || "home");
  if (anchor)
    requestAnimationFrame(() => {
      anchor.scrollIntoView({ behavior: "instant" });
      updateHeader();
    });
  syncMotion();
}
$('a[href="#place-details"]').addEventListener("click", (event) => {
  event.preventDefault();
  $("#place-details").scrollIntoView({
    behavior: motionPreference.matches ? "instant" : "smooth",
  });
});
window.addEventListener("hashchange", route);
window.addEventListener("scroll", updateHeader, { passive: true });
let diveAnimation, diveTimer;
function cancelDive() {
  clearTimeout(diveTimer);
  diveAnimation?.cancel();
  $("#dive-overlay").hidden = true;
  $$("video", $(".dive-frame")).forEach((video) => video.pause());
  $(".dive-frame").replaceChildren();
  document.body.classList.remove("diving");
  $("#take-dive").disabled = false;
  diving = false;
}
$("#take-dive").addEventListener("click", () => {
  if (diving || sceneBusy) return;
  const place = cabinExperiences[scene];
  if (motionPreference.matches) {
    location.hash = `experience/${place.slug}`;
    return;
  }
  diving = true;
  $("#take-dive").disabled = true;
  const stage = $("#cabin-view").getBoundingClientRect();
  const window = cabinWindowGeometry();
  const overlay = $("#dive-overlay"),
    frame = $(".dive-frame");
  const cabin = $("#cabin-view").cloneNode(true);
  cabin.removeAttribute("id");
  $$("[id]", cabin).forEach((element) => element.removeAttribute("id"));
  $$(".place-scene:not(.active)", cabin).forEach((element) => element.remove());
  const sourceVideo = homeTrailers[scene].current;
  $$("video", cabin).forEach((video) => video.remove());
  const video = sourceVideo.cloneNode(true);
  video.removeAttribute("id");
  $(".place-scene.active", cabin).append(video);
  video.currentTime = sourceVideo.currentTime;
  video.muted = true;
  frame.replaceChildren(cabin);
  syncMotion();
  Object.assign(frame.style, {
    left: `${stage.left}px`,
    top: `${stage.top}px`,
    width: `${stage.width}px`,
    height: `${stage.height}px`,
  });
  overlay.hidden = false;
  document.body.classList.add("diving");
  if (!paused) video.play().catch(() => {});
  // Zoom the original cabin itself, aiming through its actual window opening.
  // There is no cutaway to an aircraft model or a second plane view.
  const zoom =
    Math.max(innerWidth / window.width, innerHeight / window.height) * 1.2;
  const transform = (scale) =>
    `translate(${innerWidth / 2 - stage.left - window.x * scale}px, ${innerHeight / 2 - stage.top - window.y * scale}px) scale(${scale})`;
  diveAnimation = cabin.animate(
    [
      { transform: "translate(0,0) scale(1)", filter: "blur(0px)" },
      { transform: transform(zoom * 0.55), filter: "blur(1px)", offset: 0.65 },
      { transform: transform(zoom), filter: "blur(0px)" },
    ],
    { duration: 1650, easing: "cubic-bezier(.65,0,.2,1)", fill: "forwards" },
  );
  $("#dive-arriving").textContent = `Arriving in ${place.name}`;
  $("#dive-arriving").animate(
    [
      { opacity: 0 },
      { opacity: 0, offset: 0.5 },
      { opacity: 1, offset: 0.8 },
      { opacity: 0 },
    ],
    { duration: 1750, fill: "forwards" },
  );
  diveTimer = setTimeout(() => {
    location.hash = `experience/${place.slug}`;
  }, 1750);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && diving) {
    cancelDive();
    $("#take-dive").focus();
    syncMotion();
  }
});
$$("dialog").forEach((dialog) => {
  new MutationObserver(syncMotion).observe(dialog, {
    attributes: true,
    attributeFilter: ["open"],
  });
});
selectScene(0, false);
route();

function cabinWindowGeometry() {
  return CabinViewport.geometry($("#cabin-view"));
}
function positionWindowLabel() {
  CabinViewport.layout($("#cabin-view"));
  const geometry = cabinWindowGeometry();
  const label = $("#window-glass-label"),
    width = $("#cabin-view").clientWidth;
  label.style.left = `${Math.max(85, Math.min(width - 85, geometry.x))}px`;
  label.style.top = `${geometry.bottom + (width <= 760 ? 16 : -9)}px`;
}
new ResizeObserver(positionWindowLabel).observe($("#hero"));
positionWindowLabel();

// Intro readiness is bounded independently of app initialization and media.
(async function finishIntro() {
  const intro = window.RareWishIntro;
  if (!intro) return;
  intro.status("Opening your window to the world…");
  const cabin = $("#cabin-photograph");
  const imageReady = cabin.decode
    ? cabin.decode().catch(() => {})
    : Promise.resolve();
  // No external media is requested before the welcome preference is chosen.
  await Promise.race([
    Promise.allSettled([document.fonts.ready, imageReady]),
    delay(4500),
  ]);
  intro.status("Your next chapter is ready.");
  intro.finish();
})();

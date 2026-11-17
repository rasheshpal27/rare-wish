/* Real footage, not animated photographs. Sources and licensing: VIDEO-SOURCES.md.
   URLs copied from the source pages; streamed from Pexels, not bundled locally. */
const TRAILERS = {
  maldives: {
    label: "The Maldives",
    clips: [
      {
        src: "https://videos.pexels.com/video-files/4010941/4010941-uhd_2560_1440_25fps.mp4",
        seconds: 8,
      },
      {
        src: "https://videos.pexels.com/video-files/4730814/4730814-uhd_2560_1440_25fps.mp4",
        seconds: 8,
      },
    ],
  },
  kenya: {
    label: "Kenya",
    clips: [
      {
        src: "https://videos.pexels.com/video-files/7499056/7499056-hd_1920_1080_30fps.mp4",
        seconds: 8,
      },
      {
        src: "https://videos.pexels.com/video-files/7421702/7421702-hd_1920_1080_25fps.mp4",
        seconds: 8,
      },
    ],
  },
  antarctica: {
    label: "Antarctica",
    clips: [
      {
        src: "https://videos.pexels.com/video-files/8318616/8318616-uhd_2560_1440_25fps.mp4",
        seconds: 8,
      },
      {
        src: "https://videos.pexels.com/video-files/8318608/8318608-uhd_2560_1440_25fps.mp4",
        seconds: 8,
      },
    ],
  },
};

// Readiness-gated two-buffer films. Never fade a decoded frame into an empty buffer.
class DestinationTrailer {
  constructor(container, slug, film = TRAILERS[slug]) {
    this.container = container;
    this.slug = slug;
    this.clips = film.clips;
    this.enabled = false;
    this.front = this.clip = 0;
    this.switching = false;
    this.state = "idle";
    this.generation = 0;
    this.timers = new Set();
    this.listeners = new AbortController();
    const first = container.querySelector("video"),
      second = first.cloneNode(false);
    second.removeAttribute("id");
    container.replaceChildren(first, second);
    this.videos = [first, second];
    this.videos.forEach((video, index) => {
      FilmFrames.reset(video);
      video.removeAttribute("src");
      video.removeAttribute("poster");
      video.removeAttribute("autoplay");
      video.replaceChildren();
      video.loop = false; // Loop back to the first NON-black frame, not time zero.
      video.crossOrigin = "anonymous";
      video.muted = video.defaultMuted = true;
      video.playsInline = true;
      video.preload = "none";
      video.classList.add("trailer-shot");
      video.classList.toggle("trailer-front", index === 0);
      const layer = document.createElement("div");
      layer.className = `trailer-layer${index === 0 ? " trailer-front" : ""}`;
      video.before(layer);
      layer.append(video);
      CabinViewport.attach(video);
      const listen = (type, callback) =>
        video.addEventListener(type, callback, {
          signal: this.listeners.signal,
        });
      listen("loadedmetadata", () => CabinViewport.frame(video));
      listen("playing", () => {
        if (!this.enabled) {
          video.pause();
          return;
        }
        if (video === this.current) this.setState("playing");
      });
      listen("waiting", () => {
        if (this.enabled && video === this.current && this.state !== "blocked")
          this.setState("loading");
      });
      listen("error", () => {
        if (video === this.current) this.setState("error");
      });
      listen("timeupdate", () => {
        if (!this.enabled || video !== this.current || this.switching) return;
        const end = Math.min(
          Number(video.dataset.previewTime || 0) +
            this.clips[this.clip].seconds,
          video.duration || Infinity,
        );
        if (video.currentTime >= end - 0.12) this.next();
      });
      listen("ended", () => {
        if (this.enabled && video === this.current) this.next();
      });
      CabinViewport.frame(video);
    });
  }
  get current() {
    return this.videos[this.front];
  }
  setState(state) {
    if (state === this.state) return;
    this.state = this.container.dataset.playback = state;
    document.dispatchEvent(new Event("trailerstatechange"));
  }
  assign(video, clip) {
    video.style.objectFit = clip.fit || "cover";
    video.dataset.windowFocusX = String(clip.windowFocus?.x ?? 0.5);
    video.dataset.windowFocusY = String(clip.windowFocus?.y ?? 0.5);
    CabinViewport.frame(video);
    if (video.getAttribute("src") === clip.src) return;
    FilmFrames.reset(video);
    CabinViewport.clear(video);
    video.parentElement.classList.remove("is-ready");
    video.preload = "auto";
    video.src = clip.src;
    video.load();
  }
  async prepareVideo(video, rewind = false) {
    const generation = this.generation,
      src = video.getAttribute("src");
    const ready = rewind
      ? await FilmFrames.rewind(video)
      : await FilmFrames.prepare(video);
    if (generation !== this.generation || src !== video.getAttribute("src"))
      return false;
    if (ready) {
      video.parentElement.classList.add("is-ready");
      CabinViewport.frame(video);
      CabinViewport.paint(video);
    }
    return ready;
  }
  async prepare() {
    this.assign(this.current, this.clips[this.clip]);
    this.setState("loading");
    const generation = this.generation;
    const ready = await this.prepareVideo(this.current);
    if (generation !== this.generation) return false;
    this.setState(ready ? (this.enabled ? "loading" : "ready") : "error");
    return ready;
  }
  async play(video) {
    if (
      !this.enabled ||
      video._starting ||
      !video.paused ||
      video.error ||
      ["blocked", "error"].includes(this.state)
    )
      return;
    video._starting = true;
    const generation = this.generation;
    try {
      if (!(await this.prepareVideo(video))) {
        if (this.enabled && generation === this.generation)
          this.setState("error");
        return;
      }
      if (!this.enabled || generation !== this.generation) return;
      await video.play();
      if (!this.enabled) video.pause();
    } catch (error) {
      if (
        error.name !== "AbortError" &&
        this.enabled &&
        generation === this.generation
      )
        this.setState(error.name === "NotAllowedError" ? "blocked" : "error");
    } finally {
      video._starting = false;
    }
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.videos.forEach((video) => video.pause());
      return;
    }
    this.assign(this.current, this.clips[this.clip]);
    this.play(this.current);
    if (this.clips.length > 1) {
      const next = this.videos[1 - this.front];
      this.assign(next, this.clips[(this.clip + 1) % this.clips.length]);
      this.prepareVideo(next);
    }
  }
  async next() {
    if (this.switching || !this.enabled) return;
    this.switching = true;
    const generation = this.generation;
    const outgoing = this.current;
    if (this.clips.length === 1) {
      outgoing.pause();
      await this.prepareVideo(outgoing, true);
      if (generation !== this.generation) return;
      this.switching = false;
      this.play(outgoing);
      return;
    }
    const nextIndex = (this.clip + 1) % this.clips.length;
    const incoming = this.videos[1 - this.front];
    this.assign(incoming, this.clips[nextIndex]);
    const ready = await this.prepareVideo(incoming, true);
    if (generation !== this.generation) return;
    if (!this.enabled) {
      this.switching = false;
      return;
    }
    if (!ready) {
      await this.prepareVideo(outgoing, true);
      this.switching = false;
      this.play(outgoing);
      return;
    }
    this.front = 1 - this.front;
    this.clip = nextIndex;
    this.container.dataset.shot = String(nextIndex);
    outgoing.parentElement.classList.add("trailer-underlay");
    outgoing.parentElement.classList.remove("trailer-front");
    outgoing.classList.remove("trailer-front");
    incoming.parentElement.classList.add("trailer-front");
    incoming.classList.add("trailer-front");
    this.play(incoming);
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      outgoing.pause();
      outgoing.parentElement.classList.remove("trailer-underlay");
      this.switching = false;
    }, 750);
    this.timers.add(timer);
  }
  retry() {
    FilmFrames.reset(this.current);
    this.current.load();
    this.setState("loading");
    this.setEnabled(true);
  }
  unload() {
    this.enabled = false;
    if (!this.videos.some((video) => video.hasAttribute("src"))) return;
    this.generation++;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.switching = false;
    this.front = this.clip = 0;
    this.videos.forEach((video, index) => {
      FilmFrames.reset(video);
      CabinViewport.clear(video);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.classList.toggle("trailer-front", index === 0);
      video.parentElement.classList.remove("is-ready", "trailer-underlay");
      video.parentElement.classList.toggle("trailer-front", index === 0);
    });
    this.container.removeAttribute("data-shot");
    this.setState("idle");
  }
  destroy() {
    this.unload();
    this.listeners.abort();
    this.generation++;
    this.videos.forEach((video) => CabinViewport.detach(video));
    this.container.replaceChildren(this.videos[0]);
  }
}

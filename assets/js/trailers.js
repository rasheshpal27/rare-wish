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

// Two buffers keep a decoded frame on screen while the next shot is loading.
// A short real-footage edit is assembled in the player; no simulated camera pan.
class DestinationTrailer {
  constructor(container, slug, film = TRAILERS[slug]) {
    this.container = container;
    this.slug = slug;
    this.clips = film.clips;
    this.enabled = false;
    this.front = 0;
    this.clip = 0;
    this.switching = false;
    this.state = "idle";
    this.generation = 0;
    this.timers = new Set();
    this.listeners = new AbortController();
    const first = container.querySelector("video");
    const second = first.cloneNode(false);
    second.removeAttribute("id");
    container.append(second);
    this.videos = [first, second];
    this.videos.forEach((video, i) => {
      video.removeAttribute("src");
      video.removeAttribute("poster");
      delete video.dataset.frameReady;
      video.replaceChildren();
      video.removeAttribute("autoplay"); // Enabled explicitly; inactive scenes never autoplay.
      video.loop = this.clips.length === 1;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.preload = "none";
      const listen = (type, handler) =>
        video.addEventListener(type, handler, {
          signal: this.listeners.signal,
        });
      video.classList.add("trailer-shot");
      video.classList.toggle("trailer-front", i === 0);
      listen("loadedmetadata", () => CabinViewport.frame(video));
      listen("loadeddata", () => {
        video.dataset.frameReady = "true";
      });
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
      listen("canplay", () => {
        if (this.enabled && video === this.current) this.play(video);
      });
      listen("error", () => {
        if (video === this.current) this.setState("error");
      });
      listen("timeupdate", () => {
        if (!this.enabled || video !== this.current || this.switching) return;
        const end = Math.min(
          this.clips[this.clip].seconds,
          video.duration || Infinity,
        );
        if (video.currentTime >= end - 0.15) this.next();
      });
      listen("ended", () => {
        if (this.enabled && video === this.current) this.next();
      });
    });
    this.videos.forEach((video) => CabinViewport.frame(video));
  }
  get current() {
    return this.videos[this.front];
  }
  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.container.dataset.playback = state;
    document.dispatchEvent(new Event("trailerstatechange"));
  }
  assign(video, clip) {
    // Optional focal point per shot. Defaults keep the center of the original
    // composition visible through the main window, including its decoded opening frame.
    video.style.objectFit = clip.fit || "cover";
    video.dataset.windowFocusX = String(clip.windowFocus?.x ?? 0.5);
    video.dataset.windowFocusY = String(clip.windowFocus?.y ?? 0.5);
    CabinViewport.frame(video);
    if (video.getAttribute("src") === clip.src) return;
    delete video.dataset.frameReady;
    video.preload = "auto";
    video.src = clip.src;
    video.load();
  }
  waitForFrame(video, timeout = 8000) {
    if (video.readyState >= 2 && !video.seeking) return Promise.resolve(true);
    if (video.error) return Promise.resolve(false);
    return new Promise((resolve) => {
      let timer;
      const finish = (event) => {
        if (event && !video.error && (video.readyState < 2 || video.seeking))
          return;
        clearTimeout(timer);
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("seeked", finish);
        this.listeners.signal.removeEventListener("abort", cancel);
        video.removeEventListener("error", finish);
        resolve(video.readyState >= 2 && !video.seeking);
      };
      const cancel = () => finish();
      this.listeners.signal.addEventListener("abort", cancel, { once: true });
      video.addEventListener("loadeddata", finish);
      video.addEventListener("seeked", finish);
      video.addEventListener("error", finish);
      timer = setTimeout(finish, timeout);
    });
  }
  async prepare() {
    this.assign(this.current, this.clips[this.clip]);
    if (this.current.readyState < 2) this.setState("loading");
    const generation = this.generation;
    const ready = await this.waitForFrame(this.current);
    if (generation !== this.generation) return false;
    if (!ready && this.current.readyState < 2)
      this.setState(this.current.error ? "error" : "loading");
    return ready;
  }
  async play(video) {
    // A browser denial stays actionable until the visitor explicitly retries.
    // Late canplay/visibility events must not race the Play button into Pause.
    if (
      !this.enabled ||
      !video.paused ||
      video.error ||
      this.state === "blocked"
    )
      return;
    try {
      await video.play();
      if (!this.enabled) video.pause();
    } catch (error) {
      if (error.name === "AbortError" || !this.enabled) return;
      this.setState(error.name === "NotAllowedError" ? "blocked" : "error");
    }
  }
  setEnabled(enabled) {
    const changed = this.enabled !== enabled;
    this.enabled = enabled;
    if (!enabled) {
      this.videos.forEach((video) => video.pause());
      return;
    }
    this.assign(this.current, this.clips[this.clip]);
    this.play(this.current);
    // Buffer just the next shot of the visible trailer, never every destination.
    if (
      this.clips.length > 1 &&
      (changed || !this.videos[1 - this.front].getAttribute("src"))
    ) {
      this.assign(
        this.videos[1 - this.front],
        this.clips[(this.clip + 1) % this.clips.length],
      );
    }
  }
  async next() {
    if (this.switching || !this.enabled || this.clips.length === 1) return;
    this.switching = true;
    const generation = this.generation;
    const nextIndex = (this.clip + 1) % this.clips.length;
    const outgoing = this.current;
    const incoming = this.videos[1 - this.front];
    this.assign(incoming, this.clips[nextIndex]);
    // Seek while hidden, then wait for the post-seek decoded frame.
    // Seeking after revealing the buffer causes a visible empty-frame flash.
    if (incoming.readyState >= 1) incoming.currentTime = 0;
    const ready = await this.waitForFrame(incoming);
    if (generation !== this.generation) return;
    if (!this.enabled) {
      this.switching = false;
      return;
    }
    if (!ready) {
      // Keep the actual outgoing footage rather than substituting a moving photo.
      outgoing.currentTime = 0;
      this.play(outgoing);
      this.switching = false;
      return;
    }
    this.front = 1 - this.front;
    this.clip = nextIndex;
    this.container.dataset.shot = String(nextIndex);
    incoming.classList.add("trailer-front");
    outgoing.classList.add("trailer-underlay");
    outgoing.classList.remove("trailer-front");
    this.play(incoming);
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      outgoing.pause();
      outgoing.classList.remove("trailer-underlay");
      this.switching = false;
    }, 400);
    this.timers.add(timer);
  }
  retry() {
    this.current.load();
    this.setState("loading");
    this.setEnabled(true);
  }
  unload() {
    this.enabled = false;
    if (
      !this.videos.some(
        (video) => video.hasAttribute("src") || video.hasAttribute("poster"),
      )
    )
      return;
    this.generation++;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.switching = false;
    this.front = this.clip = 0;
    this.videos.forEach((video, index) => {
      video.pause();
      video.removeAttribute("src");
      video.removeAttribute("poster");
      delete video.dataset.frameReady;
      video.load();
      video.classList.remove("trailer-underlay");
      video.classList.toggle("trailer-front", index === 0);
    });
    this.container.removeAttribute("data-shot");
    this.setState("idle");
  }
  destroy() {
    this.enabled = false;
    this.listeners.abort();
    this.generation++;
    this.timers.forEach(clearTimeout);
    this.videos.forEach((video) => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });
    this.videos[1].remove();
  }
}

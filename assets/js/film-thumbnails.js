/* Thumbnails are paused decoded opening frames, never unrelated photographs.
   Only visible cards request media, and only after video opt-in/default entry. */
class FilmThumbnails {
  constructor() {
    this.enabled = false;
    this.visible = new Set();
    this.initialized = new WeakSet();
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) this.visible.add(target);
          else {
            this.visible.delete(target);
            this.unload(target);
          }
        });
        this.sync(this.enabled);
      },
      { threshold: 0.05 },
    );
  }
  observe(root) {
    root.querySelectorAll("video[data-film-thumbnail]").forEach((video) => {
      video.muted = video.defaultMuted = true;
      video.playsInline = true;
      video.preload = "none";
      if (!this.initialized.has(video)) {
        this.initialized.add(video);
        video.addEventListener("loadedmetadata", () => {
          // A tiny seek asks Safari for the opening decoded frame too.
          if (video.currentTime === 0) video.currentTime = 0.001;
        });
        const reveal = () => {
          if (video.readyState >= 2) video.dataset.ready = "true";
        };
        video.addEventListener("loadeddata", reveal);
        video.addEventListener("seeked", reveal);
        video.addEventListener("error", () => {
          video.dataset.ready = "false";
          const label = video.nextElementSibling;
          if (label?.classList.contains("film-thumbnail-label"))
            label.textContent = "Film preview unavailable";
        });
      }
      this.observer.observe(video);
    });
  }
  release(root) {
    root.querySelectorAll("video[data-film-thumbnail]").forEach((video) => {
      this.observer.unobserve(video);
      this.visible.delete(video);
      this.unload(video);
    });
  }
  unload(video) {
    if (!video.hasAttribute("src")) return;
    video.pause();
    video.removeAttribute("src");
    delete video.dataset.ready;
    video.load();
  }
  sync(enabled) {
    this.enabled = enabled;
    for (const video of this.visible) {
      if (!video.isConnected) {
        this.visible.delete(video);
        continue;
      }
      const dialog = video.closest("dialog");
      const modal = document.querySelector("dialog[open]");
      const exposed =
        video.getClientRects().length && (!modal || modal === dialog);
      if (!enabled || !exposed) {
        this.unload(video);
        continue;
      }
      if (!video.hasAttribute("src")) {
        video.preload = "metadata";
        video.src = video.dataset.filmThumbnail;
        video.load();
      }
    }
  }
}

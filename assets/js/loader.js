/* Independent, fail-open welcome. Healthy app waits for a choice, never a video. */
(() => {
  const root = document.documentElement;
  root.classList.add("js-loading");
  const started = performance.now();
  let closed = false,
    ready = false,
    chosen = false,
    watchdog;
  const preferences = {
    video: !matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
  const release = () => {
    root.classList.remove("js-loading", "loader-leaving");
    document.querySelectorAll("[data-loader-inert]").forEach((element) => {
      element.inert = false;
      element.removeAttribute("data-loader-inert");
    });
    document.dispatchEvent(new Event("introfinished"));
    if (document.activeElement?.closest("#site-loader"))
      document
        .querySelector(
          document.getElementById("home")?.hidden
            ? "#destination-page"
            : "#take-dive",
        )
        ?.focus({ preventScroll: true });
  };
  const dismiss = (immediate = false) => {
    if (closed) return;
    closed = true;
    clearTimeout(watchdog);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay =
      immediate || reduced
        ? 0
        : Math.max(0, 1100 - (performance.now() - started));
    setTimeout(() => {
      root.classList.add("loader-leaving");
      setTimeout(release, immediate || reduced ? 0 : 500);
    }, delay);
  };
  const finish = () => {
    ready = true;
    clearTimeout(watchdog); // Healthy welcome waits indefinitely for the user's decision.
    if (chosen) dismiss();
  };
  window.RareWishIntro = {
    finish,
    preferences,
    status(message) {
      const text = document.getElementById("loader-status");
      if (text && !closed) text.textContent = message;
    },
  };
  // App/script failures cannot strand the visitor; music remains off.
  watchdog = setTimeout(() => dismiss(true), 7000);
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      if (!root.classList.contains("js-loading")) return;
      for (const child of document.body.children) {
        if (
          child.id !== "site-loader" &&
          child.tagName !== "SCRIPT" &&
          !child.inert
        ) {
          child.inert = true;
          child.setAttribute("data-loader-inert", "");
        }
      }
      const checkbox = document.getElementById("intro-video");
      checkbox.checked = preferences.video;
      if (!preferences.video)
        document.getElementById("intro-video-note").textContent =
          "Your device requests reduced motion. Enable video here if you prefer; camera transitions remain reduced.";
      checkbox.addEventListener("change", () => {
        preferences.video = checkbox.checked;
      });
      const choose = (music) => {
        if (closed || chosen) return;
        chosen = true;
        preferences.video = checkbox.checked;
        window.RareWishMusic?.setEnabled(music);
        document.dispatchEvent(new Event("mediapreferenceschange"));
        // Explicit entry is also an escape hatch if the app is still starting.
        dismiss(!ready);
      };
      document
        .getElementById("enter-with-music")
        .addEventListener("click", () => choose(true));
      document
        .getElementById("skip-intro")
        .addEventListener("click", () => choose(false));
      document.getElementById("skip-intro").focus();
      document
        .getElementById("site-loader")
        .addEventListener("keydown", (event) => {
          if (event.key === "Escape") choose(false);
          if (event.key !== "Tab") return;
          const controls = [
            ...document.querySelectorAll(
              "#site-loader input, #site-loader button",
            ),
          ];
          const first = controls[0],
            last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        });
    },
    { once: true },
  );
})();

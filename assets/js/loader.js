/* Tiny independent bootstrap: if the app or a video fails, never trap the page. */
(() => {
  const root = document.documentElement;
  root.classList.add("js-loading");
  const started = performance.now();
  let closed = false;
  let watchdog;
  const release = () => {
    root.classList.remove("js-loading", "loader-leaving");
    document.querySelectorAll("[data-loader-inert]").forEach((element) => {
      element.inert = false;
      element.removeAttribute("data-loader-inert");
    });
    document.dispatchEvent(new Event("introfinished"));
  };
  const finish = (immediate = false) => {
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
  window.RareWishIntro = {
    finish,
    status(message) {
      const text = document.getElementById("loader-status");
      if (text && !closed) text.textContent = message;
    },
  };
  watchdog = setTimeout(() => finish(true), 7000);
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
      document
        .getElementById("skip-intro")
        ?.addEventListener("click", () => finish(true));
    },
    { once: true },
  );
})();

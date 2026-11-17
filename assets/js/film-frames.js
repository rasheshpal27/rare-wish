/* Inspect decoded frames in the visitor's browser. No generated poster images.
   Black/fade-in frames and unreadable/CORS-blocked frames are never thumbnails. */
const FilmFrames = (() => {
  const records = new WeakMap(),
    openings = new Map();
  const sample = document.createElement("canvas");
  sample.width = 64;
  sample.height = 36;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  function inspect(video) {
    if (video.readyState < 2 || !video.videoWidth || video.seeking)
      return false;
    try {
      ctx.drawImage(video, 0, 0, 64, 36);
      const pixels = ctx.getImageData(0, 0, 64, 36).data;
      let light = 0,
        total = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const value =
          0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
        total += value;
        if (value > 18) light++;
      }
      return light / (64 * 36) > 0.015 && total / (64 * 36) > 3;
    } catch {
      sample.width = 64; // Reset a canvas tainted by a non-CORS source.
      // Fail closed: a neutral branded placeholder is better than a black preview.
      return false;
    }
  }
  function wait(video, event, signal, timeout = 3000) {
    return new Promise((resolve) => {
      let timer;
      const finish = () => {
        clearTimeout(timer);
        video.removeEventListener(event, finish);
        video.removeEventListener("error", finish);
        signal.removeEventListener("abort", finish);
        resolve(!signal.aborted && !video.error);
      };
      video.addEventListener(event, finish, { once: true });
      video.addEventListener("error", finish, { once: true });
      signal.addEventListener("abort", finish, { once: true });
      timer = setTimeout(finish, timeout);
      if (signal.aborted || video.error) finish();
    });
  }
  async function seek(video, time, signal) {
    if (signal.aborted || video.error) return false;
    if (
      Math.abs(video.currentTime - time) < 0.015 &&
      video.readyState >= 2 &&
      !video.seeking
    )
      return true;
    const done = wait(video, "seeked", signal);
    try {
      video.currentTime = time;
    } catch {
      return false;
    }
    await done;
    return !signal.aborted && !video.seeking && video.readyState >= 2;
  }
  function reset(video) {
    records.get(video)?.controller.abort();
    records.delete(video);
    delete video.dataset.frameReady;
    delete video.dataset.previewTime;
  }
  function prepare(video) {
    const src = video.getAttribute("src");
    if (!src) return Promise.resolve(false);
    const previous = records.get(video);
    if (previous?.src === src) return previous.promise;
    reset(video);
    const controller = new AbortController();
    const record = { src, controller };
    records.set(video, record);
    record.promise = (async () => {
      const signal = controller.signal;
      const watchdog = setTimeout(() => controller.abort(), 12000);
      try {
        video.pause();
        if (video.readyState < 2) await wait(video, "loadeddata", signal, 8000);
        if (signal.aborted || video.error || video.readyState < 2) return false;
        const duration = Number.isFinite(video.duration) ? video.duration : 20;
        const candidates = [
          openings.get(src),
          0.04,
          0.35,
          0.8,
          1.4,
          2.2,
          3.5,
          5,
          8,
          12,
          18,
        ].filter(
          (t, i, all) =>
            t !== undefined && t < duration - 0.05 && all.indexOf(t) === i,
        );
        for (const time of candidates) {
          if (signal.aborted) return false;
          if ((await seek(video, time, signal)) && inspect(video)) {
            if (signal.aborted) return false;
            video.dataset.frameReady = "true";
            video.dataset.previewTime = String(time);
            openings.set(src, time);
            video.dispatchEvent(new Event("filmframeready"));
            return true;
          }
        }
        return false;
      } finally {
        clearTimeout(watchdog);
      }
    })();
    return record.promise;
  }
  return { inspect, prepare, reset };
})();

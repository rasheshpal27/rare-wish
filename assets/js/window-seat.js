/* The cabin photo and its aperture mask share this 1376 × 768 coordinate space.
   Every film uses a full-source, aspect-preserving safe view in the main glass.
   A softened live frame fills the remaining glass; no guessed subject crop. */
const CabinViewport = {
  artwork: { width: 1376, height: 768 },
  primary: { x: 923, y: 430, width: 176, height: 282, bottom: 573 },
  apertures: { left: 834, top: 257, right: 1376, bottom: 602 },
  geometry(stage) {
    const width = stage.clientWidth,
      height = stage.clientHeight;
    const scale = Math.max(
      width / this.artwork.width,
      height / this.artwork.height,
    );
    const position =
      parseFloat(
        getComputedStyle(stage).getPropertyValue("--cabin-position-x"),
      ) / 100 || 0.5;
    const offsetX = (width - this.artwork.width * scale) * position;
    const offsetY = (height - this.artwork.height * scale) * 0.5;
    return {
      x: this.primary.x * scale + offsetX,
      y: this.primary.y * scale + offsetY,
      width: this.primary.width * scale,
      height: this.primary.height * scale,
      bottom: this.primary.bottom * scale + offsetY,
      // Cover only visible glass. An off-screen second aperture must not
      // magnify the subject in the primary window on phones.
      bounds: {
        left: Math.max(0, this.apertures.left * scale + offsetX),
        right: Math.min(width, this.apertures.right * scale + offsetX),
        top: Math.max(0, this.apertures.top * scale + offsetY),
        bottom: Math.min(height, this.apertures.bottom * scale + offsetY),
      },
    };
  },
  frame(video) {
    const stage = video.closest(".cabin-view");
    if (!stage || !stage.clientWidth || !stage.clientHeight) return;
    const aspect =
      video.videoWidth && video.videoHeight
        ? video.videoWidth / video.videoHeight
        : 16 / 9;
    const safe = this.subjectRect(stage, aspect);
    Object.assign(video.style, {
      left: `${safe.left}px`,
      top: `${safe.top}px`,
      width: `${safe.width}px`,
      height: `${safe.height}px`,
    });
  },
  // An inscribed rectangle stays clear of the rounded glass edges. Fit the
  // WHOLE source into it so a car/horse/gorilla anywhere in the shot stays visible.
  subjectRect(stage, aspect) {
    const g = this.geometry(stage);
    const width = Math.min(g.width * 0.96, g.height * 0.66 * aspect);
    const height = width / aspect;
    return { left: g.x - width / 2, top: g.y - height / 2, width, height };
  },
  attach(video) {
    if (!video.closest(".cabin-view") || video._windowCanvas) return;
    const canvas = document.createElement("canvas");
    canvas.className = "window-composite";
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = canvas.height = 0;
    video.after(canvas);
    video._windowCanvas = canvas;
    video._windowInset = document.createElement("canvas");
    video.classList.add("window-source");
    const listeners = new AbortController();
    video._windowListeners = listeners;
    const draw = () => this.paint(video);
    ["loadeddata", "seeked", "filmframeready"].forEach((event) =>
      video.addEventListener(event, draw, { signal: listeners.signal }),
    );
    let lastPaint = 0;
    const tick = (now = 0) => {
      if (!video.isConnected) return;
      if (!lastPaint || now - lastPaint >= 32) {
        this.paint(video);
        lastPaint = now;
      }
      if (!video.paused)
        video._windowCallback = video.requestVideoFrameCallback?.(tick);
    };
    video.addEventListener(
      "playing",
      () => {
        if (video._windowCallback)
          video.cancelVideoFrameCallback?.(video._windowCallback);
        tick();
      },
      { signal: listeners.signal },
    );
    // requestVideoFrameCallback is preferred. Older engines use timeupdate.
    video.addEventListener(
      "timeupdate",
      () => {
        if (!video.requestVideoFrameCallback) draw();
      },
      { signal: listeners.signal },
    );
  },
  paint(video) {
    const canvas = video._windowCanvas,
      stage = video.closest(".cabin-view");
    if (
      !canvas ||
      !stage ||
      video.dataset.frameReady !== "true" ||
      !FilmFrames.inspect(video)
    )
      return;
    const screen = stage.getBoundingClientRect();
    if (screen.bottom <= 0 || screen.top >= innerHeight) return;
    const g = this.geometry(stage),
      bounds = g.bounds;
    const w = bounds.right - bounds.left,
      h = bounds.bottom - bounds.top;
    if (w <= 0 || h <= 0) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    const cw = Math.ceil(w * ratio),
      ch = Math.ceil(h * ratio);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    Object.assign(canvas.style, {
      left: `${bounds.left}px`,
      top: `${bounds.top}px`,
      width: `${w}px`,
      height: `${h}px`,
    });
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const aspect = video.videoWidth / video.videoHeight;
    const coverW = Math.max(w + 40, (h + 40) * aspect),
      coverH = coverW / aspect;
    context.filter = "blur(18px) brightness(.75)";
    context.drawImage(
      video,
      (w - coverW) / 2,
      (h - coverH) / 2,
      coverW,
      coverH,
    );
    context.filter = "none";
    const safe = this.subjectRect(stage, aspect);
    // Full source, no source crop. A softer live surround avoids black bars.
    const inset = video._windowInset;
    const iw = Math.ceil(safe.width * ratio),
      ih = Math.ceil(safe.height * ratio);
    if (inset.width !== iw || inset.height !== ih) {
      inset.width = iw;
      inset.height = ih;
    }
    const layer = inset.getContext("2d");
    layer.clearRect(0, 0, iw, ih);
    layer.globalCompositeOperation = "source-over";
    layer.drawImage(video, 0, 0, iw, ih);
    // Feather just the edge into the live surround instead of a hard video box.
    layer.globalCompositeOperation = "destination-in";
    for (const [x, y, edge] of [
      [iw, 0, 0.025],
      [0, ih, 0.08],
    ]) {
      const fade = layer.createLinearGradient(0, 0, x, y);
      fade.addColorStop(0, "transparent");
      fade.addColorStop(edge, "white");
      fade.addColorStop(1 - edge, "white");
      fade.addColorStop(1, "transparent");
      layer.fillStyle = fade;
      layer.fillRect(0, 0, iw, ih);
    }
    context.drawImage(
      inset,
      safe.left - bounds.left,
      safe.top - bounds.top,
      safe.width,
      safe.height,
    );
    canvas.dataset.frameTime = String(video.currentTime);
  },
  clear(video) {
    if (video._windowCallback)
      video.cancelVideoFrameCallback?.(video._windowCallback);
    video._windowCallback = null;
    if (video._windowCanvas)
      video._windowCanvas.width = video._windowCanvas.height = 0;
    if (video._windowInset)
      video._windowInset.width = video._windowInset.height = 0;
  },
  detach(video) {
    this.clear(video);
    video._windowListeners?.abort();
    video._windowCanvas?.remove();
    delete video._windowCanvas;
    delete video._windowInset;
    video.classList.remove("window-source");
  },
  copy(source, target) {
    this.attach(target);
    const from = source._windowCanvas,
      to = target._windowCanvas;
    if (!from?.width || !to) return;
    to.width = from.width;
    to.height = from.height;
    to.style.cssText = from.style.cssText;
    to.getContext("2d").drawImage(from, 0, 0);
  },
  layout(stage) {
    stage.querySelectorAll("video").forEach((video) => {
      this.frame(video);
      this.paint(video);
    });
  },
};

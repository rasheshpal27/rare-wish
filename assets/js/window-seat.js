/* The cabin photo and its aperture mask share this 1376 × 768 coordinate space.
   Project ONE continuous landscape behind both openings, with the primary
   window centered on the shot's focal point, not on the browser viewport. */
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
      // Include both physical apertures, even when the second is off screen.
      // This keeps the panorama's scale consistent as the viewport resizes.
      bounds: {
        left: this.apertures.left * scale + offsetX,
        right: this.apertures.right * scale + offsetX,
        top: this.apertures.top * scale + offsetY,
        bottom: this.apertures.bottom * scale + offsetY,
      },
    };
  },
  frame(video) {
    const stage = video.closest(".cabin-view");
    if (!stage || !stage.clientWidth || !stage.clientHeight) return;
    const geometry = this.geometry(stage);
    const focusX = Math.max(
      0.1,
      Math.min(0.9, Number(video.dataset.windowFocusX) || 0.5),
    );
    const focusY = Math.max(
      0.1,
      Math.min(0.9, Number(video.dataset.windowFocusY) || 0.5),
    );
    const aspect =
      video.videoWidth && video.videoHeight
        ? video.videoWidth / video.videoHeight
        : 16 / 9;
    // Small overscan hides subpixel seams, without stretching the landscape or
    // repeating the same centered picture separately in every window.
    const bounds = geometry.bounds,
      bleed = 2;
    const width = Math.max(
      (geometry.x - bounds.left + bleed) / focusX,
      (bounds.right - geometry.x + bleed) / (1 - focusX),
      ((geometry.y - bounds.top + bleed) / focusY) * aspect,
      ((bounds.bottom - geometry.y + bleed) / (1 - focusY)) * aspect,
    );
    const height = width / aspect;
    Object.assign(video.style, {
      left: `${geometry.x - width * focusX}px`,
      top: `${geometry.y - height * focusY}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  },
  layout(stage) {
    stage.querySelectorAll("video").forEach((video) => this.frame(video));
  },
};

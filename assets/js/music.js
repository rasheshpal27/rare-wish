/* A light, original major-key travel motif. Soft plucks, no bass drones. No audio requests or tracking.
   AudioContext is created/resumed only by an explicit music opt-in gesture. */
(() => {
  let context,
    master,
    timer,
    enabled = false,
    failed = false,
    phrase = 0,
    revision = 0;
  // G4–G5, C-major pentatonic: airy and consonant, with space between phrases.
  const melodies = [
    [392, 523.25, 659.25, 783.99, 659.25, 523.25, 440, 523.25],
    [523.25, 587.33, 659.25, 523.25, 783.99, 659.25, 587.33, 523.25],
    [440, 523.25, 659.25, 587.33, 523.25, 440, 392, 523.25],
  ];
  const active = new Set();
  function paint() {
    document.querySelectorAll("[data-music-toggle]").forEach((button) => {
      button.textContent = failed
        ? "Music unavailable · Retry"
        : enabled
          ? "Music on ♫"
          : "Music off ♫";
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute(
        "aria-label",
        failed
          ? "Retry ambient music"
          : enabled
            ? "Turn music off"
            : "Turn music on",
      );
    });
  }
  function schedule() {
    if (!enabled || document.hidden || context?.state !== "running") return;
    const now = context.currentTime;
    melodies[phrase].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      const start = now + index * 0.65;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(0.12, start + 0.035);
      envelope.gain.exponentialRampToValueAtTime(0.001, start + 1.8);
      oscillator.connect(envelope).connect(master);
      active.add(oscillator);
      oscillator.onended = () => {
        active.delete(oscillator);
        oscillator.disconnect();
        envelope.disconnect();
      };
      oscillator.start(start);
      oscillator.stop(start + 1.9);
    });
    phrase = (phrase + 1) % melodies.length;
  }
  function stopNotes() {
    clearInterval(timer);
    active.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {}
    });
    active.clear();
  }
  async function sync() {
    const version = ++revision;
    stopNotes();
    if (!context) return;
    try {
      if (!enabled || document.hidden) {
        await context.suspend();
      } else {
        await context.resume();
        if (version !== revision || !enabled || document.hidden) return;
        if (context.state !== "running") throw new Error("Audio blocked");
        schedule();
        timer = setInterval(schedule, 6000);
      }
    } catch {
      if (version !== revision) return;
      enabled = false;
      failed = true;
      stopNotes();
    }
    paint();
  }
  function setEnabled(value) {
    enabled = value;
    failed = false;
    if (value && !context) {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        context = new Audio();
        master = context.createGain();
        master.gain.value = 0.16;
        master.connect(context.destination);
      } catch {
        enabled = false;
        failed = true;
      }
    }
    paint();
    return sync();
  }
  window.RareWishMusic = {
    setEnabled,
    get enabled() {
      return enabled;
    },
    get state() {
      return context?.state || "uninitialized";
    },
  };
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-music-toggle]")) setEnabled(!enabled);
  });
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("pagehide", () => {
    stopNotes();
    context?.suspend().catch(() => {});
  });
  window.addEventListener("pageshow", sync);
})();

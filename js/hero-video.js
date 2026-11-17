// Browsers may block autoplay (low-power mode, data saver, tab in background)
// and then show a native play overlay. Keep retrying silently instead.
export function initHeroVideo() {
  const video = document.querySelector(".hero-video");
  if (!video) return;

  video.muted = true;
  video.controls = false;
  video.disablePictureInPicture = true;

  const tryPlay = () => {
    if (!video.paused) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  tryPlay();
  video.addEventListener("loadedmetadata", tryPlay);
  video.addEventListener("canplay", tryPlay);
  video.addEventListener("pause", () => {
    if (!document.hidden) tryPlay();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlay();
  });
  window.addEventListener("pageshow", tryPlay);

  // Autoplay blocked until the first user gesture: start on any interaction.
  ["click", "touchstart", "keydown", "scroll", "pointerdown"].forEach((evt) =>
    window.addEventListener(
      evt,
      () => {
        tryPlay();
      },
      { once: true, passive: true },
    ),
  );
}

(function initializeInnerPageIntroModule() {
  function clampProgress(value) {
    return Math.min(Math.max(value, 0), 1);
  }

  function getInnerIntroVisualState(value) {
    const progress = clampProgress(value);
    return {
      progress,
      opacity: 1 - progress,
      scale: 1 + progress * 0.025,
      blur: progress * 16,
      brightness: Number((1 - progress * 0.42).toFixed(4)),
      contentShift: (1 - progress) * 10,
      feather: (1 - progress) * 30
    };
  }

  function initInnerPageIntroTransitions(documentRef, windowRef) {
    const wrappers = Array.from(documentRef.querySelectorAll("[data-inner-intro-transition]"));
    if (windowRef.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;

    wrappers.forEach((wrapper) => {
      let animationFrame = 0;

      function update() {
        animationFrame = 0;
        const distance = Math.max(windowRef.innerHeight, 1);
        const state = getInnerIntroVisualState(-wrapper.getBoundingClientRect().top / distance);
        wrapper.style.setProperty("--inner-intro-progress", state.progress.toFixed(4));
        wrapper.style.setProperty("--inner-intro-opacity", state.opacity.toFixed(4));
        wrapper.style.setProperty("--inner-intro-scale", state.scale.toFixed(4));
        wrapper.style.setProperty("--inner-intro-blur", `${state.blur.toFixed(2)}px`);
        wrapper.style.setProperty("--inner-intro-brightness", state.brightness.toFixed(4));
        wrapper.style.setProperty("--inner-intro-content-shift", `${state.contentShift.toFixed(3)}vh`);
        wrapper.style.setProperty("--inner-intro-feather", `${state.feather.toFixed(3)}vh`);
      }

      function scheduleUpdate() {
        if (animationFrame === 0) animationFrame = windowRef.requestAnimationFrame(update);
      }

      wrapper.classList.add("is-scroll-enhanced");
      update();
      windowRef.addEventListener("scroll", scheduleUpdate, { passive: true });
      windowRef.addEventListener("resize", scheduleUpdate);
    });

    return wrappers.length;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { getInnerIntroVisualState, initInnerPageIntroTransitions };
  }

  if (typeof document !== "undefined" && typeof window !== "undefined") {
    const initialize = () => initInnerPageIntroTransitions(document, window);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
      initialize();
    }
  }
})();

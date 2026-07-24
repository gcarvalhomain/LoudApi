(function initializeTeamsIntroModule() {
  const smoothingApi =
    typeof module !== "undefined" && module.exports
      ? require("./scroll-progress-smoothing.js")
      : globalThis.ScrollProgressSmoothing;
  const { clampProgress, createProgressSmoother } = smoothingApi;

  function getTeamsIntroVisualState(value) {
    const progress = clampProgress(value);
    return {
      progress,
      opacity: 1 - progress,
      scale: 1 + progress * 0.025,
      blur: progress * 16,
      brightness: Number((1 - progress * 0.42).toFixed(4)),
      overviewShift: (1 - progress) * 10,
      overviewFeather: (1 - progress) * 30
    };
  }

  function initTeamsIntroTransition(documentRef, windowRef) {
    const transition = documentRef.querySelector(".teams-intro-transition");
    if (
      !transition ||
      windowRef.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return false;
    }

    let transitionStart = 0;
    let transitionDistance = 1;

    function render(progress) {
      const state = getTeamsIntroVisualState(progress);
      transition.style.setProperty("--hero-transition-progress", state.progress.toFixed(4));
      transition.style.setProperty("--hero-transition-opacity", state.opacity.toFixed(4));
      transition.style.setProperty("--hero-transition-scale", state.scale.toFixed(4));
      transition.style.setProperty("--hero-transition-blur", `${state.blur.toFixed(2)}px`);
      transition.style.setProperty(
        "--hero-transition-brightness",
        state.brightness.toFixed(4)
      );
      transition.style.setProperty(
        "--teams-overview-shift",
        `${state.overviewShift.toFixed(3)}vh`
      );
      transition.style.setProperty(
        "--teams-overview-feather",
        `${state.overviewFeather.toFixed(3)}vh`
      );
    }

    const smoother = createProgressSmoother(windowRef, render);

    function measure() {
      transitionStart =
        (windowRef.scrollY || 0) + transition.getBoundingClientRect().top;
      transitionDistance = Math.max(windowRef.innerHeight, 1);
    }

    function target() {
      return clampProgress(
        ((windowRef.scrollY || 0) - transitionStart) / transitionDistance
      );
    }

    function retarget() {
      smoother.setTarget(target());
    }

    function resize() {
      measure();
      smoother.setTarget(target(), { immediate: true });
    }

    transition.classList.add("is-scroll-enhanced");
    measure();
    smoother.setTarget(target(), { immediate: true });
    windowRef.addEventListener("scroll", retarget, { passive: true });
    windowRef.addEventListener("resize", resize);
    return true;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { getTeamsIntroVisualState, initTeamsIntroTransition };
  }

  if (typeof document !== "undefined" && typeof window !== "undefined") {
    const initialize = () => initTeamsIntroTransition(document, window);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
      initialize();
    }
  }
})();

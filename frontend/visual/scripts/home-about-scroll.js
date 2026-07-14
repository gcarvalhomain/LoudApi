(function initializeAboutModule() {
  function clampProgress(value) {
    return Math.min(Math.max(value, 0), 1);
  }

  function getSegmentProgress(progress, start, end) {
    const distance = Math.max(end - start, Number.EPSILON);
    return clampProgress((progress - start) / distance);
  }

  function getIntroVisualState(value) {
    const progress = clampProgress(value);

    return {
      progress,
      heroOpacity: 1 - progress,
      heroScale: 1 + progress * 0.025,
      heroBlur: progress * 16,
      heroBrightness: 1 - progress * 0.42,
      aboutShift: (1 - progress) * 10,
      aboutFeather: (1 - progress) * 30
    };
  }

  function initHomeIntroTransition(documentRef, windowRef) {
    const introTransition = documentRef.querySelector(".home-intro-transition");
    const reducedMotion = windowRef.matchMedia("(prefers-reduced-motion: reduce)");

    if (!introTransition || reducedMotion.matches) {
      return;
    }

    let animationFrame = 0;

    function updateIntroTransition() {
      animationFrame = 0;
      const bounds = introTransition.getBoundingClientRect();
      const distance = Math.max(windowRef.innerHeight, 1);
      const state = getIntroVisualState(-bounds.top / distance);

      introTransition.style.setProperty("--home-intro-progress", state.progress.toFixed(4));
      introTransition.style.setProperty("--home-intro-hero-opacity", state.heroOpacity.toFixed(4));
      introTransition.style.setProperty("--home-intro-hero-scale", state.heroScale.toFixed(4));
      introTransition.style.setProperty("--home-intro-hero-blur", `${state.heroBlur.toFixed(2)}px`);
      introTransition.style.setProperty("--home-intro-hero-brightness", state.heroBrightness.toFixed(4));
      introTransition.style.setProperty("--home-intro-about-shift", `${state.aboutShift.toFixed(3)}vh`);
      introTransition.style.setProperty("--home-intro-about-feather", `${state.aboutFeather.toFixed(3)}vh`);
    }

    function scheduleIntroTransitionUpdate() {
      if (animationFrame === 0) {
        animationFrame = windowRef.requestAnimationFrame(updateIntroTransition);
      }
    }

    introTransition.classList.add("is-intro-enhanced");
    updateIntroTransition();
    windowRef.addEventListener("scroll", scheduleIntroTransitionUpdate, { passive: true });
    windowRef.addEventListener("resize", scheduleIntroTransitionUpdate);
  }

  function initAboutScroll(documentRef, windowRef) {
    const aboutSection = documentRef.querySelector(".home-about-scroll");
    const reducedMotion = windowRef.matchMedia("(prefers-reduced-motion: reduce)");

    if (!aboutSection || reducedMotion.matches) {
      return;
    }

    const revealItems = aboutSection.querySelectorAll(".home-about-reveal");
    let animationFrame = 0;

    function updateAboutScroll() {
      animationFrame = 0;
      const bounds = aboutSection.getBoundingClientRect();
      const scrollDistance = Math.max(aboutSection.offsetHeight - windowRef.innerHeight, 1);
      const progress = clampProgress(-bounds.top / scrollDistance);

      aboutSection.style.setProperty("--about-progress", progress.toFixed(4));
      aboutSection.style.setProperty("--about-panel-shift", `${((1 - progress) * 6).toFixed(3)}vh`);
      aboutSection.style.setProperty("--about-panel-feather", `${((1 - progress) * 22).toFixed(3)}vh`);

      revealItems.forEach((item) => {
        const start = Number(item.dataset.revealStart);
        const end = Number(item.dataset.revealEnd);
        const itemProgress = getSegmentProgress(progress, start, end);

        item.style.setProperty("--about-reveal-opacity", itemProgress.toFixed(4));
        item.style.setProperty("--about-reveal-y", `${((1 - itemProgress) * 34).toFixed(2)}px`);
        item.style.setProperty("--about-reveal-blur", `${((1 - itemProgress) * 10).toFixed(2)}px`);
      });
    }

    function scheduleAboutScrollUpdate() {
      if (animationFrame === 0) {
        animationFrame = windowRef.requestAnimationFrame(updateAboutScroll);
      }
    }

    aboutSection.classList.add("is-scroll-enhanced");
    updateAboutScroll();
    windowRef.addEventListener("scroll", scheduleAboutScrollUpdate, { passive: true });
    windowRef.addEventListener("resize", scheduleAboutScrollUpdate);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      clampProgress,
      getSegmentProgress,
      getIntroVisualState,
      initAboutScroll,
      initHomeIntroTransition
    };
  }

  if (typeof document !== "undefined" && typeof window !== "undefined") {
    const initializeHomeScrollEffects = () => {
      initHomeIntroTransition(document, window);
      initAboutScroll(document, window);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeHomeScrollEffects, { once: true });
    } else {
      initializeHomeScrollEffects();
    }
  }
})();

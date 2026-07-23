(function initializeScrollProgressSmoothing(globalRef) {
  const DEFAULT_RESPONSE = 60;
  const DEFAULT_EPSILON = 0.0005;
  const MAX_FRAME_TIME_MS = 64;

  function clampProgress(value) {
    return Math.min(Math.max(value, 0), 1);
  }

  function interpolateProgress(
    current,
    target,
    elapsedMs,
    response = DEFAULT_RESPONSE,
    epsilon = DEFAULT_EPSILON
  ) {
    const safeCurrent = clampProgress(current);
    const safeTarget = clampProgress(target);
    if (Math.abs(safeTarget - safeCurrent) <= epsilon) return safeTarget;

    const safeElapsed = Math.min(Math.max(elapsedMs, 0), MAX_FRAME_TIME_MS);
    const blend = 1 - Math.exp((-response * safeElapsed) / 1000);
    const next = safeCurrent + (safeTarget - safeCurrent) * blend;

    return Math.abs(safeTarget - next) <= epsilon
      ? safeTarget
      : clampProgress(next);
  }

  function createProgressSmoother(windowRef, render, options = {}) {
    const response = options.response ?? DEFAULT_RESPONSE;
    const epsilon = options.epsilon ?? DEFAULT_EPSILON;
    let current = clampProgress(options.initialValue ?? 0);
    let target = current;
    let frameId = 0;
    let lastTimestamp = 0;

    function animate(timestamp) {
      frameId = 0;
      const elapsedMs = lastTimestamp === 0 ? 1000 / 60 : timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      current = interpolateProgress(current, target, elapsedMs, response, epsilon);
      render(current);

      if (current !== target) {
        frameId = windowRef.requestAnimationFrame(animate);
      } else {
        lastTimestamp = 0;
      }
    }

    function setTarget(value, setOptions = {}) {
      target = clampProgress(value);

      if (setOptions.immediate) {
        if (frameId !== 0) windowRef.cancelAnimationFrame(frameId);
        frameId = 0;
        lastTimestamp = 0;
        current = target;
        render(current);
        return;
      }

      if (frameId === 0 && current !== target) {
        frameId = windowRef.requestAnimationFrame(animate);
      }
    }

    return {
      setTarget,
      getValue: () => current,
      destroy() {
        if (frameId !== 0) windowRef.cancelAnimationFrame(frameId);
        frameId = 0;
        lastTimestamp = 0;
      }
    };
  }

  const api = { clampProgress, interpolateProgress, createProgressSmoother };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    globalRef.ScrollProgressSmoothing = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

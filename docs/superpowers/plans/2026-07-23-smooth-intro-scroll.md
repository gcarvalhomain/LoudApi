# Smooth Intro Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first hero transition on all four frontend pages respond continuously to mouse-wheel and scrollbar movement without changing its current visual states.

**Architecture:** Add a dependency-free shared JavaScript smoother that converts discrete target progress into frame-rate-independent rendered progress. Keep visual-state mapping inside the existing page-specific modules, cache transition geometry outside normal animation frames, and extract the Teams transition from inline HTML into a focused script that uses the same shared smoother.

**Tech Stack:** Static HTML, CSS custom properties, browser `requestAnimationFrame`, CommonJS exports for Node.js built-in test runner, ASP.NET Core static-file host.

## Global Constraints

- Preserve the current images, shadows, layout, direction, scale, blur, brightness, masks, and exact visual states at progress `0` and `1`.
- Add no npm package or runtime dependency.
- Clamp progress to `[0, 1]` and never overshoot.
- Use elapsed-time interpolation so 60 Hz and 120 Hz displays have comparable settling time.
- Begin responding on the first animation frame and settle without elastic bounce.
- Stop requesting frames once the rendered value is within `0.0005` of the target.
- Keep `prefers-reduced-motion: reduce` behavior unchanged.
- Cache element start positions and transition distances; recalculate them only on initialization and resize.
- Do not add or commit the orphan root `package-lock.json`.

---

## File map

- Create `frontend/visual/scripts/scroll-progress-smoothing.js`: pure interpolation plus animation-frame lifecycle.
- Create `frontend/tests/scroll-progress-smoothing.test.cjs`: deterministic unit tests for convergence, timing, boundaries, and cleanup.
- Modify `frontend/visual/scripts/home-about-scroll.js`: smooth only the first home hero transition.
- Modify `frontend/tests/home-about-scroll.test.cjs`: verify immediate initialization, cached geometry, and retargeting.
- Modify `frontend/visual/scripts/inner-page-intro-transition.js`: smooth Market and Tournament through one shared listener pair.
- Modify `frontend/tests/inner-page-intro-transition.test.cjs`: verify independent wrappers and reduced motion.
- Create `frontend/visual/scripts/teams-intro-transition.js`: move Teams intro behavior out of inline HTML.
- Modify `frontend/tests/teams-hero-scroll-transition.test.js`: test the extracted Teams module and HTML wiring.
- Modify `frontend/index.html`, `frontend/teams.html`, `frontend/market.html`, and `frontend/tournament.html`: load the shared smoother before each page-specific transition script.
- No CSS changes are planned because the current visual values must remain identical.

---

### Task 1: Shared frame-rate-independent progress smoother

**Files:**
- Create: `frontend/visual/scripts/scroll-progress-smoothing.js`
- Create: `frontend/tests/scroll-progress-smoothing.test.cjs`

**Interfaces:**
- Consumes: a `windowRef` exposing `requestAnimationFrame` and `cancelAnimationFrame`.
- Produces: `clampProgress(value)`, `interpolateProgress(current, target, elapsedMs, response?, epsilon?)`, and `createProgressSmoother(windowRef, render, options?)`.
- `createProgressSmoother` returns `{ setTarget(value, options?), getValue(), destroy() }`.

- [ ] **Step 1: Write the failing unit tests**

Create `frontend/tests/scroll-progress-smoothing.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clampProgress,
  interpolateProgress,
  createProgressSmoother
} = require("../visual/scripts/scroll-progress-smoothing.js");

function createFrameWindow() {
  let nextId = 1;
  const frames = new Map();

  return {
    requestAnimationFrame(callback) {
      const id = nextId++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
    runFrame(timestamp) {
      const pending = Array.from(frames.values());
      frames.clear();
      pending.forEach((callback) => callback(timestamp));
    },
    pendingFrames() {
      return frames.size;
    }
  };
}

test("clampProgress limits progress to the closed zero-to-one range", () => {
  assert.equal(clampProgress(-0.25), 0);
  assert.equal(clampProgress(0.4), 0.4);
  assert.equal(clampProgress(1.25), 1);
});

test("interpolateProgress converges monotonically without overshoot", () => {
  const forward = interpolateProgress(0.2, 1, 16);
  const backward = interpolateProgress(0.8, 0, 16);
  assert.ok(forward > 0.2 && forward < 1);
  assert.ok(backward < 0.8 && backward > 0);
});

test("elapsed-time interpolation is comparable across refresh rates", () => {
  let at60Hz = 0;
  let at120Hz = 0;

  for (let elapsed = 0; elapsed < 1000; elapsed += 1000 / 60) {
    at60Hz = interpolateProgress(at60Hz, 1, 1000 / 60);
  }

  for (let elapsed = 0; elapsed < 1000; elapsed += 1000 / 120) {
    at120Hz = interpolateProgress(at120Hz, 1, 1000 / 120);
  }

  assert.ok(Math.abs(at60Hz - at120Hz) < 0.002);
});

test("createProgressSmoother renders immediately when requested and then settles", () => {
  const windowRef = createFrameWindow();
  const rendered = [];
  const smoother = createProgressSmoother(windowRef, (value) => rendered.push(value));

  smoother.setTarget(0.25, { immediate: true });
  assert.deepEqual(rendered, [0.25]);

  smoother.setTarget(1);
  for (let frame = 1; frame <= 60 && windowRef.pendingFrames(); frame += 1) {
    windowRef.runFrame(frame * (1000 / 60));
  }

  assert.equal(smoother.getValue(), 1);
  assert.equal(rendered.at(-1), 1);
  assert.equal(windowRef.pendingFrames(), 0);
});

test("retargeting reverses from the rendered value and destroy cancels work", () => {
  const windowRef = createFrameWindow();
  const rendered = [];
  const smoother = createProgressSmoother(windowRef, (value) => rendered.push(value));

  smoother.setTarget(1);
  windowRef.runFrame(16);
  const forwardValue = smoother.getValue();
  smoother.setTarget(0);
  windowRef.runFrame(32);

  assert.ok(smoother.getValue() < forwardValue);
  smoother.setTarget(1);
  smoother.destroy();
  assert.equal(windowRef.pendingFrames(), 0);
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run:

```powershell
node --test .\frontend\tests\scroll-progress-smoothing.test.cjs
```

Expected: FAIL with `Cannot find module '../visual/scripts/scroll-progress-smoothing.js'`.

- [ ] **Step 3: Implement the shared smoother**

Create `frontend/visual/scripts/scroll-progress-smoothing.js`:

```js
(function initializeScrollProgressSmoothing(globalRef) {
  const DEFAULT_RESPONSE = 18;
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
    return Math.abs(safeTarget - next) <= epsilon ? safeTarget : clampProgress(next);
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
```

- [ ] **Step 4: Run the smoother tests**

Run:

```powershell
node --test .\frontend\tests\scroll-progress-smoothing.test.cjs
```

Expected: 5 tests PASS, 0 FAIL.

- [ ] **Step 5: Commit the isolated utility**

```powershell
git add frontend/visual/scripts/scroll-progress-smoothing.js frontend/tests/scroll-progress-smoothing.test.cjs
git commit -m "feat: add smooth scroll progress interpolation"
```

---

### Task 2: Integrate smoothing with Home, Market, and Tournament

**Files:**
- Modify: `frontend/visual/scripts/home-about-scroll.js`
- Modify: `frontend/tests/home-about-scroll.test.cjs`
- Modify: `frontend/visual/scripts/inner-page-intro-transition.js`
- Modify: `frontend/tests/inner-page-intro-transition.test.cjs`
- Modify: `frontend/index.html`
- Modify: `frontend/market.html`
- Modify: `frontend/tournament.html`

**Interfaces:**
- Consumes: `ScrollProgressSmoothing.createProgressSmoother(windowRef, render)`.
- Produces: unchanged CSS custom properties and unchanged visual-state functions.

- [ ] **Step 1: Update tests to require cached geometry and deferred smoothing**

In both test files, replace immediate `requestAnimationFrame` mocks with a queued-frame mock exposing `runFrame(timestamp)`. Give each `windowRef` a mutable `scrollY`.

Add this assertion sequence to the Home intro test after initialization:

```js
assert.equal(properties.get("--home-intro-progress"), "0.5000");
windowRef.scrollY = 1000;
listeners.get("scroll")();
assert.equal(properties.get("--home-intro-progress"), "0.5000");
windowRef.runFrame(16);
assert.ok(Number(properties.get("--home-intro-progress")) > 0.5);
```

Add this test to `frontend/tests/inner-page-intro-transition.test.cjs`:

```js
test("scroll retargets each wrapper and interpolation renders on animation frames", () => {
  const fixture = createInnerIntroFixture([-500, 500]);
  initInnerPageIntroTransitions(fixture.documentRef, fixture.windowRef);

  fixture.windowRef.scrollY = 1000;
  fixture.listeners.get("scroll")();
  assert.equal(fixture.wrappers[0].values["--inner-intro-progress"], "0.5000");

  fixture.windowRef.runFrame(16);
  assert.ok(
    Number(fixture.wrappers[0].values["--inner-intro-progress"]) > 0.5
  );
  assert.equal(fixture.listenerCounts.get("scroll"), 1);
  assert.equal(fixture.listenerCounts.get("resize"), 1);
});
```

The `createInnerIntroFixture` helper must return wrappers, a queued-frame
`windowRef`, listener callbacks, and listener counts so the test verifies one
shared scroll listener rather than one listener per wrapper.

- [ ] **Step 2: Run the three relevant test files**

Run:

```powershell
node --test .\frontend\tests\scroll-progress-smoothing.test.cjs .\frontend\tests\home-about-scroll.test.cjs .\frontend\tests\inner-page-intro-transition.test.cjs
```

Expected: FAIL because the existing transition modules still render the raw
scroll position immediately and register the old listener structure.

- [ ] **Step 3: Integrate the Home intro**

At the start of `home-about-scroll.js`, resolve the shared dependency:

```js
const smoothingApi =
  typeof module !== "undefined" && module.exports
    ? require("./scroll-progress-smoothing.js")
    : globalThis.ScrollProgressSmoothing;
const { createProgressSmoother } = smoothingApi;
```

Replace the direct animation-frame scheduler inside `initHomeIntroTransition`
with:

```js
let transitionStart = 0;
let transitionDistance = 1;

function renderIntroProgress(progress) {
  const state = getIntroVisualState(progress);
  introTransition.style.setProperty("--home-intro-progress", state.progress.toFixed(4));
  introTransition.style.setProperty("--home-intro-hero-opacity", state.heroOpacity.toFixed(4));
  introTransition.style.setProperty("--home-intro-hero-scale", state.heroScale.toFixed(4));
  introTransition.style.setProperty("--home-intro-hero-blur", `${state.heroBlur.toFixed(2)}px`);
  introTransition.style.setProperty(
    "--home-intro-hero-brightness",
    state.heroBrightness.toFixed(4)
  );
  introTransition.style.setProperty("--home-intro-about-shift", `${state.aboutShift.toFixed(3)}vh`);
  introTransition.style.setProperty(
    "--home-intro-about-feather",
    `${state.aboutFeather.toFixed(3)}vh`
  );
}

const smoother = createProgressSmoother(windowRef, renderIntroProgress);

function measureIntroTransition() {
  transitionStart =
    (windowRef.scrollY || 0) + introTransition.getBoundingClientRect().top;
  transitionDistance = Math.max(windowRef.innerHeight, 1);
}

function getTargetProgress() {
  return clampProgress(
    ((windowRef.scrollY || 0) - transitionStart) / transitionDistance
  );
}

function retargetIntroTransition() {
  smoother.setTarget(getTargetProgress());
}

function resizeIntroTransition() {
  measureIntroTransition();
  smoother.setTarget(getTargetProgress(), { immediate: true });
}

introTransition.classList.add("is-intro-enhanced");
measureIntroTransition();
smoother.setTarget(getTargetProgress(), { immediate: true });
windowRef.addEventListener("scroll", retargetIntroTransition, { passive: true });
windowRef.addEventListener("resize", resizeIntroTransition);
```

Do not change `initAboutScroll`; it controls the later About reveal and is not
part of the first-image transition scope.

- [ ] **Step 4: Integrate Market and Tournament**

Resolve `createProgressSmoother` at the start of
`inner-page-intro-transition.js` using the same CommonJS/browser pattern.
Replace per-wrapper listeners with entry records and one listener pair:

```js
const entries = wrappers.map((wrapper) => {
  const entry = { wrapper, start: 0, distance: 1, smoother: null };

  function render(progress) {
    const state = getInnerIntroVisualState(progress);
    wrapper.style.setProperty("--inner-intro-progress", state.progress.toFixed(4));
    wrapper.style.setProperty("--inner-intro-opacity", state.opacity.toFixed(4));
    wrapper.style.setProperty("--inner-intro-scale", state.scale.toFixed(4));
    wrapper.style.setProperty("--inner-intro-blur", `${state.blur.toFixed(2)}px`);
    wrapper.style.setProperty("--inner-intro-brightness", state.brightness.toFixed(4));
    wrapper.style.setProperty("--inner-intro-content-shift", `${state.contentShift.toFixed(3)}vh`);
    wrapper.style.setProperty("--inner-intro-feather", `${state.feather.toFixed(3)}vh`);
  }

  entry.smoother = createProgressSmoother(windowRef, render);
  wrapper.classList.add("is-scroll-enhanced");
  return entry;
});

function measure(entry) {
  entry.start =
    (windowRef.scrollY || 0) + entry.wrapper.getBoundingClientRect().top;
  entry.distance = Math.max(windowRef.innerHeight, 1);
}

function targetFor(entry) {
  return clampProgress(
    ((windowRef.scrollY || 0) - entry.start) / entry.distance
  );
}

function retargetAll() {
  entries.forEach((entry) => entry.smoother.setTarget(targetFor(entry)));
}

function resizeAll() {
  entries.forEach((entry) => {
    measure(entry);
    entry.smoother.setTarget(targetFor(entry), { immediate: true });
  });
}

entries.forEach((entry) => {
  measure(entry);
  entry.smoother.setTarget(targetFor(entry), { immediate: true });
});
windowRef.addEventListener("scroll", retargetAll, { passive: true });
windowRef.addEventListener("resize", resizeAll);
```

Retain the existing early return for reduced motion and the existing return
value `wrappers.length`.

- [ ] **Step 5: Load the dependency before page-specific scripts**

Add this immediately before the current transition script in `index.html`,
`market.html`, and `tournament.html`:

```html
<script src="/visual/scripts/scroll-progress-smoothing.js?v=smooth-scroll-1"></script>
```

Keep each existing page-specific script directly after it.

- [ ] **Step 6: Run the relevant tests**

Run:

```powershell
node --test .\frontend\tests\scroll-progress-smoothing.test.cjs .\frontend\tests\home-about-scroll.test.cjs .\frontend\tests\inner-page-intro-transition.test.cjs
```

Expected: all tests PASS.

- [ ] **Step 7: Commit the three-page integration**

```powershell
git add frontend/index.html frontend/market.html frontend/tournament.html frontend/visual/scripts/home-about-scroll.js frontend/visual/scripts/inner-page-intro-transition.js frontend/tests/home-about-scroll.test.cjs frontend/tests/inner-page-intro-transition.test.cjs
git commit -m "feat: smooth home and inner page intro scrolling"
```

---

### Task 3: Move Teams onto the shared smoother

**Files:**
- Create: `frontend/visual/scripts/teams-intro-transition.js`
- Modify: `frontend/teams.html`
- Modify: `frontend/tests/teams-hero-scroll-transition.test.js`

**Interfaces:**
- Consumes: `ScrollProgressSmoothing.clampProgress` and `createProgressSmoother`.
- Produces: `getTeamsIntroVisualState(progress)` and `initTeamsIntroTransition(documentRef, windowRef)` for CommonJS tests; the browser initializes automatically.

- [ ] **Step 1: Replace source-regex assertions with behavior tests**

In `frontend/tests/teams-hero-scroll-transition.test.js`, retain the structural
CSS and HTML tests, then require:

```js
const {
  getTeamsIntroVisualState,
  initTeamsIntroTransition
} = require("../visual/scripts/teams-intro-transition.js");
```

Replace the test named `updates scroll progress through requestAnimationFrame`
with:

```js
test("maps the existing Teams visual states without changing endpoints", () => {
  assert.deepEqual(getTeamsIntroVisualState(0), {
    progress: 0,
    opacity: 1,
    scale: 1,
    blur: 0,
    brightness: 1,
    overviewShift: 10,
    overviewFeather: 30
  });
  assert.deepEqual(getTeamsIntroVisualState(1), {
    progress: 1,
    opacity: 0,
    scale: 1.025,
    blur: 16,
    brightness: 0.58,
    overviewShift: 0,
    overviewFeather: 0
  });
});

test("initializes Teams immediately and smooths later scroll targets", () => {
  const values = new Map();
  const listeners = new Map();
  const frames = [];
  const transition = {
    classList: { add: (name) => values.set("class", name) },
    getBoundingClientRect: () => ({ top: -500 }),
    style: { setProperty: (name, value) => values.set(name, value) }
  };
  const documentRef = { querySelector: () => transition };
  const windowRef = {
    innerHeight: 1000,
    scrollY: 0,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame(callback) {
      frames.push(callback);
      return frames.length;
    },
    cancelAnimationFrame: () => {},
    addEventListener: (name, callback) => listeners.set(name, callback)
  };

  assert.equal(initTeamsIntroTransition(documentRef, windowRef), true);
  assert.equal(values.get("--hero-transition-progress"), "0.5000");

  windowRef.scrollY = 1000;
  listeners.get("scroll")();
  frames.shift()(16);
  assert.ok(Number(values.get("--hero-transition-progress")) > 0.5);
});
```

Update the HTML wiring assertion to require the smoother before the Teams
module:

```js
const smootherScript = html.indexOf("/visual/scripts/scroll-progress-smoothing.js");
const teamsScript = html.indexOf("/visual/scripts/teams-intro-transition.js");
assert.ok(smootherScript >= 0);
assert.ok(smootherScript < teamsScript);
```

- [ ] **Step 2: Run the Teams test and verify failure**

Run:

```powershell
node --test .\frontend\tests\teams-hero-scroll-transition.test.js
```

Expected: FAIL because `teams-intro-transition.js` does not exist.

- [ ] **Step 3: Create the focused Teams transition module**

Create `frontend/visual/scripts/teams-intro-transition.js`:

```js
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
```

- [ ] **Step 4: Rewire Teams HTML without changing modal behavior**

Add these tags before the existing inline script in `teams.html`:

```html
<script src="/visual/scripts/scroll-progress-smoothing.js?v=smooth-scroll-1"></script>
<script src="/visual/scripts/teams-intro-transition.js?v=teams-intro-smooth-1"></script>
```

Delete only the inline block beginning with:

```js
const introTransition = document.querySelector(".teams-intro-transition");
```

and ending immediately after its scroll/resize listener registration. Preserve
`teamCards`, the photo modal variables, and all modal functions and listeners.

- [ ] **Step 5: Run the Teams test**

Run:

```powershell
node --test .\frontend\tests\teams-hero-scroll-transition.test.js
```

Expected: all Teams tests PASS.

- [ ] **Step 6: Commit the Teams integration**

```powershell
git add frontend/teams.html frontend/visual/scripts/teams-intro-transition.js frontend/tests/teams-hero-scroll-transition.test.js
git commit -m "feat: smooth teams intro scrolling"
```

---

### Task 4: Full regression and browser verification

**Files:**
- Modify only if verification exposes a defect in the files already listed.

**Interfaces:**
- Consumes: the completed transitions on all four pages.
- Produces: test and browser evidence that the requested behavior works.

- [ ] **Step 1: Run all transition JavaScript tests together**

```powershell
node --test .\frontend\tests\scroll-progress-smoothing.test.cjs .\frontend\tests\home-about-scroll.test.cjs .\frontend\tests\inner-page-intro-transition.test.cjs .\frontend\tests\teams-hero-scroll-transition.test.js
```

Expected: all tests PASS, 0 FAIL.

- [ ] **Step 2: Run every existing PowerShell frontend regression test**

```powershell
$ErrorActionPreference = "Stop"
Get-ChildItem .\frontend\tests\*.ps1, .\frontend\visual\tests\*.ps1 |
  ForEach-Object { & $_.FullName }
```

Expected: exit code `0` with no thrown assertion.

- [ ] **Step 3: Build and test the ASP.NET host**

```powershell
dotnet build .\LoudApi.slnx
dotnet test .\LoudApi.slnx --no-build
```

Expected: Build succeeded; all .NET tests PASS.

- [ ] **Step 4: Inspect the final diff**

```powershell
git diff --check
git status --short
git diff --stat HEAD~3
```

Expected: no whitespace errors; only planned frontend files are changed or
committed; the pre-existing untracked root `package-lock.json` remains
untouched.

- [ ] **Step 5: Verify the four pages in a real browser**

Start the existing host:

```powershell
dotnet run --no-build --project .\src\LoudApi.Api\LoudApi.Api.csproj --urls http://localhost:5152
```

Use the in-app browser to inspect:

```text
http://localhost:5152/
http://localhost:5152/teams.html
http://localhost:5152/market.html
http://localhost:5152/tournament.html
```

For each page:

1. Apply one mouse-wheel notch and confirm progress continues between discrete
   scroll positions.
2. Scroll continuously and confirm no visible stepping or elastic overshoot.
3. Reverse direction mid-transition and confirm immediate, smooth retargeting.
4. Drag the scrollbar slowly and confirm the transition remains light.
5. Compare screenshots at progress `0` and `1` with the original visual.
6. Repeat at a viewport width below `860px`.

Expected: the visual endpoints are unchanged, wheel motion is continuous,
scrollbar motion is lighter, and the console contains no JavaScript errors.

- [ ] **Step 6: Make a verification-only commit if Task 4 required corrections**

If no correction was required, do not create an empty commit. If a correction
was required, rerun Steps 1-5 and then:

```powershell
git add frontend
git commit -m "fix: refine smooth intro transition behavior"
```

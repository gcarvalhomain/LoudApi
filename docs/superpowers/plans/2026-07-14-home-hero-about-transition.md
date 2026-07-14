# Home Hero to About Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Teams-inspired sticky dissolve from the home hero into the existing ABOUT scroll story without changing ABOUT's internal reveal behavior.

**Architecture:** Add a home-specific wrapper and sticky hero stage in `index.html`. Extend the existing dependency-free ABOUT controller with a separate intro progress model and separate CSS variables so the hero takeover completes before the current ABOUT reveal intervals begin.

**Tech Stack:** HTML5, shared CSS, vanilla JavaScript, Node built-in test runner, PowerShell structural tests, ASP.NET Release build.

## Global Constraints

- Preserve the current local removal of the `ABOUT VELO / ARENA` eyebrow; do not stage or commit that user-owned deletion.
- Preserve all existing ABOUT copy, cards, reveal intervals, responsive behavior, reduced-motion behavior, and JavaScript-disabled fallback.
- Preserve the hero image, VELO title, scroll prompt, fixed navigation, menu, account controls, three-card hub, and later sections.
- Use home-specific `.home-intro-*` selectors; do not add `teams-*` classes to `frontend/index.html`.
- Hero-to-ABOUT progress uses scale `1`→`1.025`, blur `0px`→`16px`, brightness `1`→`0.58`, opacity `1`→`0`, ABOUT shift `10vh`→`0`, and feather `30vh`→`0`.
- Do not add external dependencies.

---

### Task 1: Add tested intro progress and controller logic

**Files:**
- Modify: `frontend/tests/home-about-scroll.test.cjs`
- Modify: `frontend/visual/scripts/home-about-scroll.js`
- Modify: `frontend/tests/home-about-structure.tests.ps1`
- Create: `docs/superpowers/plans/2026-07-14-home-hero-about-transition.md`

**Interfaces:**
- Produces: `getIntroVisualState(progress): object` and `initHomeIntroTransition(documentRef, windowRef): void`.
- Preserves: `clampProgress`, `getSegmentProgress`, `initAboutScroll`, and all existing ABOUT CSS custom properties.

- [ ] **Step 1: Align the existing structure test with the user's current copy change**

Remove only `'ABOUT VELO'` from `$requiredHtml` in `frontend/tests/home-about-structure.tests.ps1`. Do not add an assertion that the eyebrow is absent, because the deletion remains an uncommitted user-owned change rather than part of the transition commit.

- [ ] **Step 2: Run the existing ABOUT tests as the clean behavioral baseline**

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/home-about-structure.tests.ps1`

Expected: `Home ABOUT structure and styling are present.`

Run: `node --test --test-isolation=none frontend/tests/home-about-scroll.test.cjs`

Expected: 3 tests pass, 0 fail.

- [ ] **Step 3: Write failing intro progress and controller tests**

Extend the import:

```javascript
const {
  clampProgress,
  getSegmentProgress,
  getIntroVisualState,
  initAboutScroll,
  initHomeIntroTransition
} = require("../visual/scripts/home-about-scroll.js");
```

Add:

```javascript
test("getIntroVisualState maps the hero takeover from start to finish", () => {
  assert.deepEqual(getIntroVisualState(0), {
    progress: 0,
    heroOpacity: 1,
    heroScale: 1,
    heroBlur: 0,
    heroBrightness: 1,
    aboutShift: 10,
    aboutFeather: 30
  });

  assert.deepEqual(getIntroVisualState(0.5), {
    progress: 0.5,
    heroOpacity: 0.5,
    heroScale: 1.0125,
    heroBlur: 8,
    heroBrightness: 0.79,
    aboutShift: 5,
    aboutFeather: 15
  });

  assert.deepEqual(getIntroVisualState(1), {
    progress: 1,
    heroOpacity: 0,
    heroScale: 1.025,
    heroBlur: 16,
    heroBrightness: 0.5800000000000001,
    aboutShift: 0,
    aboutFeather: 0
  });
});

test("initHomeIntroTransition activates the wrapper without touching ABOUT variables", () => {
  const properties = new Map();
  const listeners = new Map();
  const introTransition = {
    classList: { add: (name) => properties.set("class", name) },
    getBoundingClientRect: () => ({ top: -500 }),
    style: { setProperty: (name, value) => properties.set(name, value) }
  };
  const documentRef = { querySelector: () => introTransition };
  const windowRef = {
    innerHeight: 1000,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (callback) => callback(),
    addEventListener: (name, callback) => listeners.set(name, callback)
  };

  initHomeIntroTransition(documentRef, windowRef);

  assert.equal(properties.get("class"), "is-intro-enhanced");
  assert.equal(properties.get("--home-intro-progress"), "0.5000");
  assert.equal(properties.get("--home-intro-hero-opacity"), "0.5000");
  assert.equal(properties.get("--home-intro-hero-blur"), "8.00px");
  assert.equal(properties.get("--home-intro-about-shift"), "5.000vh");
  assert.equal(properties.has("--about-progress"), false);
  assert.equal(typeof listeners.get("scroll"), "function");
  assert.equal(typeof listeners.get("resize"), "function");
});
```

- [ ] **Step 4: Run the tests and verify the expected failure**

Run: `node --test --test-isolation=none frontend/tests/home-about-scroll.test.cjs`

Expected: FAIL because `getIntroVisualState` and `initHomeIntroTransition` are not exported functions.

- [ ] **Step 5: Implement the intro state and controller**

Add before `initAboutScroll`:

```javascript
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
```

Export both functions:

```javascript
module.exports = {
  clampProgress,
  getSegmentProgress,
  getIntroVisualState,
  initAboutScroll,
  initHomeIntroTransition
};
```

Initialize the intro before the existing ABOUT controller in both browser-ready branches:

```javascript
function initializeHomeScrollEffects() {
  initHomeIntroTransition(document, window);
  initAboutScroll(document, window);
}
```

- [ ] **Step 6: Run the logic tests**

Run: `node --test --test-isolation=none frontend/tests/home-about-scroll.test.cjs`

Expected: 5 tests pass, 0 fail.

- [ ] **Step 7: Commit Task 1 without staging the user's `index.html` change**

```powershell
git add frontend/tests/home-about-scroll.test.cjs frontend/visual/scripts/home-about-scroll.js frontend/tests/home-about-structure.tests.ps1 docs/superpowers/plans/2026-07-14-home-hero-about-transition.md
git commit -m "feat: add home intro progress controller"
```

Verify `git status --short` still shows only ` M frontend/index.html` for the user's eyebrow deletion.

---

### Task 2: Add the home-specific wrapper and transition styles

**Files:**
- Modify: `frontend/tests/home-about-structure.tests.ps1`
- Modify: `frontend/index.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Consumes: `initHomeIntroTransition` and `getIntroVisualState` from Task 1.
- Produces: `.home-intro-transition`, `.home-intro-stage`, `.home-intro-hero`, and `.is-intro-enhanced` selectors around the existing hero and ABOUT.
- Preserves: `.home-about-scroll` and its current reveal data attributes and content.

- [ ] **Step 1: Write the failing transition structure tests**

Add these required HTML strings:

```powershell
'class="home-intro-transition"',
'class="home-intro-stage"',
'class="hero home-intro-hero"',
'/visual/styles/velotv-events.css?v=home-hero-about-transition-1',
'/visual/scripts/home-about-scroll.js?v=home-hero-about-transition-1'
```

Add these CSS requirements:

```powershell
'.home-intro-transition',
'.home-intro-transition.is-intro-enhanced .home-intro-stage',
'.home-intro-transition.is-intro-enhanced .home-intro-hero',
'.home-intro-transition.is-intro-enhanced .home-about-scroll'
```

Add ordering and isolation checks:

```powershell
$introIndex = $index.IndexOf('class="home-intro-transition"')
$heroIndex = $index.IndexOf('class="hero home-intro-hero"')
$aboutIndex = $index.IndexOf('class="home-about-scroll"')
$introEndIndex = $index.IndexOf('<!-- /home-intro-transition -->')
$hubIndex = $index.IndexOf('class="hub-grid home-hub"')

if (-not ($introIndex -lt $heroIndex -and $heroIndex -lt $aboutIndex -and $aboutIndex -lt $introEndIndex -and $introEndIndex -lt $hubIndex)) {
  throw "The intro wrapper must contain hero and ABOUT, then release into the three-card hub."
}

if ($index.Contains('teams-intro-transition') -or $index.Contains('teams-intro-stage') -or $index.Contains('teams-hero')) {
  throw "The home transition must not reuse Teams-specific classes."
}

if ($styles -notmatch '(?s)\.home-intro-stage\s*\{[^}]*position:\s*relative;') {
  throw "The intro stage must remain in normal flow before JavaScript enhancement."
}

if ($styles -notmatch '(?s)\.home-intro-transition\.is-intro-enhanced\s+\.home-intro-stage\s*\{[^}]*position:\s*sticky;') {
  throw "Sticky hero behavior must be limited to enhanced mode."
}
```

- [ ] **Step 2: Run the structure test and verify the expected failure**

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/home-about-structure.tests.ps1`

Expected: FAIL with `Missing ABOUT HTML pattern: class="home-intro-transition"`.

- [ ] **Step 3: Wrap the existing hero, navigation, and ABOUT**

In `frontend/index.html`:

```html
<div class="home-intro-transition">
  <div class="home-intro-stage">
    <section class="hero home-intro-hero" id="events" aria-labelledby="heroTitle">
      <!-- Keep the existing hero content unchanged. -->
    </section>
  </div>

  <!-- Keep the existing fixed navigation unchanged. -->

  <section class="home-about-scroll" id="about" aria-labelledby="aboutTitle">
    <!-- Keep the current ABOUT content and reveal attributes unchanged. -->
  </section>
</div><!-- /home-intro-transition -->

<div class="hub-grid home-hub" aria-label="VELO sections">
```

Do not restore the removed eyebrow. Update the stylesheet and script URLs to `?v=home-hero-about-transition-1`.

- [ ] **Step 4: Add home-specific transition styles**

Add near the home-page styles:

```css
.home-intro-transition {
  --home-intro-progress: 0;
  --home-intro-hero-opacity: 1;
  --home-intro-hero-scale: 1;
  --home-intro-hero-blur: 0px;
  --home-intro-hero-brightness: 1;
  --home-intro-about-shift: 0vh;
  --home-intro-about-feather: 0vh;
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  background: var(--black);
}

.home-intro-stage {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
}

.home-intro-transition.is-intro-enhanced .home-intro-stage {
  position: sticky;
  top: 0;
  z-index: 0;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
}

.home-intro-transition.is-intro-enhanced .home-intro-hero {
  height: 100%;
  min-height: 100%;
  opacity: var(--home-intro-hero-opacity);
  transform: scale(var(--home-intro-hero-scale));
  filter: blur(var(--home-intro-hero-blur)) brightness(var(--home-intro-hero-brightness));
  transform-origin: center;
  will-change: opacity, transform, filter;
}

.home-intro-transition.is-intro-enhanced .home-about-scroll {
  position: relative;
  z-index: 1;
  transform: translateY(var(--home-intro-about-shift));
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--home-intro-about-feather), #000 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 var(--home-intro-about-feather), #000 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  box-shadow: 0 -42px 90px rgba(0, 0, 0, 0.46);
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .home-intro-transition,
  .home-intro-transition.is-intro-enhanced {
    --home-intro-hero-opacity: 1;
    --home-intro-hero-scale: 1;
    --home-intro-hero-blur: 0px;
    --home-intro-hero-brightness: 1;
    --home-intro-about-shift: 0vh;
    --home-intro-about-feather: 0vh;
  }

  .home-intro-transition .home-intro-stage,
  .home-intro-transition.is-intro-enhanced .home-intro-stage {
    position: relative;
    height: auto;
    overflow: visible;
  }

  .home-intro-transition .home-intro-hero,
  .home-intro-transition.is-intro-enhanced .home-intro-hero {
    opacity: 1;
    transform: none;
    filter: none;
  }

  .home-intro-transition .home-about-scroll,
  .home-intro-transition.is-intro-enhanced .home-about-scroll {
    transform: none;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
```

- [ ] **Step 5: Run all automated and served checks**

Run: `node --test --test-isolation=none frontend/tests/home-about-scroll.test.cjs`

Expected: 5 tests pass, 0 fail.

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/home-about-structure.tests.ps1`

Expected: `Home ABOUT structure and styling are present.`

Run: `dotnet build -c Release`

Expected: exit code `0` with `0 Error(s)`.

Verify `http://localhost:5152/`, the versioned stylesheet, and the versioned controller all return HTTP 200 and contain the new home-intro selectors/controller.

- [ ] **Step 6: Verify rendered behavior when the visual browser is available**

1. Hero is unchanged at scroll position zero.
2. During the first viewport, hero opacity/brightness decrease while blur/scale increase.
3. ABOUT rises with feather and shadow over the hero.
4. ABOUT internal heading does not begin revealing until the takeover is practically complete.
5. Existing ABOUT cards reveal cumulatively with their original intervals.
6. ABOUT releases into the unchanged three-card hub.
7. Navigation and account controls remain usable.
8. Reduced-motion and JavaScript-disabled modes remain normal flow.

- [ ] **Step 7: Commit Task 2 without absorbing the user's eyebrow deletion**

Temporarily restore this exact user-owned line only for staging:

```html
<p class="eyebrow">ABOUT VELO / ARENA</p>
```

Then stage and commit the transition:

```powershell
git add frontend/index.html frontend/visual/styles/velotv-events.css frontend/tests/home-about-structure.tests.ps1
git commit -m "feat: transition home hero into about"
```

Immediately remove the eyebrow line again so the user's original local change is restored as the only uncommitted diff in `frontend/index.html`.

- [ ] **Step 8: Re-run tests against the final working tree**

Run the Node tests, PowerShell structure test, Release build, and served HTTP checks again. Confirm `git status --short` reports only ` M frontend/index.html`, and `git diff -- frontend/index.html` contains only the user's eyebrow deletion.

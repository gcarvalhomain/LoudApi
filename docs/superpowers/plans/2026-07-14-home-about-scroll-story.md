# Home About Scroll Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an English ABOUT section between the home hero and three-card hub that reveals all information cumulatively during a sticky scroll sequence.

**Architecture:** Keep the existing hero, fixed navigation, cards, later sections, and inline account/menu script intact. Add a self-contained ABOUT section and stylesheet rules, plus a dependency-free browser script whose pure progress functions are testable with Node and whose DOM enhancement activates only when motion is allowed.

**Tech Stack:** HTML5, shared CSS, vanilla JavaScript, Node built-in test runner, PowerShell structural checks, ASP.NET project build.

## Global Constraints

- All visible ABOUT copy must be in English.
- ABOUT must sit immediately after the hero/navigation region and before the existing Teams, Tournament, and Market cards.
- Preserve the opening hero image, title, scroll prompt, fixed navigation, three-card hub, scene activity, footer panel, and account modals.
- Use the existing dark brown, bronze, cream, border, shadow, and typography language.
- Reveal information cumulatively; every group remains visible after it appears.
- Show all ABOUT content in normal flow when JavaScript is unavailable or `prefers-reduced-motion: reduce` is enabled.
- Do not add external animation dependencies.

---

### Task 1: Implement and test scroll-progress calculations

**Files:**
- Create: `frontend/tests/home-about-scroll.test.cjs`
- Create: `frontend/visual/scripts/home-about-scroll.js`

**Interfaces:**
- Produces: `clampProgress(value): number`, `getSegmentProgress(progress, start, end): number`, and `initAboutScroll(documentRef, windowRef): void` through CommonJS exports for tests.
- Consumes: `.home-about-scroll`, `.home-about-reveal`, `data-reveal-start`, and `data-reveal-end` from Task 2.

- [ ] **Step 1: Write the failing progress test**

```javascript
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clampProgress,
  getSegmentProgress,
  initAboutScroll
} = require("../visual/scripts/home-about-scroll.js");

test("clampProgress limits values to the zero-to-one range", () => {
  assert.equal(clampProgress(-0.4), 0);
  assert.equal(clampProgress(0.42), 0.42);
  assert.equal(clampProgress(1.8), 1);
});

test("getSegmentProgress reveals a scroll interval cumulatively", () => {
  assert.equal(getSegmentProgress(0.1, 0.2, 0.4), 0);
  assert.ok(Math.abs(getSegmentProgress(0.3, 0.2, 0.4) - 0.5) < Number.EPSILON);
  assert.equal(getSegmentProgress(0.7, 0.2, 0.4), 1);
});

test("initAboutScroll activates and updates the cumulative reveal state", () => {
  const sectionProperties = new Map();
  const itemProperties = new Map();
  const listeners = new Map();
  const revealItem = {
    dataset: { revealStart: "0.2", revealEnd: "0.6" },
    style: { setProperty: (name, value) => itemProperties.set(name, value) }
  };
  const aboutSection = {
    offsetHeight: 3000,
    classList: { add: (name) => sectionProperties.set("class", name) },
    getBoundingClientRect: () => ({ top: -1000 }),
    querySelectorAll: () => [revealItem],
    style: { setProperty: (name, value) => sectionProperties.set(name, value) }
  };
  const documentRef = { querySelector: () => aboutSection };
  const windowRef = {
    innerHeight: 1000,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (callback) => callback(),
    addEventListener: (name, callback) => listeners.set(name, callback)
  };

  initAboutScroll(documentRef, windowRef);

  assert.equal(sectionProperties.get("class"), "is-scroll-enhanced");
  assert.equal(sectionProperties.get("--about-progress"), "0.5000");
  assert.equal(itemProperties.get("--about-reveal-opacity"), "0.7500");
  assert.equal(itemProperties.get("--about-reveal-y"), "8.50px");
  assert.equal(itemProperties.get("--about-reveal-blur"), "2.50px");
  assert.equal(typeof listeners.get("scroll"), "function");
  assert.equal(typeof listeners.get("resize"), "function");
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `node --test --test-isolation=none frontend/tests/home-about-scroll.test.cjs`

Expected: FAIL because `frontend/visual/scripts/home-about-scroll.js` does not exist.

- [ ] **Step 3: Implement the progress functions and DOM controller**

```javascript
(function initializeAboutModule(globalScope) {
  function clampProgress(value) {
    return Math.min(Math.max(value, 0), 1);
  }

  function getSegmentProgress(progress, start, end) {
    const distance = Math.max(end - start, Number.EPSILON);
    return clampProgress((progress - start) / distance);
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
    module.exports = { clampProgress, getSegmentProgress, initAboutScroll };
  }

  if (typeof document !== "undefined" && typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => initAboutScroll(document, window), { once: true });
    } else {
      initAboutScroll(document, window);
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
```

- [ ] **Step 4: Run the progress tests**

Run: `node --test --test-isolation=none frontend/tests/home-about-scroll.test.cjs`

Expected: 2 tests pass, 0 fail.

---

### Task 2: Add the ABOUT structure, content, and native visual styling

**Files:**
- Create: `frontend/tests/home-about-structure.tests.ps1`
- Modify: `frontend/index.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Consumes: `initAboutScroll` and its `.home-about-*` selectors from Task 1.
- Produces: A semantic `#about` section with five ordered reveal groups and the unchanged `.home-hub` immediately after it.

- [ ] **Step 1: Write the failing structure and content test**

```powershell
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$index = Get-Content -Raw (Join-Path $root "frontend\index.html")
$styles = Get-Content -Raw (Join-Path $root "frontend\visual\styles\velotv-events.css")

$requiredHtml = @(
  'id="about"',
  'class="home-about-scroll"',
  'ABOUT VELO',
  'Founded by Gabriel Carvalho',
  'Established in 2022',
  'Purpose',
  'Project context',
  'CS2 ecosystem',
  'Valve',
  'ESL',
  'BLAST',
  'HLTV',
  '/visual/styles/velotv-events.css?v=home-about-scroll-1',
  '/visual/scripts/home-about-scroll.js?v=home-about-scroll-1'
)

foreach ($pattern in $requiredHtml) {
  if (-not $index.Contains($pattern)) {
    throw "Missing ABOUT HTML pattern: $pattern"
  }
}

$heroIndex = $index.IndexOf('class="hero"')
$aboutIndex = $index.IndexOf('class="home-about-scroll"')
$hubIndex = $index.IndexOf('class="hub-grid home-hub"')

if (-not ($heroIndex -lt $aboutIndex -and $aboutIndex -lt $hubIndex)) {
  throw "ABOUT must be placed between the hero and the three-card hub."
}

$requiredCss = @(
  '.home-about-scroll',
  '.home-about-stage',
  '.home-about-panel',
  '.home-about-scroll.is-scroll-enhanced .home-about-reveal',
  '@media (prefers-reduced-motion: reduce)'
)

foreach ($pattern in $requiredCss) {
  if (-not $styles.Contains($pattern)) {
    throw "Missing ABOUT CSS pattern: $pattern"
  }
}

if ($styles -notmatch '(?s)\.home-about-scroll\s*\{[^}]*height:\s*auto;') {
  throw "ABOUT must use normal document height before JavaScript enhancement."
}

if ($styles -notmatch '(?s)\.home-about-scroll\.is-scroll-enhanced\s*\{[^}]*height:\s*320vh;') {
  throw "ABOUT enhanced mode must provide the desktop scroll runway."
}

if ($styles -notmatch '(?s)\.home-about-scroll\.is-scroll-enhanced\s+\.home-about-stage\s*\{[^}]*position:\s*sticky;') {
  throw "ABOUT sticky positioning must be limited to enhanced mode."
}

Write-Host "Home ABOUT structure and styling are present."
```

- [ ] **Step 2: Run the structure test and verify the expected failure**

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/home-about-structure.tests.ps1`

Expected: FAIL with `Missing ABOUT HTML pattern: id="about"`.

- [ ] **Step 3: Insert the semantic ABOUT markup before `.home-hub`**

Add this section after the existing navigation and before `<div class="hub-grid home-hub" ...>`:

```html
<section class="home-about-scroll" id="about" aria-labelledby="aboutTitle">
  <div class="home-about-stage">
    <div class="home-about-panel">
      <header class="home-about-heading home-about-reveal" data-reveal-start="0.02" data-reveal-end="0.18">
        <p class="eyebrow">ABOUT VELO / ARENA</p>
        <h2 id="aboutTitle">Built to keep Counter-Strike 2 in focus.</h2>
        <p>VELO is an independent editorial arena shaped around the teams, tournaments, players and movement that define competitive CS2.</p>
      </header>

      <div class="home-about-story">
        <article class="home-about-card home-about-reveal" data-reveal-start="0.16" data-reveal-end="0.36">
          <span>Origin</span>
          <h3>Founded by Gabriel Carvalho</h3>
          <p>Established in 2022 as a focused space for following the modern Counter-Strike scene.</p>
        </article>

        <article class="home-about-card home-about-reveal" data-reveal-start="0.34" data-reveal-end="0.56">
          <span>Purpose</span>
          <h3>One arena for the competitive story</h3>
          <p>VELO brings teams, tournaments, players, roster movement and market context into one clear destination.</p>
        </article>

        <article class="home-about-card home-about-reveal" data-reveal-start="0.54" data-reveal-end="0.76">
          <span>Project context</span>
          <h3>From scattered updates to useful perspective</h3>
          <p>The project turns fast-moving CS2 information into a visual, accessible and editorial experience built for quick understanding.</p>
        </article>

        <article class="home-about-card home-about-reveal" data-reveal-start="0.72" data-reveal-end="0.94">
          <span>CS2 ecosystem</span>
          <h3>Connected to the scene</h3>
          <p>VELO follows the wider competitive ecosystem shaped by its leading platforms, organizers and information sources.</p>
          <ul class="home-about-ecosystem" aria-label="CS2 ecosystem references">
            <li>Valve</li>
            <li>ESL</li>
            <li>BLAST</li>
            <li>HLTV</li>
          </ul>
        </article>
      </div>
    </div>
  </div>
</section>
```

Before the existing inline script, load the controller without changing the menu/modal script:

```html
<script src="/visual/scripts/home-about-scroll.js?v=home-about-scroll-1"></script>
```

- [ ] **Step 4: Add the ABOUT visual system to the shared stylesheet**

Add focused `.home-about-*` rules near the existing home-page styles. The rules must provide:

```css
.home-about-scroll {
  --about-panel-shift: 0vh;
  --about-panel-feather: 0vh;
  position: relative;
  width: 100vw;
  height: auto;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  color: #f5ead6;
  background: #100e0c;
  isolation: isolate;
}

.home-about-stage {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
}

.home-about-panel {
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  align-items: center;
  gap: clamp(28px, 5vw, 82px);
  padding: clamp(34px, 6vw, 82px) max(20px, calc((100vw - 1180px) / 2));
  padding-bottom: max(118px, calc(var(--home-nav-height, 70px) + 44px));
  background:
    radial-gradient(circle at 18% 22%, rgba(159, 106, 50, 0.20), transparent 36%),
    linear-gradient(145deg, #24180f 0%, #17120e 48%, #0d0b09 100%);
  box-shadow: 0 -42px 90px rgba(0, 0, 0, 0.46);
  transform: translateY(var(--about-panel-shift));
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--about-panel-feather), #000 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 var(--about-panel-feather), #000 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  will-change: transform;
}

.home-about-scroll.is-scroll-enhanced {
  height: 320vh;
}

.home-about-scroll.is-scroll-enhanced .home-about-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  min-height: 0;
  overflow: hidden;
}

.home-about-scroll.is-scroll-enhanced .home-about-panel {
  height: 100%;
  min-height: 0;
}

.home-about-heading {
  max-width: 520px;
}

.home-about-heading .eyebrow,
.home-about-card > span {
  color: #d3a85f;
}

.home-about-heading h2 {
  margin-top: 14px;
  font-size: clamp(48px, 7vw, 104px);
  line-height: 0.88;
  letter-spacing: -0.055em;
}

.home-about-heading > p:last-child {
  max-width: 520px;
  margin-top: 22px;
  color: #b9a88f;
  line-height: 1.65;
}

.home-about-story {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.home-about-card {
  min-height: 190px;
  padding: clamp(18px, 2.4vw, 28px);
  border: 1px solid rgba(211, 168, 95, 0.20);
  border-radius: 6px;
  background: linear-gradient(145deg, rgba(52, 36, 24, 0.90), rgba(25, 18, 13, 0.94));
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.20);
}

.home-about-card > span {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.home-about-card h3 {
  margin-top: 12px;
  color: #f5ead6;
  font-size: clamp(21px, 2.1vw, 30px);
  line-height: 1;
}

.home-about-card p {
  margin-top: 12px;
  color: #b9a88f;
  font-size: 13px;
  line-height: 1.5;
}

.home-about-ecosystem {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
  padding: 0;
  list-style: none;
}

.home-about-ecosystem li {
  border: 1px solid rgba(211, 168, 95, 0.28);
  border-radius: 999px;
  padding: 6px 9px;
  color: #f5ead6;
  background: rgba(211, 168, 95, 0.08);
  font-size: 11px;
  font-weight: 900;
}

.home-about-reveal {
  --about-reveal-opacity: 1;
  --about-reveal-y: 0px;
  --about-reveal-blur: 0px;
  opacity: 1;
  transform: none;
  filter: none;
}

.home-about-scroll.is-scroll-enhanced .home-about-reveal {
  opacity: var(--about-reveal-opacity);
  transform: translateY(var(--about-reveal-y));
  filter: blur(var(--about-reveal-blur));
  will-change: opacity, transform, filter;
}

@media (max-width: 760px) {
  .home-about-scroll.is-scroll-enhanced {
    height: 360vh;
  }

  .home-about-panel {
    grid-template-columns: 1fr;
    align-content: center;
    gap: 18px;
    padding: 22px 16px max(108px, calc(var(--home-nav-height, 70px) + 34px));
  }

  .home-about-heading h2 {
    font-size: clamp(42px, 13vw, 66px);
  }

  .home-about-heading > p:last-child {
    margin-top: 12px;
    font-size: 13px;
  }

  .home-about-story {
    gap: 8px;
  }

  .home-about-card {
    min-height: 0;
    padding: 14px;
  }

  .home-about-card h3 {
    margin-top: 7px;
    font-size: clamp(17px, 4.8vw, 23px);
  }

  .home-about-card p {
    margin-top: 7px;
    font-size: 11px;
    line-height: 1.38;
  }
}

@media (max-width: 420px) {
  .home-about-heading h2 {
    font-size: 38px;
  }

  .home-about-heading > p:last-child {
    font-size: 11px;
    line-height: 1.35;
  }

  .home-about-card {
    padding: 10px;
  }

  .home-about-card h3 {
    font-size: 15px;
  }

  .home-about-card p {
    font-size: 10px;
  }

  .home-about-ecosystem {
    margin-top: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-about-scroll {
    height: auto;
  }

  .home-about-stage {
    position: relative;
    height: auto;
    min-height: 100vh;
    min-height: 100svh;
    overflow: visible;
  }

  .home-about-panel {
    min-height: 100vh;
    min-height: 100svh;
    transform: none;
    -webkit-mask-image: none;
    mask-image: none;
  }

  .home-about-scroll .home-about-reveal {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
```

- [ ] **Step 5: Run targeted tests and project build**

Run: `node --test --test-isolation=none frontend/tests/home-about-scroll.test.cjs`

Expected: 2 tests pass, 0 fail.

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/home-about-structure.tests.ps1`

Expected: `Home ABOUT structure and styling are present.`

Run: `dotnet build -c Release`

Expected: exit code `0` with `0 Error(s)`.

- [ ] **Step 6: Verify rendered behavior**

Use the running local application to verify:

1. The original hero and image are unchanged at page load.
2. ABOUT enters after the hero and before the three cards.
3. Heading, origin, purpose, context, and ecosystem groups reveal in order and remain visible.
4. The sticky stage releases only after every group is visible.
5. The three existing cards and all later sections continue normally.
6. Fixed navigation, Explore menu, login, and signup controls still work.
7. A narrow viewport keeps all ABOUT content readable without clipping.
8. Reduced motion and JavaScript-disabled modes show all ABOUT content without hidden states.

- [ ] **Step 7: Commit the implementation**

```powershell
git add frontend/index.html frontend/visual/styles/velotv-events.css frontend/visual/scripts/home-about-scroll.js frontend/tests/home-about-scroll.test.cjs frontend/tests/home-about-structure.tests.ps1 docs/superpowers/plans/2026-07-14-home-about-scroll-story.md
git commit -m "feat: add home about scroll story"
```

# Home Scroll Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the Teams page hero-to-content scroll transition between the VELO hero and the three image cards on the home page.

**Architecture:** Reuse the existing transition CSS classes and custom properties from `velotv-events.css`. Change only the home-page markup and script, wrapping the hero and card hub in the existing stage structure and driving its progress with the same guarded `requestAnimationFrame` scroll handler.

**Tech Stack:** HTML5, CSS custom properties already present in the shared stylesheet, vanilla JavaScript, PowerShell structural regression test.

## Global Constraints

- Modify the home transition behavior without changing the fixed navigation, scene activity, footer panel, or account modals.
- The incoming block is exactly the Teams, Tournament, and Market image-card group.
- Reuse the existing Teams transition visual language rather than introduce a second animation system.
- Respect `prefers-reduced-motion`.

---

### Task 1: Add the home hero-to-card transition

**Files:**
- Create: `frontend/tests/home-scroll-transition.tests.ps1`
- Modify: `frontend/index.html`

**Interfaces:**
- Consumes: `.teams-intro-transition`, `.teams-intro-stage`, `.teams-hero`, and `.teams-overview` styles from `frontend/visual/styles/velotv-events.css`.
- Produces: An `introTransition` element whose `--hero-transition-*` and `--teams-overview-*` custom properties follow the first viewport of scroll progress.

- [ ] **Step 1: Write the failing structural regression test**

```powershell
$indexPath = Join-Path $PSScriptRoot "..\index.html"
$html = Get-Content -Raw $indexPath

$requiredPatterns = @(
  'class="teams-intro-transition"',
  'class="teams-intro-stage"',
  'class="hero teams-hero"',
  'class="hub-grid home-hub teams-overview"',
  'const introTransition = document.querySelector(".teams-intro-transition");',
  'window.matchMedia("(prefers-reduced-motion: reduce)").matches',
  'requestAnimationFrame(updateIntroTransition)',
  '"--hero-transition-blur"',
  '"--teams-overview-feather"'
)

foreach ($pattern in $requiredPatterns) {
  if (-not $html.Contains($pattern)) {
    throw "Missing home scroll-transition pattern: $pattern"
  }
}

Write-Host "Home scroll transition structure is present."
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/home-scroll-transition.tests.ps1`

Expected: exit code `1` with `Missing home scroll-transition pattern: class="teams-intro-transition"`.

- [ ] **Step 3: Wrap the hero and card hub in the existing transition structure**

In `frontend/index.html`, place the hero inside the stage, keep the fixed nav between the stage and incoming content, and add the incoming class to the card hub:

```html
<div class="teams-intro-transition">
  <div class="teams-intro-stage">
    <section class="hero teams-hero" id="events" aria-labelledby="heroTitle">
      <!-- Existing hero content remains unchanged. -->
    </section>
  </div>

  <!-- Existing fixed navigation remains unchanged. -->

  <div class="hub-grid home-hub teams-overview" aria-label="VELO sections">
    <!-- Existing three image cards remain unchanged. -->
  </div>
</div>
```

- [ ] **Step 4: Add the scroll-progress controller**

At the start of the existing script in `frontend/index.html`, select the wrapper and add the same guarded controller used by `teams.html`:

```javascript
const introTransition = document.querySelector(".teams-intro-transition");

if (introTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let introTransitionFrame = 0;

  function updateIntroTransition() {
    introTransitionFrame = 0;
    const transitionBounds = introTransition.getBoundingClientRect();
    const transitionDistance = Math.max(window.innerHeight, 1);
    const progress = Math.min(Math.max(-transitionBounds.top / transitionDistance, 0), 1);

    introTransition.style.setProperty("--hero-transition-progress", progress.toFixed(4));
    introTransition.style.setProperty("--hero-transition-opacity", (1 - progress).toFixed(4));
    introTransition.style.setProperty("--hero-transition-scale", (1 + progress * 0.025).toFixed(4));
    introTransition.style.setProperty("--hero-transition-blur", `${(progress * 16).toFixed(2)}px`);
    introTransition.style.setProperty("--hero-transition-brightness", (1 - progress * 0.42).toFixed(4));
    introTransition.style.setProperty("--teams-overview-shift", `${((1 - progress) * 10).toFixed(3)}vh`);
    introTransition.style.setProperty("--teams-overview-feather", `${((1 - progress) * 30).toFixed(3)}vh`);
  }

  function scheduleIntroTransitionUpdate() {
    if (introTransitionFrame === 0) {
      introTransitionFrame = requestAnimationFrame(updateIntroTransition);
    }
  }

  introTransition.classList.add("is-scroll-enhanced");
  updateIntroTransition();
  window.addEventListener("scroll", scheduleIntroTransitionUpdate, { passive: true });
  window.addEventListener("resize", scheduleIntroTransitionUpdate);
}
```

- [ ] **Step 5: Run the structural test and full project build**

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/home-scroll-transition.tests.ps1`

Expected: exit code `0` with `Home scroll transition structure is present.`

Run: `dotnet build`

Expected: exit code `0` with `0 Error(s)`.

- [ ] **Step 6: Verify the rendered behavior**

Start the application using its normal local command, open the home page, and verify:

1. At scroll position zero, the VELO hero is fully visible.
2. Across the first viewport of downward scroll, the hero fades, blurs, darkens, and scales slightly.
3. The three image cards rise into view with a soft top mask and shadow.
4. Scene activity and later content remain outside the transition.
5. At a narrow viewport, all three cards remain accessible and the fixed nav still works.
6. With reduced motion enabled, the hero and cards render without the enhanced scroll handler.

- [ ] **Step 7: Commit the implementation**

```powershell
git add frontend/index.html frontend/tests/home-scroll-transition.tests.ps1 docs/superpowers/plans/2026-07-14-home-scroll-transition.md
git commit -m "feat: animate home hero transition"
```

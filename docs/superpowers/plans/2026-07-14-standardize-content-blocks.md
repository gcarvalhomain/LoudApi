# Branded Content Blocks and Inner-Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize major white content areas across all frontend pages and add hero-to-content scroll transitions to Market and Tournament.

**Architecture:** Add one reusable `brand-content-block` CSS shell without changing the global background. Add one isolated `inner-page-intro-transition.js` controller shared only by Market and Tournament; Home and Teams behavior remains untouched.

**Tech Stack:** HTML5, CSS custom properties, vanilla JavaScript, Node test runner, PowerShell structural tests.

## Global Constraints

- Keep the document background unchanged.
- Preserve existing content, links, images, modals, cards, and responsive behavior.
- Use brown, bronze, and gold only on major content containers.
- Respect `prefers-reduced-motion: reduce`.

---

### Task 1: Shared branded content shell

**Files:**
- Create: `frontend/tests/content-block-standardization.tests.ps1`
- Modify: `frontend/index.html`
- Modify: `frontend/teams.html`
- Modify: `frontend/market.html`
- Modify: `frontend/tournament.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Produces: `.brand-content-block` and `.home-hub-shell` reusable layout classes.

- [ ] **Step 1: Write the failing structural test**

Assert that the stylesheet defines `.brand-content-block`, HOME contains `.home-hub-shell`, and every large `surface` or `feature-panel` targeted by the spec also includes `brand-content-block`.

- [ ] **Step 2: Verify the test fails**

Run: `powershell -ExecutionPolicy Bypass -File frontend/tests/content-block-standardization.tests.ps1`

Expected: failure because `.brand-content-block` is absent.

- [ ] **Step 3: Implement the shared shell**

Wrap `.home-hub` in `<section class="brand-content-block home-hub-shell">`. Add `brand-content-block` to the major Teams, Market, and Tournament content sections. Define the shared full-width brown/bronze gradient, gold border, shadow, controlled padding, and responsive spacing; keep individual card backgrounds unchanged.

- [ ] **Step 4: Verify and commit**

Run the structural test and expect PASS.

Commit: `feat: standardize branded content blocks`

### Task 2: Market and Tournament intro transitions

**Files:**
- Create: `frontend/visual/scripts/inner-page-intro-transition.js`
- Create: `frontend/tests/inner-page-intro-transition.test.cjs`
- Modify: `frontend/market.html`
- Modify: `frontend/tournament.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Produces: `getInnerIntroVisualState(progress)` returning opacity, scale, blur, brightness, contentShift, and feather.
- Produces: `initInnerPageIntroTransitions(documentRef, windowRef)` controlling every `[data-inner-intro-transition]` wrapper.
- Produces CSS variables prefixed `--inner-intro-`.

- [ ] **Step 1: Write failing JavaScript tests**

Test clamping at 0 and 1, midpoint visual values, independent initialization of Market and Tournament wrappers, scroll updates, and reduced-motion opt-out.

- [ ] **Step 2: Verify the tests fail**

Run: `node --test --test-isolation=none frontend/tests/inner-page-intro-transition.test.cjs`

Expected: failure because the controller module does not exist.

- [ ] **Step 3: Implement the controller**

Use `requestAnimationFrame`, passive scroll listeners, wrapper bounds, and one viewport of transition distance. Export functions through `module.exports` for tests and auto-initialize in the browser.

- [ ] **Step 4: Connect HTML and CSS**

On each page, wrap the hero and first branded content section in a page-specific wrapper carrying `data-inner-intro-transition`; place the hero in `.inner-intro-stage` and mark the first section `.inner-intro-content`. Load the new script with a cache-busting query. Add sticky hero fade/scale/blur/brightness, rising masked content, normal-flow fallback, and reduced-motion rules.

- [ ] **Step 5: Verify and commit**

Run both the JavaScript and structural tests and expect PASS.

Commit: `feat: transition market and tournament intros`

### Task 3: Regression verification

**Files:**
- Test: `frontend/tests/home-about-scroll.test.cjs`
- Test: `frontend/tests/home-about-structure.tests.ps1`
- Test: `frontend/tests/teams-hero-scroll-transition.test.js`

- [ ] **Step 1: Run all frontend tests**

Run the Home, Teams, new transition, and content-block tests. Expected: zero failures.

- [ ] **Step 2: Build the application**

Run: `dotnet build -c Release`

Expected: 0 warnings and 0 errors.

- [ ] **Step 3: Inspect the final diff**

Run: `git diff --check` and `git status --short`. Expected: no whitespace errors and only intended frontend/plan changes.

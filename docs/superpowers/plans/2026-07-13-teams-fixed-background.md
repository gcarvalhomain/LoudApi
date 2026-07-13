# Teams Fixed Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "TOP TIER S TEAMS" image the smooth fixed background for the entire teams page, including "TOP RANKING", with readable translucent content layers and restrained effects.

**Architecture:** A fixed `.teams-page::before` pseudo-element owns the shared viewport background and never participates in document scrolling. Existing hero and surface backgrounds become translucent overlays, while a focused PowerShell regression test verifies the fixed layer, removal of the ranking wallpaper, responsive behavior, and reduced-motion support.

**Tech Stack:** HTML5, CSS3, PowerShell test script

## Global Constraints

- Use `--teams-hero-image` as the single page background.
- Do not add JavaScript parallax or scroll listeners.
- Preserve existing navigation, modal, keyboard focus, team cards, and ranking content.
- Keep text readable on desktop and mobile.
- Disable new movement effects under `prefers-reduced-motion: reduce`.

---

### Task 1: Fixed Background Regression Test

**Files:**
- Create: `frontend/visual/tests/teams-fixed-background.test.ps1`
- Test: `frontend/visual/tests/teams-fixed-background.test.ps1`

**Interfaces:**
- Consumes: CSS source from `frontend/visual/styles/velotv-events.css`
- Produces: A zero-exit regression check for the fixed background contract

- [ ] **Step 1: Write the failing test**

Create `frontend/visual/tests/teams-fixed-background.test.ps1`:

```powershell
$ErrorActionPreference = "Stop"

$cssPath = Join-Path $PSScriptRoot "..\styles\velotv-events.css"
$css = Get-Content -Raw $cssPath

function Assert-Matches([string]$Pattern, [string]$Message) {
  if ($css -notmatch $Pattern) {
    throw $Message
  }
}

function Assert-DoesNotMatch([string]$Pattern, [string]$Message) {
  if ($css -match $Pattern) {
    throw $Message
  }
}

Assert-Matches '(?s)\.teams-page\s*\{[^}]*position:\s*relative;[^}]*isolation:\s*isolate;' "Teams page must establish an isolated positioning context."
Assert-Matches '(?s)\.teams-page::before\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;[^}]*pointer-events:\s*none;[^}]*var\(--teams-hero-image\)' "Teams page must render the team image in a fixed, non-interactive layer."
Assert-Matches '(?s)\.teams-page\s*>\s*\.surface:nth-of-type\(2\)\s*\{[^}]*background:\s*linear-gradient' "Top Ranking must use a translucent overlay."
Assert-DoesNotMatch '(?s)\.teams-page\s*>\s*\.surface:nth-of-type\(2\)\s*\{[^}]*dmarket\.com' "Top Ranking must not use the old map wallpaper."
Assert-Matches '(?s)@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{.*?\.teams-page.*?animation:\s*none;' "Teams page effects must respect reduced motion."

Write-Output "Teams fixed background checks passed."
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File frontend/visual/tests/teams-fixed-background.test.ps1
```

Expected: FAIL with `Teams page must establish an isolated positioning context.`

- [ ] **Step 3: Commit the failing regression test**

```powershell
git add frontend/visual/tests/teams-fixed-background.test.ps1
git commit -m "test: cover teams fixed background"
```

---

### Task 2: Shared Fixed Image And Translucent Sections

**Files:**
- Modify: `frontend/visual/styles/velotv-events.css:88`
- Modify: `frontend/visual/styles/velotv-events.css:685`
- Modify: `frontend/visual/styles/velotv-events.css:721`
- Modify: `frontend/visual/styles/velotv-events.css:734`
- Test: `frontend/visual/tests/teams-fixed-background.test.ps1`

**Interfaces:**
- Consumes: Existing `--teams-hero-image` custom property
- Produces: `.teams-page::before` fixed background layer and translucent section overlays

- [ ] **Step 1: Replace the scrolling page background with an isolated fixed layer**

Change `.teams-page` and add its pseudo-element:

```css
.teams-page {
  width: 100%;
  position: relative;
  isolation: isolate;
  gap: 0;
  padding-top: 0;
  padding-bottom: 0;
  background: var(--black);
}

.teams-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(0deg, rgba(16, 14, 12, 0.86), rgba(16, 14, 12, 0.48)),
    var(--teams-hero-image) center / cover no-repeat;
  transform: translateZ(0);
}
```

- [ ] **Step 2: Make the hero reveal the shared image**

Replace `.teams-hero`'s image layer with overlays only:

```css
  background:
    linear-gradient(0deg, rgba(16, 14, 12, 0.88), rgba(16, 14, 12, 0.16) 58%, rgba(16, 14, 12, 0.56)),
    linear-gradient(90deg, rgba(48, 34, 24, 0.46), rgba(16, 14, 12, 0.06));
```

- [ ] **Step 3: Convert both content sections to translucent overlays**

Use these backgrounds:

```css
.teams-page > .surface:first-of-type {
  color: var(--white);
  background: linear-gradient(0deg, rgba(16, 14, 12, 0.88), rgba(16, 14, 12, 0.68));
  box-shadow: inset 0 18px 42px rgba(0, 0, 0, 0.34);
}

.teams-page > .surface:nth-of-type(2) {
  color: var(--white);
  background: linear-gradient(0deg, rgba(16, 14, 12, 0.90), rgba(16, 14, 12, 0.62));
  box-shadow: inset 0 18px 42px rgba(0, 0, 0, 0.42), inset 0 -22px 54px rgba(0, 0, 0, 0.50);
}
```

- [ ] **Step 4: Run the regression test**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File frontend/visual/tests/teams-fixed-background.test.ps1
```

Expected: FAIL only because the reduced-motion rule has not been added yet.

- [ ] **Step 5: Commit the fixed background implementation**

```powershell
git add frontend/visual/styles/velotv-events.css
git commit -m "feat: add smooth fixed teams background"
```

---

### Task 3: Effects, Reduced Motion, And Full Verification

**Files:**
- Modify: `frontend/visual/styles/velotv-events.css`
- Test: `frontend/visual/tests/teams-fixed-background.test.ps1`
- Test: `frontend/visual/tests/home-animation.test.ps1`

**Interfaces:**
- Consumes: Fixed layer and translucent surfaces from Task 2
- Produces: Restrained entrance effects with an accessible reduced-motion fallback

- [ ] **Step 1: Add a single section entrance effect**

Add:

```css
.teams-page > .surface .section-header,
.teams-page > .surface .ranking-split,
.teams-page > .surface .ranking-notes {
  animation: teamsContentReveal 560ms cubic-bezier(0.22, 0.8, 0.24, 1) both;
}

@keyframes teamsContentReveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: Add the reduced-motion fallback**

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .teams-page > .surface .section-header,
  .teams-page > .surface .ranking-split,
  .teams-page > .surface .ranking-notes {
    animation: none;
  }

  .teams-page .team-card,
  .teams-page .team-logo,
  .teams-page .player-ranking-table tbody tr {
    transition: none;
  }
}
```

- [ ] **Step 3: Run all frontend visual regression scripts**

Run:

```powershell
Get-ChildItem frontend/visual/tests/*.test.ps1 | ForEach-Object {
  powershell -ExecutionPolicy Bypass -File $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: PASS, including `Teams fixed background checks passed.`

- [ ] **Step 4: Start the local application and inspect desktop and mobile layouts**

Run:

```powershell
dotnet run --no-build --urls http://localhost:5152
```

Verify at desktop and mobile viewport sizes that the same team image stays stationary from the hero through "TOP RANKING", content remains readable, the old map wallpaper is absent, and no horizontal overflow or layering errors appear.

- [ ] **Step 5: Check the final diff and commit**

Run:

```powershell
git diff --check
git status --short
git add frontend/visual/styles/velotv-events.css frontend/visual/tests/teams-fixed-background.test.ps1
git commit -m "feat: polish teams page background effects"
```

Expected: `git diff --check` produces no output before the commit.

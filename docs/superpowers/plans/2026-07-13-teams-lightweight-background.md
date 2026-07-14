# Teams Lightweight Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the teams hero image while making the rest of the page use lightweight static gradients with no fixed backgrounds.

**Architecture:** The existing shared stylesheet remains the single source of page styling. A focused PowerShell regression test extracts the teams background selectors and enforces that only `.teams-hero` uses `--teams-hero-image`, while `.teams-page` and both content surfaces use stable non-fixed layers.

**Tech Stack:** HTML5, CSS3, PowerShell

## Global Constraints

- Do not change `frontend/teams.html` or include its existing local modifications in any commit.
- Do not use `background-attachment: fixed` or a fixed background shorthand on `.teams-page` or its content sections.
- Do not duplicate `--teams-hero-image` outside `.teams-hero`.
- Do not add scroll listeners, JavaScript parallax, backdrop filters, or continuous background animation.
- Preserve all existing card, table, hover, focus, navigation, and modal behavior.

---

### Task 1: Lightweight Teams Background Contract

**Files:**
- Create: `frontend/visual/tests/teams-lightweight-background.test.ps1`
- Modify: `frontend/visual/styles/velotv-events.css:88-97`
- Modify: `frontend/visual/styles/velotv-events.css:721-740`
- Test: `frontend/visual/tests/teams-lightweight-background.test.ps1`

**Interfaces:**
- Consumes: `.teams-page`, `.teams-hero`, `.teams-page > .surface:first-of-type`, and `.teams-page > .surface:nth-of-type(2)` CSS selectors
- Produces: A zero-exit regression script that enforces the lightweight background contract

- [ ] **Step 1: Write the failing regression test**

Create `frontend/visual/tests/teams-lightweight-background.test.ps1`:

```powershell
$ErrorActionPreference = "Stop"

$cssPath = Join-Path $PSScriptRoot "..\styles\velotv-events.css"
$css = Get-Content -Raw $cssPath

function Get-CssBlock([string]$SelectorPattern) {
  $match = [regex]::Match($css, "(?s)$SelectorPattern\s*\{(?<body>.*?)\}")
  if (-not $match.Success) {
    throw "Missing CSS block matching: $SelectorPattern"
  }

  return $match.Groups["body"].Value
}

$pageBlock = Get-CssBlock '\.teams-page'
$heroBlock = Get-CssBlock '\.teams-hero'
$teamsBlock = Get-CssBlock '\.teams-page\s*>\s*\.surface:first-of-type'
$rankingBlock = Get-CssBlock '\.teams-page\s*>\s*\.surface:nth-of-type\(2\)'

foreach ($entry in @{
  'teams page' = $pageBlock
  'team section' = $teamsBlock
  'ranking section' = $rankingBlock
}.GetEnumerator()) {
  if ($entry.Value -match '(?i)\bfixed\b') {
    throw "$($entry.Key) must not use a fixed background."
  }

  if ($entry.Value -match 'var\(--teams-hero-image\)') {
    throw "$($entry.Key) must not duplicate the hero image."
  }
}

if ($pageBlock -notmatch 'background:\s*var\(--black\)') {
  throw 'Teams page must use a solid fallback background.'
}

if ($heroBlock -notmatch 'var\(--teams-hero-image\)') {
  throw 'Teams hero must retain the team image.'
}

if ($teamsBlock -notmatch 'linear-gradient') {
  throw 'Team section must use a static gradient.'
}

if ($rankingBlock -notmatch 'linear-gradient') {
  throw 'Ranking section must use a static gradient.'
}

Write-Output 'Teams lightweight background checks passed.'
```

- [ ] **Step 2: Run the test and confirm the current CSS violates the contract**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File frontend/visual/tests/teams-lightweight-background.test.ps1
```

Expected: FAIL with `teams page must not use a fixed background.`

- [ ] **Step 3: Implement the minimal CSS change**

Replace the `.teams-page` background with:

```css
.teams-page {
  width: 100%;
  gap: 0;
  padding-top: 0;
  padding-bottom: 0;
  background: var(--black);
}
```

Keep `.teams-hero` unchanged. Replace the two content-section backgrounds with:

```css
.teams-page > .surface:first-of-type {
  color: var(--white);
  background:
    linear-gradient(145deg, #241b16 0%, #171310 52%, #100e0c 100%),
    var(--black);
}

.teams-page > .surface:nth-of-type(2) {
  color: var(--white);
  background:
    linear-gradient(145deg, #181310 0%, #100e0c 58%, #0b0908 100%),
    var(--black);
  box-shadow: inset 0 18px 42px rgba(0, 0, 0, 0.24), inset 0 -22px 54px rgba(0, 0, 0, 0.30);
}
```

- [ ] **Step 4: Run all frontend visual regression tests**

Run:

```powershell
Get-ChildItem frontend/visual/tests/*.test.ps1 | ForEach-Object {
  powershell -ExecutionPolicy Bypass -File $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: Every script exits with code `0`, including `Teams lightweight background checks passed.`

- [ ] **Step 5: Build and inspect the final diff**

Run:

```powershell
dotnet build
git diff --check
git diff -- frontend/visual/styles/velotv-events.css frontend/visual/tests/teams-lightweight-background.test.ps1
git status --short
```

Expected: Build succeeds with no errors; `git diff --check` prints no errors; the diff contains only the test and the three targeted CSS blocks, while `frontend/teams.html` remains an unrelated modified file.

- [ ] **Step 6: Commit the isolated implementation**

```powershell
git add frontend/visual/styles/velotv-events.css frontend/visual/tests/teams-lightweight-background.test.ps1 docs/superpowers/plans/2026-07-13-teams-lightweight-background.md
git commit -m "perf: lighten teams page backgrounds"
```


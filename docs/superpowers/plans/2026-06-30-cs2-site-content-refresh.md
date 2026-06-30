# CS2 Site Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the CS2 frontend with a dropdown menu, clearer home scroll prompt, researched teams, researched tournament details, and credible market content.

**Architecture:** This is a static frontend update using page-local HTML plus one shared stylesheet. Research data is gathered first, then applied to the page that owns it. Shared UI behavior such as dropdown styling and modal styling lives in `frontend/visual/styles/velotv-events.css`.

**Tech Stack:** Static HTML, CSS, and small vanilla JavaScript snippets already used by the project.

## Global Constraints

- Keep all visible site copy in English.
- Preserve the existing visual identity and page structure unless a requested interaction requires a small extension.
- Use real, high-quality images for serious editorial content.
- Research current CS2 facts before changing teams, tournament, or market information.
- Avoid repeated hero/detail images across pages when a suitable alternative exists.

---

### Task 1: Shared Navigation and Home Prompt

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Consumes: existing `.nav`, `.brand`, `.menu`, `.hero`, and `.hero-copy` styles.
- Produces: reusable `.nav-dropdown`, `.nav-dropdown-menu`, and `.scroll-prompt` classes.

- [ ] **Step 1: Add dropdown markup to the home nav**

Replace the existing home `.menu` block with a dropdown containing links to `/`, `/teams.html`, `/tournament.html`, and `/market.html`.

- [ ] **Step 2: Add the home scroll prompt**

Add a prompt inside `.hero-copy` above or below the `VELO` heading:

```html
<p class="scroll-prompt">Scroll for more information</p>
```

- [ ] **Step 3: Style the dropdown and scroll prompt**

Add CSS for a compact dropdown button, dropdown panel, hover/focus open states, and an animated prompt centered near the top of the hero.

- [ ] **Step 4: Verify home behavior**

Open `/frontend/index.html` through the local site and confirm the prompt appears on page load, the dropdown opens on hover/focus/click-compatible browser behavior, and links navigate to the intended pages.

### Task 2: Team Research Application

**Files:**
- Modify: `frontend/teams.html`

**Interfaces:**
- Consumes: existing `.team-card[data-team-photo]` modal script.
- Produces: updated `data-team-photo`, `data-team-caption`, and card copy based on researched current roster information.

- [ ] **Step 1: Apply verified team data**

Update each team card with current roster-sensitive captions and real image URLs from research output.

- [ ] **Step 2: Fix Falcons and paiN**

Replace stale or generated-looking Falcons and paiN images with real team photos and conservative captions.

- [ ] **Step 3: Verify modal behavior**

Open at least Falcons, paiN, and one other team modal and confirm the image, title, caption, close button, overlay click, and Escape key still work.

### Task 3: Tournament Content and Modals

**Files:**
- Modify: `frontend/tournament.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Consumes: existing `.feature-panel`, `.photo-panel`, `.story`, `.stat-strip`, and `.market-grid` classes.
- Produces: `.tournament-modal`, `.tournament-dialog`, `.stat-button`, and page-local JavaScript for modal data.

- [ ] **Step 1: Replace placeholder tournament facts**

Update hero, main story, event image, champion image, and lower cards using researched confirmed tournament facts.

- [ ] **Step 2: Convert stat cards to buttons**

Change the three stat items into buttons with `data-modal` values: `teams`, `format`, and `playoffs`.

- [ ] **Step 3: Add tournament modal markup**

Add one reusable modal container with title and body nodes.

- [ ] **Step 4: Add modal JavaScript**

Add a page-local script that maps `teams`, `format`, and `playoffs` to HTML content, opens the modal, closes on close button, overlay click, and Escape key.

- [ ] **Step 5: Style tournament buttons and modal**

Extend the shared CSS with styles matching the existing team photo modal language.

- [ ] **Step 6: Verify tournament behavior**

Open each stat modal and confirm the content matches the selected button and closes correctly.

### Task 4: Market Content Refresh

**Files:**
- Modify: `frontend/market.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Consumes: existing `market-hero`, `market-section`, `.market-grid`, and `.story` classes.
- Produces: researched market copy and a suitable market hero image reference through CSS variable or class override.

- [ ] **Step 1: Replace generic market cards**

Update market cards with researched transfer, roster rebuild, and player-value items in English.

- [ ] **Step 2: Replace feature panel copy**

Update the lower profile/story cards with credible market context and clear rumor labeling where needed.

- [ ] **Step 3: Update market visual**

Use a relevant high-quality CS2 roster/player-market image that does not duplicate the tournament/team imagery.

- [ ] **Step 4: Verify market page**

Open the page and confirm copy fits existing cards and no image appears broken.

### Task 5: Full Verification

**Files:**
- Read: all changed frontend files

**Interfaces:**
- Consumes: final integrated changes from Tasks 1-4.
- Produces: verified final report.

- [ ] **Step 1: Run static checks**

Inspect changed files for malformed tags, duplicate IDs, broken obvious relative links, and non-English visible copy.

- [ ] **Step 2: Run local server**

Start the existing .NET or static local server and open the frontend pages.

- [ ] **Step 3: Browser-test all pages**

Use browser automation or manual inspection to check desktop and mobile widths, dropdown navigation, home prompt, team modal, tournament modals, and market layout.

- [ ] **Step 4: Report results**

Summarize changed files, verification commands, and any unresolved source uncertainty.

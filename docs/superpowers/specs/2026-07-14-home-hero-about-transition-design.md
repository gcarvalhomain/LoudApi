# Home Hero to About Transition

## Goal

Add a scroll-driven transition from the existing home hero into the existing ABOUT scroll story in `frontend/index.html`. The transition must feel like the hero-to-content dissolve in `frontend/teams.html` while leaving the current ABOUT layout, copy, reveal order, and release into the three-card hub unchanged.

## Preserved current state

- Preserve the hero image, VELO title, scroll prompt, fixed navigation, account controls, and menu behavior.
- Preserve the current local removal of the `ABOUT VELO / ARENA` eyebrow from `frontend/index.html`.
- Preserve the ABOUT heading, four information cards, English copy, reveal intervals, colors, responsive layout, reduced-motion fallback, and JavaScript-disabled fallback.
- Preserve the existing three-card hub and every section after it.

## Approaches considered

1. **Reuse `teams-*` classes directly:** smallest initial diff, but couples the home page to Teams-specific names and risks applying Teams layout rules to ABOUT.
2. **Use a one-time intersection reveal:** simpler, but it cannot reproduce the continuous hero dissolve tied to wheel progress.
3. **Add a home-specific transition wrapper and controller:** reproduces the Teams behavior while keeping hero takeover and ABOUT internal storytelling as separate phases.

Use approach 3.

## Structure

Wrap the existing hero, fixed navigation, and ABOUT section in a new `.home-intro-transition` container. Place the hero inside `.home-intro-stage`; the stage becomes sticky only when JavaScript activates `.is-intro-enhanced`. The existing `.home-about-scroll` remains the incoming surface and keeps its own internal sticky stage.

The navigation remains fixed and functionally unchanged. The three-card hub remains outside the transition wrapper so normal document flow resumes after ABOUT finishes.

## Phase 1: hero to ABOUT

Across the first viewport of downward scrolling:

1. Keep the hero stage fixed behind the incoming content.
2. Scale the hero from `1` to `1.025`.
3. Increase hero blur from `0px` to `16px`.
4. Reduce hero brightness from `1` to `0.58`.
5. Reduce hero opacity from `1` to `0`.
6. Move ABOUT from `10vh` below its natural position to `0`.
7. Reduce ABOUT's leading mask feather from `30vh` to `0` while its upper shadow remains visible.

The values intentionally match the visual rhythm of the Teams transition without sharing Teams-specific selectors.

## Phase 2: existing ABOUT story

The existing ABOUT controller continues to calculate progress from the ABOUT section itself. Its first reveal interval begins only after ABOUT reaches the top of the viewport, which is when the hero-to-ABOUT transition is practically complete. Existing cumulative reveals remain unchanged: heading, origin, purpose, project context, and ecosystem stay visible after appearing.

The two phases use separate CSS custom properties and activation classes so the new intro transition cannot overwrite `--about-progress`, `--about-panel-shift`, `--about-panel-feather`, or the per-item reveal variables.

## Implementation boundary

- Extend `frontend/visual/scripts/home-about-scroll.js` with pure intro-progress calculation and a dedicated `initHomeIntroTransition` controller.
- Add home-specific transition styles to `frontend/visual/styles/velotv-events.css`.
- Add only the wrapper/stage classes required in `frontend/index.html`; do not restore or change ABOUT copy.
- Update the asset cachebuster so browsers receive the new styles and script.
- Do not add external dependencies.

## Accessibility and resilience

- With `prefers-reduced-motion: reduce`, do not activate the intro transition; show hero followed by ABOUT in normal flow.
- With JavaScript disabled, keep hero and ABOUT readable in normal flow.
- Do not hide focusable controls or change navigation stacking.
- Decorative masks and shadows must not capture pointer events or enter the accessibility tree.

## Verification

- Test intro progress clamping and exact start/mid/end visual values.
- Confirm the wrapper contains hero and ABOUT, while the three-card hub remains after it.
- Confirm the existing ABOUT reveal intervals and copy are unchanged, including the local eyebrow removal.
- Confirm no `teams-*` class is added to `frontend/index.html`.
- Confirm normal-flow fallbacks without JavaScript and with reduced motion.
- Confirm the home page, stylesheet, and controller are served successfully.
- Run the existing ABOUT tests and the project Release build with no errors.

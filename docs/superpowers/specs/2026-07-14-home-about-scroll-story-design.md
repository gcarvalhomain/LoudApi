# Home About Scroll Story

## Goal

Add an English-language ABOUT section to `frontend/index.html` between the opening hero and the existing three-card hub. The section must reveal its information progressively as the user scrolls, then return the page to its normal document flow once all ABOUT content is visible.

## Existing content boundaries

- Keep the opening hero image, title, scroll prompt, and fixed navigation unchanged.
- Place ABOUT immediately after the hero and before the Teams, Tournament, and Market cards.
- Keep the existing three-card hub, scene activity, footer panel, account modals, and their behavior unchanged.
- Reuse the project's dark brown, bronze, cream, typography, shadow, and border language.

## Content

All visible copy must be in English.

1. **Identity:** `ABOUT VELO` introduces the project as an editorial CS2 arena.
2. **Creator and date:** `Founded by Gabriel Carvalho` and `Established in 2022`.
3. **Purpose:** Explain that VELO brings teams, tournaments, players, roster movement, and competitive context into one focused destination.
4. **Project context:** Explain that the project turns scattered Counter-Strike 2 information into a fast, visual, and accessible editorial experience.
5. **Ecosystem:** Present Valve, ESL, BLAST, and HLTV as ecosystem references rather than claim official commercial partnerships.

## Layout

ABOUT uses a full-viewport sticky stage inside a taller scroll container of approximately three viewport heights. On wide screens, the large editorial title occupies the left side while the information sequence occupies the right side. On narrow screens, the title and information stack vertically in the same reading order.

The section background uses the existing dark palette with restrained bronze accents, cream text, thin borders, and a soft leading-edge shadow. It must look like a native continuation of the current VELO visual system, not a separate theme.

## Scroll behavior

1. The home page initially shows the existing hero unchanged.
2. As ABOUT reaches the viewport, its surface enters with a soft top mask, shadow, and slight vertical movement inspired by `frontend/teams.html`.
3. Scroll progress within the ABOUT container controls the information sequence.
4. Each information group transitions from low opacity, downward offset, and light blur to fully visible and sharp.
5. Revealed groups remain visible; the sequence is cumulative rather than replacing previous content.
6. At the end of the scroll range, every ABOUT group is visible at the same time.
7. The sticky stage then releases, and the existing three-card hub continues in normal document flow.

JavaScript updates CSS custom properties through a single `requestAnimationFrame`-throttled scroll handler. Progress values are clamped between zero and one, and each content group receives a defined progress interval so the reveals cannot overlap unpredictably.

## Accessibility and resilience

- With `prefers-reduced-motion: reduce`, disable the sticky scroll choreography and show all ABOUT content immediately in normal flow.
- Keep semantic headings and readable source order.
- Decorative transition layers must not capture pointer events or be exposed to assistive technology.
- The section must remain readable if JavaScript is unavailable; enhanced hidden states are enabled only after JavaScript adds an activation class.
- Do not add external animation dependencies.

## Verification

- Confirm ABOUT is positioned between the hero and three-card hub.
- Confirm every visible ABOUT string is English.
- Confirm creator, date, purpose, context, and ecosystem references are present.
- Confirm scroll progress reveals the groups cumulatively and releases into the cards.
- Confirm the hero, fixed navigation, three cards, later sections, and modal behavior remain functional.
- Confirm desktop, narrow viewport, reduced-motion, and JavaScript-disabled fallbacks remain readable.
- Run the project build and targeted structural/behavior checks with no errors.

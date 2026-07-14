# Teams Page Lightweight Background Design

## Objective

Reduce the rendering cost while scrolling `frontend/teams.html` without changing its content, navigation, cards, ranking tables, or modals.

## Chosen Approach

Keep the existing team image only in the full-height hero. Replace the backgrounds of the remaining teams sections with static CSS gradients and a solid-color fallback. Remove the page-level and ranking-section `background: fixed` image layers.

## Alternatives Considered

1. A single fixed pseudo-element for the whole page would avoid duplicate images but could still trigger expensive compositing or repainting on mobile browsers.
2. A fully solid background would be the cheapest option but would remove more of the page's visual identity than necessary.

## Visual Design

- The hero retains `--teams-hero-image`, its current focal position, and dark overlays for readable text.
- The team section uses a dark brown-to-black static gradient that complements the bronze accents.
- The ranking section uses a slightly darker static gradient to preserve separation between sections.
- The footer remains solid black.
- Existing card, table, hover, focus, and modal styles remain unchanged.

## Performance Constraints

- Do not use `background-attachment: fixed` or the `fixed` background shorthand on `.teams-page` or its content sections.
- Do not duplicate the hero image outside `.teams-hero`.
- Do not add scroll listeners, JavaScript parallax, backdrop filters, or continuous background animation.
- Prefer opaque or near-opaque gradients so the browser can paint stable section layers.

## Verification

- Add a regression check that confirms the teams page and its sections contain no fixed background and that `--teams-hero-image` is used only by the hero selector.
- Run all existing frontend visual regression scripts.
- Build the application.
- Inspect desktop and mobile layouts when a browser surface is available, confirming readable text, correct section separation, no horizontal overflow, and smooth scrolling.


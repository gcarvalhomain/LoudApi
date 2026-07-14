# Home scroll transition

## Goal

Reproduce in `frontend/index.html` the existing scroll transition from `frontend/teams.html` between the opening hero and the next content block.

## Scope

- Treat the VELO hero as the opening stage.
- Treat the three image cards for Teams, Tournament, and Market as the incoming block.
- Reuse the transition classes and scroll-progress behavior already defined for the Teams page.
- Keep the fixed navigation, scene activity, footer panel, modals, and their behavior unchanged.
- Respect `prefers-reduced-motion` by showing the content without the enhanced transition.

## Behavior

At the top of the page, the hero is fully visible. During the first viewport of downward scrolling, the hero gradually fades, darkens, blurs, and scales slightly. At the same time, the three image cards move upward and become visible through a soft vertical mask with a shadow at their leading edge. The animation progress follows the scroll position and is updated with `requestAnimationFrame`.

## Implementation

Wrap the hero and the three-card hub in the existing transition structure used by `teams.html`, while leaving the fixed navigation functionally unchanged. Add the same guarded scroll-progress script to `index.html`, using the existing CSS custom properties. No new visual system or unrelated refactor is required.

## Verification

- Confirm the page structure contains the transition wrapper, stage, and incoming-card class.
- Confirm the scroll handler updates all transition custom properties.
- Confirm reduced-motion users do not receive the enhanced scroll handler.
- Load the home page and verify the hero-to-card transition at desktop and narrow viewport sizes.

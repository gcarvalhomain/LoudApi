# Site Content Block Standardization Design

## Goal

Restore VELO's visual identity where major content areas currently appear as loose white bands, without changing the global page background or redesigning individual cards.

## Scope

- Standardize the major content containers in `index.html`, `teams.html`, `market.html`, and `tournament.html`.
- Wrap the three HOME navigation cards in a full-width branded content block.
- Reuse the same brown, bronze, and gold visual language on existing large `surface` and `feature-panel` areas.
- Add scroll-driven transitions from the Tournament and Market heroes into their first content blocks, matching the established HOME and Teams interaction.
- Preserve all content, links, modal behavior, card imagery, existing internal animations, and responsive layouts.

## Visual System

The document background remains unchanged. Only major content blocks receive a shared branded shell: a dark brown/bronze gradient, subtle gold border and shadow, and controlled internal padding. Cards keep their current imagery and contrast. White space between major sections becomes intentional spacing owned by the adjacent branded block instead of an unstyled full-width white strip.

Page-specific selectors may adjust density, but they must derive from shared color and spacing tokens so all four pages remain consistent.

## Tournament and Market Transitions

Each page's hero and first content section will be grouped in a dedicated intro-transition wrapper. During the first viewport of downward scrolling, the hero remains visually anchored while it slightly scales, darkens, blurs, and fades. The first content block rises with a soft masked edge. Once progress reaches 100%, the rest of the page resumes normal document flow.

The implementation will use shared inner-page transition behavior with page-specific wrappers, avoiding coupling to Home or Teams. `prefers-reduced-motion: reduce` will disable the scroll enhancement and preserve normal readable flow.

## Verification

- Structural tests confirm the shared branded containers are applied to all four pages.
- Transition tests confirm progress clamping, CSS-variable updates, and reduced-motion fallback for Tournament and Market.
- Existing Home and Teams transition tests remain green.
- `dotnet build -c Release` must complete without errors.
- Manual review checks desktop and mobile spacing, card contrast, and both new scroll handoffs.

## Non-goals

- Changing the global page background.
- Recoloring every individual card.
- Rewriting page content or navigation.
- Changing the existing Home and Teams transition behavior.

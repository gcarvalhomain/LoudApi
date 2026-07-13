# Teams Page Fixed Background Design

## Objective

Update `frontend/teams.html` so the large image currently used behind the "TOP TIER S TEAMS" section becomes the fixed visual background for the entire teams page, including the "TOP RANKING" section. The page must remain smooth while scrolling and preserve readable content on desktop and mobile.

## Chosen Approach

Create a dedicated fixed pseudo-element on `.teams-page` instead of relying on `background-attachment: fixed`. The pseudo-element stays behind the page content, uses `--teams-hero-image`, and is isolated from the scrolling document content.

This approach avoids repeating the same large image across sections and reduces the rendering problems commonly caused by fixed background attachment, especially on mobile browsers.

## Visual Design

- Use `--teams-hero-image` as the single page background.
- Cover the viewport with the image using `background-size: cover` and a centered focal position.
- Add a dark layered overlay to preserve contrast behind headings, cards, tables, and notes.
- Remove the separate map wallpaper currently used behind "TOP RANKING".
- Give the team and ranking sections restrained translucent dark surfaces so the shared image remains visible without reducing legibility.
- Keep the existing bronze, white, and team-color accents.
- Concentrate motion on useful feedback: subtle title entrance, card hover/focus lift, and ranking-row feedback.
- Avoid continuous JavaScript parallax or scroll listeners.

## Structure And Behavior

- `.teams-page` establishes the stacking context for the fixed background layer.
- `.teams-page::before` renders the fixed image and dark overlay behind all page sections.
- Direct page content remains above the background through a stable stacking order.
- The hero and both content sections use transparent or semi-transparent overlays rather than separate full background images.
- The navigation and modal retain their existing fixed positioning and remain above the page content.

## Responsive And Accessibility Requirements

- The fixed pseudo-element covers `100vw` by `100vh` and does not intercept pointer input.
- Mobile layouts retain a stable background without `background-attachment: fixed`.
- Text and table content meet readable contrast against the image.
- Existing keyboard focus behavior remains visible.
- `prefers-reduced-motion: reduce` disables new entrance and movement effects while keeping the visual hierarchy intact.

## Verification

- Open the teams page at desktop and mobile viewport sizes.
- Scroll from the hero through "TOP TIER S TEAMS" and "TOP RANKING" and confirm the background stays stationary without visible lag.
- Confirm that the old ranking map wallpaper no longer appears.
- Check that headings, cards, ranking tables, notes, navigation, and modal remain readable and correctly layered.
- Confirm hover and keyboard focus states work and no horizontal overflow is introduced.

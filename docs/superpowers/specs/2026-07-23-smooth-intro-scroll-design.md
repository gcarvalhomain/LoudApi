# Smooth Intro Scroll Design

## Goal

Make the first-image-to-content transition on `index.html`, `teams.html`,
`market.html`, and `tournament.html` feel lighter and smoother with a mouse
wheel or scrollbar, while preserving the current images, shadows, layout,
direction, scale, blur, brightness, and start/end states.

## Current behavior and cause

Each transition derives its visual progress directly from the current scroll
position. A mouse wheel changes that position in discrete steps, so the visual
properties also jump between values. The transition simultaneously updates
full-screen opacity, scale, blur, brightness, mask, translation, and shadow,
which can reinforce the impression of a heavy movement.

The existing use of `requestAnimationFrame` prevents duplicate work within one
browser frame, but it does not interpolate between two wheel positions. It
therefore limits update frequency without making the motion continuous.

## Chosen approach

Use frame-rate-independent adaptive interpolation between a target scroll
progress and the progress rendered on screen.

- Scroll and resize events update the target progress.
- A `requestAnimationFrame` loop moves the rendered progress toward the target.
- The interpolation uses elapsed time, so it has a consistent feel on 60 Hz,
  120 Hz, and other refresh rates.
- A short, responsive settling window smooths wheel steps without creating a
  conspicuous delayed response.
- Large differences catch up more decisively; small differences settle gently.
- The loop stops once the rendered and target values are visually equivalent,
  avoiding permanent background animation work.

The progress remains clamped from `0` to `1`, never overshoots, and reaches the
same exact initial and final visual states as today.

## Structure

Introduce one small shared scroll-progress smoothing module under
`frontend/visual/scripts/`. It will own only the following concerns:

- clamping progress;
- calculating a time-based interpolation step;
- managing target and rendered progress;
- starting and stopping the animation-frame loop.

The existing page-specific modules will remain responsible for translating
progress into their current opacity, scale, blur, brightness, shift, and
feather values.

- `home-about-scroll.js` will use the shared smoother for the home intro.
- `inner-page-intro-transition.js` will use it for Market and Tournament.
- the Teams intro will use the same shared mechanism instead of maintaining a
  separate direct-scroll implementation.

The later About-section reveal on the home page is outside this change unless
testing shows that it exhibits the same first-transition defect. The requested
scope is the transition from the first hero image into the next image/content
area.

## Data flow

```text
wheel or scrollbar movement
        ↓
target progress from page scroll position
        ↓
shared time-based smoothing
        ↓
rendered progress (continuous, clamped, no overshoot)
        ↓
existing page-specific visual-state calculation
        ↓
existing CSS custom properties and visuals
```

## Performance adjustments

The element's document start position and the viewport-based transition
distance will be cached and recalculated on initialization and resize. Normal
animation frames will use the current scroll position rather than repeatedly
querying layout geometry.

CSS custom properties will be written only while the animation is moving or
when a resize requires recalculation. The existing maximum blur, brightness,
scale, masks, and shadows will not be reduced in the initial implementation,
because preserving the visual is an explicit requirement.

If browser verification exposes an actual frame-rate problem after scroll
interpolation is added, filter rendering will be profiled separately rather
than silently changing the design.

## Interaction and accessibility

- Mouse wheel and scrollbar dragging use the same rendering path.
- Rapid direction changes retarget the active interpolation without restarting
  from an old state.
- Reaching either boundary settles exactly at `0` or `1`.
- `prefers-reduced-motion: reduce` continues to disable the enhanced motion.
- Resizing the viewport recalculates geometry without leaving the animation in
  an invalid intermediate state.

## Verification

Automated tests will cover:

- clamping below `0` and above `1`;
- monotonic convergence toward the target;
- no overshoot in either direction;
- comparable timing across different simulated frame intervals;
- exact settling at transition boundaries;
- continued visual-state values at progress `0` and `1`;
- initialization on all four pages;
- reduced-motion behavior.

Browser verification will check all four pages with:

- several single mouse-wheel notches;
- continuous faster wheel movement;
- slow scrollbar dragging;
- reversing direction during the transition;
- desktop and narrow viewport sizes.

Success means the transition no longer advances in visible steps, begins
responding immediately, settles without elastic bounce, and remains visually
the same at rest and at completion.

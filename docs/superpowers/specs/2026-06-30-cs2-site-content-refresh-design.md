# CS2 Site Content Refresh Design

## Goal

Refresh the VELO CS2 frontend with clearer navigation, a stronger home-page scroll prompt, real team and tournament imagery, credible current English content, and modal interactions for tournament details.

## Scope

- Keep all visible site copy in English.
- Preserve the existing visual identity and page structure unless a requested interaction requires a small extension.
- Use real, high-quality images for serious editorial content.
- Research current CS2 facts before changing teams, tournament, or market information.
- Avoid repeated hero/detail images across pages when a suitable alternative exists.

## Home Page

`frontend/index.html` gets a bottom navigation dropdown labeled `Explore`. The dropdown will link to the main pages: Home, Teams, Last Tournament, and Market. The existing brand remains. The home hero receives a centered animated prompt near the top: `Scroll for more information`. The prompt must appear every time the home page is loaded, including after returning from another project page.

## Teams Page

`frontend/teams.html` keeps its card grid and modal behavior. Each team card should reference current or defensibly recent roster information and a real team photo. Falcons and paiN need special attention because the current Falcons image is suspected stale and paiN must not use generated imagery. If a source is not definitive, the caption should avoid claiming exact current roster status.

## Tournament Page

`frontend/tournament.html` should stop using placeholder tournament copy. It should describe the most appropriate latest world-level CS2 tournament as of June 30, 2026, based on research. The main visual should be a real event image. The champion visual must be a real photo of the winning team celebrating with the trophy, not a logo.

The three compact tournament cards become buttons:

- Teams: opens a modal with participating teams ordered by final placement.
- Format: opens a modal explaining the tournament format.
- Playoffs: opens a modal listing playoff teams.

The lower cards should contain relevant facts such as champion, MVP, prize pool, final score, venue, and notable storyline.

## Market Page

`frontend/market.html` keeps the existing layout and style but replaces generic copy with credible player-market content. Content may include confirmed transfers, roster rebuilds, market pressure, credible rumors, and salary/value notes only when sources are reliable. Rumors must be labeled clearly.

## Implementation Boundaries

- `frontend/index.html`: home markup and dropdown content.
- `frontend/teams.html`: team data, captions, image URLs, and possibly team copy.
- `frontend/tournament.html`: tournament content, modals, and modal script.
- `frontend/market.html`: market content and image/content references.
- `frontend/visual/styles/velotv-events.css`: shared dropdown, scroll prompt, tournament modal, and minor responsive styling.

## Verification

- Manually inspect all changed pages in a browser or local static server.
- Verify dropdown navigation works from every page.
- Verify the home scroll prompt appears on fresh page load and after returning to the home page.
- Verify team photo modals still open and close.
- Verify tournament modals open, close, and remain keyboard accessible.
- Confirm no image URL is obviously broken from static inspection and browser loading.
- Keep the final result in English.

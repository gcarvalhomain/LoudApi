const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const frontendRoot = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(frontendRoot, "teams.html"), "utf8");
const css = fs.readFileSync(
  path.join(frontendRoot, "visual", "styles", "velotv-events.css"),
  "utf8",
);

test("isolates the hero transition before TOP RANKING", () => {
  const transitionStart = html.indexOf('<div class="teams-intro-transition">');
  const hero = html.indexOf('<section class="page-hero teams-hero">');
  const overview = html.indexOf('<section class="surface teams-overview">');
  const transitionEnd = html.indexOf("<!-- /teams-intro-transition -->");
  const ranking = html.indexOf('<section class="surface player-ranking-section"');

  assert.ok(transitionStart >= 0, "transition container should exist");
  assert.ok(transitionStart < hero, "transition should start before the hero");
  assert.ok(hero < overview, "overview should follow the hero");
  assert.ok(overview < transitionEnd, "overview should remain inside transition");
  assert.ok(transitionEnd < ranking, "TOP RANKING should remain outside transition");
});

test("defines sticky crossfade styles and a reduced-motion fallback", () => {
  assert.match(css, /\.teams-intro-transition\s*\{[^}]*--hero-transition-progress:/s);
  assert.match(css, /\.teams-intro-stage\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.teams-overview\s*\{[^}]*translateY\(var\(--teams-overview-shift\)\)/s);
  assert.match(css, /\.teams-hero\s*\{[^}]*opacity:\s*calc\(/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.teams-intro-transition/s);
});

test("updates scroll progress through requestAnimationFrame", () => {
  assert.match(html, /const introTransition = document\.querySelector\("\.teams-intro-transition"\)/);
  assert.match(html, /getBoundingClientRect\(\)/);
  assert.match(html, /style\.setProperty\("--hero-transition-progress"/);
  assert.match(html, /requestAnimationFrame\(/);
  assert.match(html, /addEventListener\("scroll", scheduleIntroTransitionUpdate, \{ passive: true \}\)/);
});

test("dissolves the incoming edge while the hero blurs and darkens", () => {
  assert.match(css, /--hero-transition-blur:\s*0px/);
  assert.match(css, /--hero-transition-brightness:\s*1/);
  assert.match(css, /--teams-overview-feather:\s*0/);
  assert.match(css, /filter:\s*blur\(var\(--hero-transition-blur\)\)\s*brightness\(var\(--hero-transition-brightness\)\)/);
  assert.match(css, /-webkit-mask-image:\s*linear-gradient\([\s\S]*var\(--teams-overview-feather\)/);
  assert.match(css, /mask-image:\s*linear-gradient\([\s\S]*var\(--teams-overview-feather\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*filter:\s*none[\s\S]*mask-image:\s*none/);

  assert.match(html, /style\.setProperty\("--hero-transition-blur"/);
  assert.match(html, /style\.setProperty\("--hero-transition-brightness"/);
  assert.match(html, /style\.setProperty\("--teams-overview-feather"/);
});
